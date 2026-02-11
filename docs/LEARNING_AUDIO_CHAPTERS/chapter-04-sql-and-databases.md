# Chapter 4: SQL and Database Fundamentals
## Where Your Data Lives and How to Ask For It

### Introduction

Welcome to Chapter 4. This is where things get concrete. TypeScript is the language you write in. React is how you build screens. Next.js decides where code runs. But none of that matters without data. Your signals, your users, your organisations, your uploaded files, they all live in a database. And the way you talk to a database is SQL, which stands for Structured Query Language.

Camino uses two databases. Supabase, which is a PostgreSQL database, handles authentication and some of the application data. Neon, which is also PostgreSQL, stores signals, data points, and the signal calculation data. Both speak the same language: SQL. Learn SQL once, and you can talk to both.

Why two databases? It's a pragmatic decision. Supabase comes with built-in authentication, row-level security, and a nice dashboard. Neon is fast and serverless, great for the signal calculation pipeline that needs to read and write lots of data quickly. Each database does what it's best at.

But here's the important thing: SQL is not a programming language in the way TypeScript is. It's a query language. You don't write loops or if statements. You describe what data you want, and the database figures out how to get it. It's declarative, like telling a librarian "I want all books about cooking published after 2020" instead of telling them "go to shelf A, check each book, if it's about cooking, check the year, if it's after 2020, put it in the pile."

### Tables, Rows, and Columns

A database is made up of tables. A table is like a spreadsheet. It has columns, which are the categories of information, and rows, which are individual entries.

In Camino's Supabase database, you have a profiles table. Each row is a user. The columns include id, email, full_name, role, org_id, upcoming_priorities, and signal_preferences. You have an organisations table. Each row is a company. The columns include id, name, industry, and company_stage. You have a signals table. Each row is a signal like "Pipeline Value" or "Ticket Volume." The columns include id, name, absolute_value, trend_direction, trend_percentage, and more.

The key concept is that each table represents one type of thing. The profiles table only contains user information. The signals table only contains signal information. You don't mix users and signals in the same table. This separation is what makes databases powerful and predictable.

Every table should have a primary key, a column that uniquely identifies each row. In Camino, this is usually a column called "id" which contains a UUID, a long random string that's guaranteed to be unique. No two signals will ever have the same id. This means you can always find a specific signal by asking for the row with that exact id.

### SELECT: Reading Data

The most common thing you do with a database is read data. The SELECT statement is how you ask for it.

The simplest SELECT reads everything from a table: "SELECT star FROM signals." The star means all columns. This returns every signal in the database, with all their data. It's like asking the librarian for every book in the library.

You almost never want everything. You narrow it down. To get specific columns: "SELECT name, absolute_value FROM signals." This returns only the name and value of each signal, ignoring all the other columns. It's faster because the database sends less data.

To get specific rows, you add a WHERE clause: "SELECT name, absolute_value FROM signals WHERE org_id equals 'abc123'." This returns only the signals belonging to one organisation. The WHERE clause is a filter. Only rows that match the condition come back.

You can combine multiple conditions: "SELECT name, absolute_value FROM signals WHERE org_id equals 'abc123' AND trend_direction equals 'up'." This returns only the signals for that org that are trending upward. AND means both conditions must be true. OR means either condition can be true.

You can also sort the results: "SELECT name, absolute_value FROM signals WHERE org_id equals 'abc123' ORDER BY absolute_value DESC." The ORDER BY clause sorts the results. DESC means descending, so the highest values come first. ASC would mean ascending, lowest first.

And you can limit how many results you get: "LIMIT 10" at the end means "give me the first 10 results." This is important for performance. If an organisation has a thousand signals, you don't want to load all of them when you only need the top 10.

### INSERT: Adding Data

When your upload pipeline generates a new signal, it needs to save it to the database. INSERT is the statement for adding new rows.

An INSERT statement names the table, lists the columns, and provides the values: "INSERT INTO signals (id, name, absolute_value, trend_direction, org_id) VALUES ('signal-123', 'Pipeline Value', 250000, 'up', 'org-abc')."

Each value corresponds to a column in the same order they're listed. The database creates a new row with those values. If you try to insert a row with an id that already exists, and the id column is a primary key, the database rejects it. This prevents duplicate entries.

In Camino, signals are inserted after the calculation pipeline runs. The generate API route computes the signal values, then inserts them into the database. This is the moment where a calculated number becomes a persisted signal that the user can see on their signals page.

### UPDATE: Changing Data

When data needs to change, UPDATE modifies existing rows. The syntax names the table, specifies what to change, and filters which rows to change: "UPDATE signals SET absolute_value equals 275000, trend_direction equals 'up' WHERE id equals 'signal-123'."

The SET clause says what to change. The WHERE clause says which rows to change. The WHERE clause is critical. If you forget it, every row in the table gets updated. That's catastrophic. "UPDATE signals SET trend_direction equals 'stable'" without a WHERE clause would set every signal's trend to stable. Always, always include a WHERE clause with UPDATE.

In Camino, updates happen when signals are refreshed. When new data is uploaded and the pipeline recalculates, the existing signals are updated with new values rather than creating duplicate entries.

### DELETE: Removing Data

DELETE removes rows from a table: "DELETE FROM signals WHERE id equals 'signal-123'." Like UPDATE, the WHERE clause is essential. "DELETE FROM signals" without WHERE deletes every signal. Gone. Unrecoverable, unless you have a backup.

In practice, many applications don't actually delete data. They use soft deletes, adding a column like "deleted_at" and setting it to the current time instead of removing the row. Then all SELECT queries filter by "WHERE deleted_at IS NULL" to only show non-deleted rows. This way, you can recover accidentally deleted data.

