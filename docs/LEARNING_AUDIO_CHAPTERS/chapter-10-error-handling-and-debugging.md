# Chapter 10: Error Handling and Debugging

**Duration:** ~15 minutes  
**Topic:** Making your app fail gracefully. Understanding error handling means the app provides helpful feedback instead of showing ugly error screens.

---

## Introduction

Welcome to Week 10 of the Camino Builder learning curriculum. This week focuses on error handling and debugging - the skills that separate apps that crash from apps that gracefully handle problems and guide users to solutions.

Your customer will encounter errors. A malformed CSV. A database timeout. A network failure. An AI API that's temporarily down. Your job isn't to prevent every error - that's impossible. Your job is to handle errors gracefully, provide helpful feedback, and make debugging straightforward when something unexpected happens.

By the end of this chapter, you'll understand try/catch patterns, React error boundaries, structured logging, and debugging techniques you'll use every day.

## The Philosophy of Error Handling

Before we dive into code, let's establish the right mindset. Errors are not failures - they're expected events that your code needs to handle.

There are two categories of errors: expected and unexpected.

**Expected errors** are scenarios you know will happen sometimes. A user uploads a CSV with the wrong format. The database connection times out. A required field is missing. For these, you write explicit code to catch the error, show a helpful message, and guide the user to fix it.

**Unexpected errors** are things you didn't anticipate. A third-party API returns an unexpected response. A null pointer exception in a calculation. A Vercel deployment fails. For these, you use error boundaries and logging to capture what happened, show a generic error message, and collect enough information to debug later.

The goal is to turn as many unexpected errors into expected errors as you gain experience. Every bug you fix should teach you to add better error handling for that scenario.

## Try/Catch Patterns in TypeScript

The fundamental error handling pattern in JavaScript and TypeScript is try/catch. Here's the basic structure:

```typescript
try {
  // Code that might throw an error
  const result = await riskyOperation()
  return result
} catch (error) {
  // Code that handles the error
  console.error("Operation failed:", error)
  return null
}
```

Let's break this down. The `try` block contains code that might fail. If any line inside throws an error, execution immediately jumps to the `catch` block. The `catch` block receives the error object and decides what to do with it.

In TypeScript, the caught error is typed as `unknown` by default, so you need to narrow it to use it safely:

```typescript
catch (error) {
  if (error instanceof Error) {
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)
  } else {
    console.error("Unknown error:", error)
  }
}
```

This pattern is everywhere in your Camino codebase. Let's look at a real example from your upload API:

```typescript
try {
  const parsedData = await parseCSV(file)
  const signals = await discoverSignals(parsedData)
  return Response.json({ signals })
} catch (error) {
  console.error("[Upload API] Error:", error)
  return Response.json(
    { error: "Failed to process upload" },
    { status: 500 }
  )
}
```

Notice what this does: attempts the operation, logs any error, and returns a proper HTTP error response. The user sees "Failed to process upload" - not helpful yet, but better than a crash.

## Making Error Messages Helpful

The worst error message is a technical stack trace shown to the user. The best error message tells the user what went wrong and how to fix it.

Compare these:

Bad: "Error: Cannot read property 'Amount' of undefined"

Good: "We couldn't find an 'Amount' column in your CSV. Please ensure your file has a column named 'Amount' or 'Deal Value'."

The difference is context. The bad message describes what failed in the code. The good message describes what's wrong with the user's input and how to fix it.

Here's how to write helpful error messages:

1. **Describe the problem in user terms:** "Your CSV is missing required columns" not "Column validation failed"

2. **Suggest a solution:** "Please include columns: Deal Name, Amount, Close Date"

3. **Explain what we expected:** "We found 5 rows but expected at least 10 for meaningful analysis"

4. **Provide next steps:** "Try uploading a different file or contact support if this error persists"

Let's rewrite that upload error handler:

```typescript
catch (error) {
  console.error("[Upload API] Error:", error)
  
  // Check for specific error types
  if (error instanceof CSVParseError) {
    return Response.json({
      error: "Unable to parse CSV file",
      details: "Please ensure your file is a valid CSV with comma-separated values",
      suggestedFix: "Try opening the file in Excel and saving as CSV again"
    }, { status: 400 })
  }
  
  if (error instanceof MissingColumnError) {
    return Response.json({
      error: `Missing required column: ${error.columnName}`,
      details: "Your CSV must include columns for deals, amounts, and dates",
      suggestedFix: "Add a column named 'Amount' or 'Deal Value'"
    }, { status: 400 })
  }
  
  // Unknown error - log details but show generic message
  return Response.json({
    error: "An unexpected error occurred while processing your file",
    details: "Our team has been notified. Please try again or contact support."
  }, { status: 500 })
}
```

Notice the HTTP status codes: 400 for client errors (bad input), 500 for server errors (our fault). This distinction helps with debugging.

## Error Boundaries in React

React components can throw errors. Maybe you tried to render `signal.name` but `signal` was null. Maybe a calculation failed. If unhandled, one component's error would crash your entire app.

**Error boundaries** catch React errors and show a fallback UI instead of a blank screen. Next.js makes this easy with `error.tsx` files.

