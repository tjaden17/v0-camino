# Chapter 11: Testing and Data Validation

**Duration:** ~15 minutes  
**Topic:** Preventing errors before they happen. Understanding testing basics builds confidence to change code without breaking things.

---

## Introduction

Welcome to Week 11 of the Camino Builder learning curriculum. This week is about prevention - catching bugs before they reach production through testing and data validation.

Right now, Camino has zero automated tests. Every time you change code, you manually test by clicking through the app. This works when you're moving fast and the codebase is small. But as you add features, manual testing becomes impossible - there are too many combinations to check.

Automated tests give you confidence. Change the signal calculation logic? Run the tests. Refactor the upload pipeline? Run the tests. If they pass, you know you didn't break existing functionality.

By the end of this chapter, you'll understand different types of tests, how to validate data with Zod, and how to build a manual testing checklist for your Tier 1 features.

## Why Test: The Real Reason

Let's start with why. The goal of testing isn't to find bugs - it's to give you confidence to make changes fast.

Without tests, every change is scary. "If I refactor this function, will it break something?" You have to manually test the entire app to find out. So you don't refactor. Technical debt accumulates. Code becomes harder to change.

With tests, refactoring is safe. Change the implementation, run the tests, and if they pass, you know the behavior didn't change. You can move fast without fear.

Tests also serve as documentation. A test named "calculateWinRate returns percentage of won deals out of total closed deals" tells you exactly what the function does. Better than a comment because the test proves it works.

The key insight: tests are an investment. They take time to write upfront, but they save time over the lifespan of the project. The first month, manual testing is faster. By month six, automated tests pay for themselves. By month twelve, they're essential.

## The Testing Pyramid

There are three levels of tests, forming a pyramid:

**Unit tests** (bottom, most numerous): Test a single function in isolation. "Given this input, does this function return this output?" Fast to run, easy to write. Example: testing your `calculateWinRate` function with sample data.

**Integration tests** (middle): Test how multiple parts work together. "Does this API endpoint correctly call the database and return the expected response?" Slower than unit tests, more realistic. Example: testing the `/api/upload/generate` endpoint from request to response.

**End-to-end tests** (top, fewest): Test the entire app from the user's perspective. "Can a user upload a CSV, generate signals, and see them on the signals page?" Slowest, most brittle, but catches issues that unit tests miss. Example: automated browser test that clicks through the upload flow.

The pyramid shape represents the ratio. Aim for many unit tests, some integration tests, and a few critical-path end-to-end tests.

Why this shape? Unit tests are fast and stable - they rarely fail due to unrelated changes. E2E tests are slow and brittle - a change to a button's class name breaks them. Most bugs can be caught with unit and integration tests, so those give you the best return on investment.

## Unit Tests: Testing Pure Functions

Let's start with unit tests because they're the easiest to understand and write. A unit test for a pure function looks like this:

```typescript
import { describe, it, expect } from 'vitest'
import { calculateWinRate } from '@/lib/signal-calculation-service'

describe('calculateWinRate', () => {
  it('calculates win rate as percentage of won deals', () => {
    const deals = [
      { stage: 'closed won', amount: 5000 },
      { stage: 'closed lost', amount: 3000 },
      { stage: 'closed won', amount: 2000 },
      { stage: 'open', amount: 1000 }, // Not closed, shouldn't count
    ]
    
    const result = calculateWinRate(deals)
    
    expect(result).toBe(66.67) // 2 won out of 3 closed = 66.67%
  })
  
  it('returns null when no closed deals', () => {
    const deals = [
      { stage: 'open', amount: 5000 },
      { stage: 'prospecting', amount: 3000 },
    ]
    
    const result = calculateWinRate(deals)
    
    expect(result).toBeNull()
  })
  
  it('handles edge case of 100% win rate', () => {
    const deals = [
      { stage: 'closed won', amount: 5000 },
      { stage: 'closed won', amount: 3000 },
    ]
    
    const result = calculateWinRate(deals)
    
    expect(result).toBe(100)
  })
})
```

