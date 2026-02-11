# Chapter 6: Supabase Queries and Data Operations
## Talking to Your Database Without Writing Raw SQL

### Introduction

Welcome to Chapter 6. Last chapter you learned SQL, the language databases speak. And you learned about authentication and RLS, which controls who can access what. This chapter is about the bridge between your application code and the database: the Supabase client library.

You could write raw SQL strings in your code and send them to the database. And sometimes that's the right approach. But for most operations, Supabase provides a query builder that lets you express database queries using TypeScript method chains. Instead of writing "SELECT name, absolute_value FROM signals WHERE org_id equals abc123 ORDER BY created_at DESC LIMIT 10," you write it as a chain of method calls: from signals, select name and absolute_value, eq org_id abc123, order created_at descending, limit 10.

The advantage is that the query builder integrates with TypeScript's type system. If you try to filter by a column that doesn't exist, TypeScript catches it. If you try to order by a non-existent column, TypeScript catches it. The query builder also handles SQL injection protection automatically, meaning malicious input from a user can't corrupt your queries. This is security you get for free.

### The Query Builder Pattern

Every Supabase query starts with the client's from method, which specifies the table. From there, you chain methods to build the query.

Select specifies which columns to return. If you call select with a star or no argument, you get all columns. If you specify column names, you get only those columns. Selecting fewer columns means less data transferred, which means faster queries.

After select, you add filters. The eq method filters for exact matches: eq of "org_id" and the value means WHERE org_id equals that value. The neq method is the opposite: not equal to. The gt method means greater than. The lt method means less than. The gte and lte methods mean greater than or equal to and less than or equal to.

The in method filters for multiple values: in of "status" and an array of "active" and "pending" means WHERE status IN those values. The like method does pattern matching: like of "name" and "Pipeline percent" means WHERE name starts with "Pipeline."

You can chain multiple filters, and they combine with AND logic. If you need OR logic, Supabase provides an or method where you pass the conditions as a string.

After filters, you can sort with order, limit with limit, and paginate with range.

The whole chain reads like a sentence: from signals, select all columns, where org_id equals this value, order by created_at descending, limit 10. This readability is a major advantage over raw SQL for everyday queries.

### The Data-Error Pattern

Every Supabase query returns an object with two properties: data and error. This is a pattern you'll see throughout the Camino codebase, and it's important to handle it correctly.

When a query succeeds, data contains the results and error is null. When a query fails, data is null and error contains an object describing what went wrong. You should always check for the error before using the data.

The most common mistake is ignoring the error. If you destructure only data and assume it's always there, your app will crash when the database is down, when RLS blocks the query, or when there's a network error. Always check: if error exists, handle it. Log it. Show a message to the user. Return early from the function. Don't proceed with null data.

In Camino's services, you'll see this pattern repeatedly. The signals service queries for signals, checks for an error, and if there's an error, throws or returns an empty result. The interpretation service queries for interpretations with the same pattern. This defensive coding prevents a database hiccup from crashing the entire app.

### Selecting Relationships

One of Supabase's most powerful features is the ability to query related data in a single request. In SQL, you'd write a JOIN. In the Supabase query builder, you do it with nested select syntax.

Say you want to load signals with their data points. Instead of making two separate queries, one for signals and one for data points, you write: from signals, select "star, data_points(star)." The nested parentheses tell Supabase to follow the foreign key relationship and include the related data points for each signal.

This works because the database knows about the relationships. The data_points table has a signal_id column that references the signals table's id column. Supabase reads this foreign key and knows how to join the tables.

You can also select specific columns from the related table: select "name, absolute_value, data_points(value, recorded_at)." This returns each signal's name and value, plus only the value and date from each related data point.

This nested select pattern replaces what would be multiple SQL JOIN queries and multiple round trips to the database. One request, all the data you need. In Camino, this could be used to load a signal with its AI interpretation in a single query, rather than loading the signal and then making a separate request for the interpretation.

### Inserting Data

To add new rows, you use the insert method. You pass an object or array of objects matching the table's columns.

For a single row: from signals, insert an object with name, absolute_value, trend_direction, org_id, and their values. For multiple rows, pass an array of objects. Supabase inserts all of them in a single database operation, which is much faster than inserting one at a time.

After inserting, you often want to get the inserted data back, especially if the database generated values like an auto-incrementing id or a default created_at timestamp. Chain select after insert to return the inserted rows: from signals, insert the object, select star. The response will include the full row with all database-generated values.

In Camino, the signal generation pipeline inserts multiple signals at once after processing an upload. Using a bulk insert with an array is important for performance. If the pipeline generates 10 signals, one insert with 10 objects is much faster than 10 separate inserts.

### Upserting Data

Upsert is a combination of insert and update. It means "insert this row, but if a row with the same unique key already exists, update it instead." This is incredibly useful for the signal pipeline.

Consider the scenario: a user uploads deals data and the system generates a "Pipeline Value" signal. A week later, the user uploads new deals data. You want to update the existing "Pipeline Value" signal with the new value, not create a duplicate. Upsert handles this automatically.