In your app, create `app/error.tsx`:

```typescript
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-muted-foreground mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Try again
      </button>
    </div>
  )
}
```

Now if any component on any page throws an error, React shows this fallback UI instead of crashing. The `reset` function lets users try again - it re-renders the component tree.

You can add `error.tsx` at any level of your route structure. For example, `app/(protected)/signals/error.tsx` catches errors only on the signals page.

For loading states, Next.js also supports `loading.tsx`:

```typescript
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
```

This shows while the page is fetching data. Combined with `error.tsx`, you have loading, success, and error states covered.

## The {data, error} Pattern in Supabase

Supabase queries use a pattern that makes error handling explicit:

```typescript
const { data, error } = await supabase
  .from('signals')
  .select('*')
  .eq('user_id', userId)
```

Instead of throwing errors, Supabase returns an object with two properties: `data` (the results) or `error` (what went wrong). You check which one is present:

```typescript
if (error) {
  console.error("Database error:", error.message)
  return { error: "Failed to load signals" }
}

// data is guaranteed to exist here
const signals = data
```

This pattern forces you to handle errors explicitly. You can't forget - if you don't check for `error`, TypeScript yells at you when you try to use `data` (which might be null).

Compare this to throwing errors:

```typescript
// With throwing (implicit)
try {
  const signals = await getSignals(userId)
  // Easy to forget error handling
} catch (error) {
  // Handle error
}

// With {data, error} (explicit)
const { data: signals, error } = await getSignals(userId)
if (error) {
  // Must handle immediately
}
// Use signals
```

The explicit pattern is safer because you can't forget. It's also easier to read - you see the error handling right where the call is made.

## Structured Logging vs console.log

Logging is how you understand what your app is doing in production. But `console.log("here")` doesn't help when you're debugging a production issue at 2am.

**Structured logging** means logging with consistent format and useful context. Here's the difference:

Bad:
```typescript
console.log("error")
console.log(error)
```

Good:
```typescript
console.error("[Upload API] Failed to parse CSV", {
  userId,
  fileName: file.name,
  fileSize: file.size,
  error: error.message,
  timestamp: new Date().toISOString()
})
```

The structured log tells you what operation failed, who triggered it, what file they uploaded, and when. With the bad log, you'd have no idea.

Use consistent prefixes like `[Upload API]` or `[Signal Discovery]` so you can filter logs by component. Include relevant context - user IDs, file names, signal IDs - anything that helps you reproduce the issue.

For different severity levels, use the appropriate method:

- `console.log()` - general information (least important)
- `console.info()` - informational messages
- `console.warn()` - warnings about potential issues
- `console.error()` - actual errors (most important)

In production, you'd use a logging service like Axiom or Datadog to aggregate logs. For now, Vercel captures all console output in the Functions tab of your dashboard.

## Debugging Tools: Browser DevTools

Your browser's DevTools is the most powerful debugging tool you have. Let's walk through the essential features.

**Console tab:** See all console.log, error, and warning messages. You can also run JavaScript directly to inspect state: type `document.querySelector('.signal-card')` to find an element.

**Network tab:** See every API request your app makes. Click a request to see the request headers, request body, response, and timing. This is essential for debugging API issues. If your upload is failing, check the Network tab to see what the server actually received and what error it returned.

**Elements tab:** Inspect the DOM tree and see which CSS is applied to each element. Right-click any element on the page and select "Inspect" to jump right to it. You can edit CSS live to test changes.

**Sources tab:** Debug JavaScript with breakpoints. Click the line number to set a breakpoint - execution will pause there and let you inspect variables. Use "Step over" to execute one line at a time.

**Application tab:** See localStorage, cookies, and service workers. If you're storing data in the browser, this is where you'd inspect it.

For React, install the React DevTools browser extension. It adds a Components tab that shows your component tree with props and state for every component. This is invaluable for understanding why a component isn't updating as expected.

## Common Bugs and How to Spot Them

Let's walk through bugs you'll encounter in Camino and how to diagnose them.

**Null/undefined access:** The most common React error. You tried to access `signal.name` but `signal` was undefined.

Symptoms: Error says "Cannot read property 'name' of undefined"

Diagnosis: The data hasn't loaded yet or wasn't found.

Fix: Add a loading state or null check:
```typescript
if (!signal) return <div>Loading...</div>
{signal?.name}
```

**Race conditions:** Two async operations happening at once with unexpected interaction.

Symptoms: Data appears then disappears. Stale data shown. Errors that only happen sometimes.

Diagnosis: Look for multiple useEffect hooks or async calls without proper cleanup.

Fix: Use cleanup functions in useEffect and debounce rapid updates.

**Missing environment variable:** Your code expects `process.env.SUPABASE_URL` but it's not defined.

Symptoms: Error says "Cannot read property 'SUPABASE_URL' of undefined" or API calls fail with "invalid URL"

Diagnosis: Check the Vercel dashboard - is the variable set? Check spelling - is it exactly the same in your code and in Vercel?

Fix: Add the variable in Vercel settings and redeploy.