Let's break down the structure:

`describe` groups related tests. Here, all tests for `calculateWinRate`.

`it` defines a single test case. The string describes what behavior you're testing.

`expect(actual).toBe(expected)` is an assertion - it checks that the actual result matches what you expect.

The pattern is: Arrange (set up test data), Act (call the function), Assert (check the result).

To run this test, you'd use Vitest (a testing framework):

```bash
npm install --save-dev vitest
npm run test
```

If the function works, you see green checkmarks. If it fails, you see exactly which assertion failed and why.

## Writing Your First Test

Let's write a real test for your codebase. Create `lib/__tests__/parse-number.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

// Function to test
function parseNumber(val: string | undefined | null): number | null {
  if (!val || val.trim() === "") return null
  const cleaned = val
    .replace(/^[A-Z]{3}\s*/i, "") // Remove currency codes
    .replace(/[$€£¥,\s%]/g, "")    // Remove symbols
    .replace(/^\((.+)\)$/, "-$1")  // Handle negative
  const n = Number(cleaned)
  return isNaN(n) ? null : n
}

describe('parseNumber', () => {
  it('parses plain numbers', () => {
    expect(parseNumber('123')).toBe(123)
    expect(parseNumber('123.45')).toBe(123.45)
  })
  
  it('removes currency symbols', () => {
    expect(parseNumber('$1,234.56')).toBe(1234.56)
    expect(parseNumber('€999')).toBe(999)
  })
  
  it('removes currency codes', () => {
    expect(parseNumber('AUD 5000')).toBe(5000)
    expect(parseNumber('USD 1,234.56')).toBe(1234.56)
  })
  
  it('handles negative numbers in parentheses', () => {
    expect(parseNumber('(500)')).toBe(-500)
  })
  
  it('returns null for invalid input', () => {
    expect(parseNumber('abc')).toBeNull()
    expect(parseNumber('')).toBeNull()
    expect(parseNumber(null)).toBeNull()
    expect(parseNumber(undefined)).toBeNull()
  })
})
```

Run this test with `npm run test` and you'll see if your `parseNumber` function handles all these cases. If a test fails, you know exactly which case broke.

This is the workflow: write the test first (describing what you want), then write the function to make it pass. This is called Test-Driven Development (TDD). It feels backwards at first, but it forces you to think about edge cases before writing code.

## Integration Tests: Testing API Routes

Integration tests are more realistic - they test how components work together. For API routes, you test the full request/response cycle.

Here's an integration test for your upload discover endpoint:

```typescript
import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/upload/discover/route'

describe('/api/upload/discover', () => {
  it('accepts a CSV file and returns discovered signals', async () => {
    // Arrange: create a mock file
    const csvContent = `Deal Name,Amount,Stage,Close Date
Deal 1,AUD 5000,closed won,2024-01-15
Deal 2,AUD 3000,closed lost,2024-01-20
Deal 3,AUD 2000,closed won,2024-02-01`
    
    const file = new File([csvContent], 'deals.csv', { type: 'text/csv' })
    const formData = new FormData()
    formData.append('file', file)
    
    const request = new Request('http://localhost:3000/api/upload/discover', {
      method: 'POST',
      body: formData,
    })
    
    // Act: call the endpoint
    const response = await POST(request)
    const data = await response.json()
    
    // Assert: check the response
    expect(response.status).toBe(200)
    expect(data.tabs).toHaveLength(1)
    expect(data.tabs[0].columns).toContain('Amount')
    expect(data.tabs[0].columns).toContain('Stage')
  })
  
  it('returns 400 for invalid file format', async () => {
    const file = new File(['not a csv'], 'invalid.txt', { type: 'text/plain' })
    const formData = new FormData()
    formData.append('file', file)
    
    const request = new Request('http://localhost:3000/api/upload/discover', {
      method: 'POST',
      body: formData,
    })
    
    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })
})
```

Integration tests are slower because they touch the database and file system. But they catch bugs that unit tests miss - like forgetting to await a promise, or passing data in the wrong format between functions.

## Data Validation with Zod

The best way to prevent errors is to validate data at the boundaries of your system - when it enters from external sources. This is where Zod comes in.

Zod is a TypeScript schema validation library. You define the shape of your data, and Zod checks that incoming data matches:

```typescript
import { z } from 'zod'

const SignalSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['revenue', 'sales', 'marketing', 'support']),
  value: z.number().positive(),
  trend: z.enum(['increasing', 'decreasing', 'stable']),
  date: z.string().datetime().optional(),
})

// Type is automatically inferred from the schema
type Signal = z.infer<typeof SignalSchema>

// Validate data
function createSignal(data: unknown): Signal {
  const validated = SignalSchema.parse(data)
  return validated
}
```

If the data doesn't match, Zod throws an error with details about what's wrong:

```typescript
createSignal({ name: '', value: -5 })
// Error: name must be at least 1 character, value must be positive
```

You can also use `safeParse` for non-throwing validation:

```typescript
const result = SignalSchema.safeParse(data)
if (result.success) {
  const signal = result.data
} else {
  console.error("Validation errors:", result.error.errors)
}
```

Let's add Zod validation to your upload endpoint:

```typescript
import { z } from 'zod'

const UploadQuestionsSchema = z.object({
  rowType: z.string().min(1),
  metricColumn: z.string().min(1),
  dateColumn: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const result = UploadQuestionsSchema.safeParse(body)
    if (!result.success) {
      return Response.json({
        error: "Invalid request data",
        details: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      }, { status: 400 })
    }
    
    const { rowType, metricColumn, dateColumn } = result.data
    
    // Now you know the data is valid
    // ... rest of your logic
  } catch (error) {
    // Handle error
  }
}
```

This guarantees that by the time you use `rowType`, it exists and isn't empty. No more "cannot read property of undefined" errors from bad input.

Zod schemas also serve as documentation - you can see exactly what shape the API expects without reading the implementation.

## Schema Validation for CSV Structure

You can also use Zod to validate CSV structure. Before processing uploaded data, check that it has the expected columns:

```typescript
const CSVRowSchema = z.object({
  'Deal Name': z.string(),
  'Amount': z.string(), // Will be parsed to number later
  'Stage': z.string(),
  'Close Date': z.string(),
})