You call upsert the same way as insert, but you also specify which column to use for the conflict check, typically the primary key or a unique constraint. If a row with that key exists, it gets updated. If not, a new row is created.

In Camino, upsert is the right tool for refreshing signals. When new data arrives, whether from an upload or an API integration, the pipeline can upsert signals by their unique combination of name, data_type, and org_id. Existing signals get updated values. New signals get created.

### Updating Data

For explicit updates, you use the update method with filters. From signals, update with new values, eq id to the specific signal's id. This updates only the row matching that id.

You can update multiple columns at once by including them all in the update object. You can also update multiple rows at once by using broader filters. For example, from signals, update trend_direction to "stable," eq org_id to the organisation's id. This sets every signal for that org to "stable" in one operation.

Like with SQL, the filter is critical. Without a filter, you'd update every row in the table. The Supabase client does require you to specify at least one filter on update and delete operations, which is a safety net. But you should still be deliberate about which rows you're targeting.

### Deleting Data

Delete works like update but removes rows: from signals, delete, eq id to the signal's id. This removes that specific signal. Again, filters are essential.

In practice, Camino might use soft deletes rather than hard deletes, adding a deleted_at timestamp to the row instead of removing it. This allows recovery if something is deleted by mistake. The signals page query would then include a filter like "is deleted_at null" to exclude soft-deleted signals.

### Error Handling Best Practices

Let me spend a moment on error handling because it's where many applications fail. When a Supabase query returns an error, the error object contains a message, a code, and sometimes details and hints.

Common errors you'll encounter in Camino include: "Row level security" errors when a user tries to access data they shouldn't see. This means the RLS policy is working correctly, blocking unauthorised access. Your app should handle this gracefully, showing a "no data found" message rather than an error.

Foreign key constraint errors when you try to insert a signal with a non-existent org_id. This means the organisation doesn't exist yet. Your app should ensure the organisation is created before inserting signals.

Unique constraint errors when you try to insert a duplicate row. This is where upsert would be the right approach instead of insert.

Network errors when the database is unreachable. These are transient and usually resolve on retry. Your app should retry once or twice before showing an error to the user.

For each error type, the right response is different. RLS errors mean the request was unauthorised. Constraint errors mean the data is invalid. Network errors mean the connection failed. Handling them all the same way, showing a generic "something went wrong," is lazy and unhelpful. Handling each type specifically gives the user, or the admin, useful information about what happened and what to do.

### Real-Time Subscriptions

Supabase has a real-time feature that pushes database changes to the browser as they happen. Instead of the browser polling the database every few seconds to check for new data, the database notifies the browser when something changes.

For Camino, this could mean: when the admin uploads new data and the pipeline generates new signals, the exec's signals page updates automatically without a page refresh. The exec is looking at their signals, a new one appears, and the trends on existing ones update. It feels alive.

Real-time subscriptions use channels. You subscribe to changes on a specific table with specific filters: "I want to know when any signal for org_id abc123 is inserted, updated, or deleted." The browser maintains an open connection and receives events as they occur.

This is a Tier 2 feature for Camino. It's not needed for the billing gate. But understanding that it exists and how it works means you can plan for it. The architecture doesn't need to change; you just add a subscription on top of the existing query pattern.

### Performance Considerations

As your data grows, query performance matters. A few patterns to keep in mind.

Select only the columns you need. If the signals page only shows name, value, and trend, don't select all 20 columns. Less data means faster queries.

Use indexes for columns you filter and sort by. Supabase lets you create indexes through the SQL editor or the dashboard. If the signals page always filters by org_id and sorts by created_at, indexes on both columns will keep the query fast as the table grows.

Paginate large result sets. Don't load all 500 signals at once if the user only sees 10 on screen. Use limit and offset, or cursor-based pagination, to load data in chunks.

Avoid the N+1 query problem. This is when you load a list of items and then make a separate query for each item's related data. If you load 50 signals and then make 50 separate queries for their interpretations, that's 51 total queries. Use the nested select pattern instead to load everything in one query.

### Explain It Like I'm 12

The Supabase query builder is like talking to a really smart librarian. Instead of learning the library's internal cataloguing system, which is SQL, you can just say things in a way that's natural to you.

You say "from the signals shelf, find me the ones where organisation equals mine, sort them newest first, and give me the first ten." The librarian translates that into the library's system, finds the right books, and hands them to you.

The librarian also checks your library card, that's the JWT, to make sure you're allowed to access those books. If you ask for books from a section you don't have access to, the librarian politely says "no results found" instead of showing you someone else's books.

The data and error pattern is like the librarian saying "here are your books" when everything goes well, or "sorry, I couldn't find that shelf" when something goes wrong. You should always listen to both responses, because ignoring the "sorry" message and assuming you got books will lead to a mess.

And the best part: when you describe what you want using the query builder, the system makes sure nobody can sneak in fake requests. It's like the librarian checking that every book request form is properly filled out and hasn't been tampered with, automatically. That's SQL injection protection, and you get it for free.