**CORS errors:** Your API route returns data but the browser blocks it.

Symptoms: Network tab shows the request succeeded but console says "CORS policy blocked"

Diagnosis: This happens when your frontend and backend are on different domains.

Fix: In Next.js API routes, this shouldn't happen because they're same-origin. If you see it, you're probably calling an external API that doesn't allow your domain.

**Database constraint violations:** You tried to insert data that violates a database constraint.

Symptoms: Error says "duplicate key value violates unique constraint" or "foreign key constraint violation"

Diagnosis: Check your database schema. Maybe you're inserting a signal with an ID that already exists, or referencing a user_id that doesn't exist.

Fix: Handle the constraint in code - check if the record exists first, or use upsert instead of insert.

## Debugging Strategy: Systematic Troubleshooting

When you encounter a bug, follow this systematic approach:

1. **Reproduce it consistently:** Can you make it happen every time? If not, what's different when it happens vs doesn't?

2. **Read the error message carefully:** What line number? What variable? What type?

3. **Check the logs:** Vercel dashboard for server errors, browser console for client errors.

4. **Isolate the problem:** Comment out code until the error goes away, then uncomment one piece at a time.

5. **Add logging:** Insert console.log at key points to see what values variables have.

6. **Check assumptions:** "This variable should be a string" - is it actually? Console.log it to confirm.

7. **Simplify:** Remove complexity until you have the minimal code that reproduces the bug.

8. **Google the error:** Someone else has likely encountered it. Include framework names: "Next.js cannot read property of undefined"

9. **Check recent changes:** Did this work before? What changed? Use `git log` to see recent commits.

10. **Ask for help:** If stuck for more than 30 minutes, describe the problem to someone (or an AI) - often you'll realize the answer while explaining.

## Error Handling in the Upload Pipeline

Let's apply all this to your upload pipeline. Currently, if any step fails, the user sees a generic error. Let's make it better:

```typescript
// app/api/upload/generate/route.ts
export async function POST(request: Request) {
  try {
    // Parse request
    const body = await request.json()
    const { tabKey, questions } = body
    
    if (!tabKey) {
      return Response.json(
        { error: "Missing tab key", details: "Please select a file tab" },
        { status: 400 }
      )
    }
    
    // Load staged data
    const { data: stagedData, error: loadError } = await supabase
      .from('staged_uploads')
      .select('*')
      .eq('tab_key', tabKey)
      .single()
      
    if (loadError || !stagedData) {
      console.error("[Generate] Failed to load staged data", { tabKey, error: loadError })
      return Response.json(
        { error: "Could not find uploaded file", details: "Please upload your file again" },
        { status: 404 }
      )
    }
    
    // Parse CSV
    let rows
    try {
      rows = JSON.parse(stagedData.raw_data)
    } catch (parseError) {
      console.error("[Generate] Failed to parse CSV data", { tabKey, error: parseError })
      return Response.json(
        { error: "Invalid file format", details: "File data is corrupted. Please re-upload." },
        { status: 400 }
      )
    }
    
    // Generate signals
    const signals = await generateSignals(rows, questions)
    
    if (signals.length === 0) {
      return Response.json(
        { error: "No signals generated", details: "Your file might not have enough data or the columns don't match any signal definitions" },
        { status: 422 }
      )
    }
    
    return Response.json({ signals })
    
  } catch (error) {
    // Unexpected error - log everything
    console.error("[Generate] Unexpected error", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    
    return Response.json(
      { error: "An unexpected error occurred", details: "Our team has been notified. Please try again." },
      { status: 500 }
    )
  }
}
```

Notice how this handles different error scenarios with specific messages, logs context for debugging, and uses appropriate HTTP status codes.

## Testing Error Handling

The best way to ensure your error handling works is to test it. For now, test manually:

1. Upload a malformed CSV - does the error message make sense?
2. Upload a CSV with missing columns - are you told which columns are missing?
3. Disconnect your internet and trigger an API call - is there a helpful timeout message?
4. Try to access a signal that doesn't exist - is there a 404 page or error boundary?

As you build confidence, you'll write automated tests for these scenarios. For now, keep a checklist and test each error path whenever you change the code.

## When to Show Errors vs Log Silently

Not every error needs to be shown to the user. Sometimes the app can recover gracefully:

**Show the error when:**
- The user's action failed (upload didn't work, save didn't work)
- The user needs to change their input (invalid data)
- Something is broken and the user can't proceed

**Log but don't show when:**
- A fallback strategy succeeded (primary API failed but cached data worked)
- The error is temporary and you're retrying automatically
- The error is informational (slow network, but still loading)

The rule of thumb: if the user can or should do something differently, show the error. If not, log it for yourself but don't bother the user.

## Next Steps

This week, review every try/catch block in your codebase. Are the error messages helpful? Do they guide users to solutions? Add logging with relevant context.

Next week, we'll cover testing and data validation - how to prevent errors before they happen by validating input and writing tests that catch bugs before they reach production.

Remember: good error handling is invisible when things work, and helpful when things don't. Your users will judge your app by how it handles failure more than by how it handles success.