function validateCSVStructure(rows: unknown[]) {
  if (rows.length === 0) {
    throw new Error("CSV is empty")
  }
  
  // Validate first row to check column structure
  const result = CSVRowSchema.safeParse(rows[0])
  if (!result.success) {
    const missingColumns = result.error.errors.map(e => e.path[0])
    throw new Error(`CSV is missing required columns: ${missingColumns.join(', ')}`)
  }
  
  return true
}
```

Now when a user uploads a CSV without an Amount column, they get a helpful error immediately instead of a confusing failure during calculation.

## Manual Testing Checklist for Tier 1

While you build automated tests, you still need manual testing. Here's a checklist for your Tier 1 pipeline:

**Upload Flow:**
- [ ] Can upload a CSV file
- [ ] Can upload an XLSX file with multiple tabs
- [ ] Sees correct column detection (numeric vs text vs date)
- [ ] Can answer all 3 questions (row type, metric, date)
- [ ] Error message shown for invalid file format
- [ ] Error message shown for empty file

**Signal Generation:**
- [ ] Generates count signals
- [ ] Generates sum/average for numeric columns
- [ ] Generates win rate for deals with stage column
- [ ] Generates group-by signals for text columns
- [ ] Shows preview values correctly
- [ ] Loading state shown during generation

**Signal Display:**
- [ ] All generated signals appear on /signals page
- [ ] Signal cards show correct values
- [ ] Trend arrows show correct direction
- [ ] Can expand cards to see details
- [ ] "My KPIs" filter works
- [ ] Can save/unsave signals

**AI Interpretation:**
- [ ] Can request interpretation for a signal
- [ ] 5-section analysis appears
- [ ] Sections are relevant to the signal
- [ ] Interpretation is cached (second view is instant)
- [ ] Force refresh works

**Error Handling:**
- [ ] Upload with malformed CSV shows helpful error
- [ ] Upload with missing columns shows which columns
- [ ] Network failure shows user-friendly message
- [ ] Database error doesn't crash the page

Test each item after every significant change. Once you have automated tests covering these scenarios, you can run them all with one command instead of clicking through manually.

## Common Testing Mistakes

**Mistake 1: Testing implementation instead of behavior**

Bad:
```typescript
it('calls calculateSum with the right arguments', () => {
  const spy = vi.spyOn(utils, 'calculateSum')
  processSignals(data)
  expect(spy).toHaveBeenCalledWith([1, 2, 3])
})
```

Good:
```typescript
it('returns correct sum of signal values', () => {
  const result = processSignals(data)
  expect(result.totalValue).toBe(6)
})
```

The first test checks how the code works (internal implementation). If you refactor to use a different function, it breaks. The second checks what the code does (external behavior). Refactoring doesn't break it as long as the behavior stays the same.

**Mistake 2: Testing too much in one test**

Bad:
```typescript
it('handles the entire upload flow', () => {
  // 50 lines testing upload, discovery, calculation, display
})
```

Good:
```typescript
it('parses uploaded CSV')
it('discovers signals from parsed data')
it('calculates signal values')
it('stores signals in database')
```

One concept per test. When a test fails, you should immediately know what broke.

**Mistake 3: Not testing edge cases**

Most bugs happen at the edges: empty arrays, null values, very large numbers, boundary conditions. Always test:

- Empty input (array with 0 items)
- Single item
- Null/undefined
- Negative numbers (if relevant)
- Very large numbers
- Invalid types

**Mistake 4: Brittle tests that break on unrelated changes**

Avoid hardcoding values that might change:
```typescript
// Brittle
expect(signal.name).toBe("Total deals")

// Better
expect(signal.name).toMatch(/deals/i)
```

The first breaks if you change the exact wording. The second checks the intent (signal name relates to deals).

## Testing Philosophy: What to Test

You can't test everything - it would take forever. Here's what to prioritize:

**High priority:**
- Business logic (calculations, data transformations)
- Data validation (what goes in, what comes out)
- Error handling (does it fail gracefully?)
- Critical user paths (upload → generate → display)

**Medium priority:**
- Edge cases in core features
- API contracts (request/response shapes)
- Database queries (correct filters, joins)

**Low priority:**
- UI layout (changes too often)
- Third-party libraries (assume they work)
- Trivial functions (one-line utilities)

Start with high priority. Write tests for your signal calculation logic, your CSV parsing, your data validation. Once those are solid, move to medium priority.

## Setting Up Testing in Your Project

To add testing to Camino:

1. Install Vitest:
```bash
npm install --save-dev vitest @vitest/ui
```

2. Add test script to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

3. Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

4. Write your first test in `lib/__tests__/parse-number.test.ts`

5. Run tests with `npm run test`

Vitest watches your files and re-runs tests automatically when you save. The UI version (`npm run test:ui`) gives you a browser interface to see test results.

## Next Week: Performance and Security

This week, add Zod validation to your API endpoints. Write unit tests for your calculation functions. Build a manual testing checklist and run through it before each deploy.

Next week, we'll cover performance and security - optimizing slow queries, caching AI interpretations, securing your database with RLS, and preparing for your first paying customer.

Testing gives you confidence. Security gives you trust. Together, they let you ship fast without compromising quality.