### JOINs: Connecting Tables

This is where SQL gets powerful. Your data is split across multiple tables, users in profiles, signals in signals, data points in data_points. But often you need data from multiple tables at once. You want to see signals with their organisation's name. You want to see data points with their signal's name.

JOINs connect tables based on a shared value. The most common is an INNER JOIN: "SELECT signals.name, organisations.name FROM signals INNER JOIN organisations ON signals.org_id equals organisations.id." This connects each signal to its organisation by matching the org_id in the signals table to the id in the organisations table.

The result is like a combined spreadsheet. Each row has the signal's name and its organisation's name side by side. This is fundamental to how your signals page works, it needs to show signals that belong to the logged-in user's organisation, which requires joining the signals table with the user's profile to find their org_id.

There's also LEFT JOIN, which includes all rows from the left table even if there's no match in the right table. "SELECT signals.name, data_points.value FROM signals LEFT JOIN data_points ON data_points.signal_id equals signals.id." This returns every signal, even ones that don't have data points yet. Signals without data points will have NULL for the data_points.value column.

### Aggregations: Computing Values

Aggregation functions compute a single value from multiple rows. These are directly relevant to your signal calculations.

COUNT counts rows: "SELECT COUNT(star) FROM signals WHERE org_id equals 'abc123'." This returns a single number, how many signals that org has.

SUM adds up values: "SELECT SUM(absolute_value) FROM signals WHERE org_id equals 'abc123' AND category equals 'deals'." This returns the total value of all deal signals, which could be your pipeline value.

AVG computes the average: "SELECT AVG(absolute_value) FROM signals WHERE category equals 'deals'." This returns the average deal value.

MIN and MAX find the smallest and largest values. These are useful for things like "what's the oldest unresolved ticket" or "what's the largest deal in the pipeline."

GROUP BY is what makes aggregations really powerful. It groups rows by a column and computes the aggregation for each group: "SELECT category, COUNT(star), AVG(absolute_value) FROM signals WHERE org_id equals 'abc123' GROUP BY category." This returns one row per category, with the count and average for each. You'd see something like: deals, 5, 15000. Tickets, 12, null. Leads, 8, null.

This is essentially what your signal calculation pipeline does, but in application code instead of SQL. Understanding the SQL equivalent helps you verify that the code is computing the right thing.

### NULL Handling

NULL is a special value in SQL that means "no value" or "unknown." It's not zero. It's not an empty string. It's the absence of a value. And it behaves in ways that trip people up.

NULL is not equal to anything, including itself. If you write "WHERE value equals NULL," you get no results. You have to write "WHERE value IS NULL" instead. Similarly, NULL is not not-equal to anything. "WHERE value not equals 5" will not return rows where value is NULL. Those rows are simply excluded.

This matters in Camino because uploaded data often has missing values. A CSV might have some deals without an amount. Those would be NULL in the database. If your signal calculation sums amounts, NULL values are ignored by SUM, which is usually correct. But if you're counting rows WHERE amount is greater than zero, rows with NULL amounts won't be counted, which might or might not be what you want.

The COALESCE function is SQL's way of handling NULLs. It returns the first non-NULL value from a list: "COALESCE(amount, 0)" means "use the amount, but if it's NULL, use 0 instead." This is used in Camino's Row Level Security policies to handle cases where a user might not have an org_id set yet.

### Indexes: Making Queries Fast

When the database searches for rows that match a WHERE clause, it has to check every row in the table, unless there's an index. An index is like the index at the back of a book. Instead of reading every page to find a topic, you look up the topic in the index and go directly to the right page.

In Camino, there's an index called "idx_signals_user_id" on the signals table. This means when you query signals by user_id, the database doesn't scan every signal. It uses the index to jump directly to the right ones. For a table with thousands of signals, this can make a query hundreds of times faster.

You create indexes on columns that you frequently filter or sort by. In Camino's case, org_id, user_id, and category are good candidates for indexes because the signals page filters by these columns.

The trade-off is that indexes make writing slower. Every time you insert or update a row, the database has to update the index too. For a read-heavy application like Camino, where signals are written occasionally but read constantly, indexes are a clear win.

### How This Applies to Camino

Every time a user opens the signals page, a SQL query runs. It selects signals for their organisation, ordered by relevance or date. Every time the upload pipeline runs, INSERT statements create new signal rows. Every time an admin updates a profile, an UPDATE statement changes the profile row.

Understanding SQL means you can verify your application's behaviour by looking directly at the data. If a signal shows the wrong value on the screen, you can query the database and see what value is actually stored. If it's wrong in the database, the problem is in the calculation pipeline. If it's right in the database but wrong on the screen, the problem is in the display code. SQL gives you the ground truth.

### Explain It Like I'm 12

A database is like a filing cabinet with lots of drawers. Each drawer is a table. The "signals" drawer has a folder for every signal. The "profiles" drawer has a folder for every user.

SQL is how you ask the filing cabinet to find things. You say "find me all the folders in the signals drawer where the organisation is ABC and the trend is going up." The filing cabinet searches through its folders and gives you the matching ones.

Sometimes you need information from two drawers at once. You want the signal folders but also the name of the organisation from the organisations drawer. A JOIN is like saying "for each signal folder, go look in the organisations drawer and attach the matching organisation's name."

The filing cabinet is really fast at finding things if you put sticky tabs on the folders. Those tabs are called indexes. Without tabs, you have to check every folder. With tabs, you jump straight to the right ones.

The most important thing about the filing cabinet: it keeps your information safe and organised even when the power goes off. Everything in the drawers stays there. That's why you use a database instead of just keeping everything in your app's memory, because memory disappears when the app restarts, but the database persists forever.
