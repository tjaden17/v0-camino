# Chapter 12: Performance and Security

**Duration:** ~15 minutes  
**Topic:** Making your app fast and secure. Understanding performance and security basics protects customer data and keeps the app responsive.

---

## Introduction

Welcome to Week 12, the final chapter of the Camino Builder learning curriculum. This week focuses on performance and security - the foundations that let you confidently serve paying customers.

Performance matters because every extra second of wait time loses users. Security matters because a single data breach destroys trust forever. These aren't optional polish - they're essential from day one.

By the end of this chapter, you'll know how to optimize database queries, implement caching strategies, secure your app with Row Level Security, and follow security best practices to protect customer data.

## Performance: Why It Matters

Users don't consciously notice when your app is fast - they just use it. But they very consciously notice when it's slow. Research shows:

- 100ms delay: users perceive the app as sluggish
- 1 second delay: users lose their flow of thought  
- 3 second delay: users consider leaving
- 10 second delay: users leave and don't come back

Your Tier 1 pipeline involves multiple steps: upload CSV, parse data, discover signals, calculate values, generate AI interpretation, display results. If each step takes 2 seconds, that's 10 seconds total - right at the threshold where users abandon.

The goal isn't to make everything instant - that's impossible. The goal is to make the app feel responsive. Show loading states. Give feedback. Let users do other things while background tasks run.

## Database Query Optimization

Your app's performance bottleneck is likely database queries. Supabase is fast, but slow queries can still happen. Let's understand how to optimize them.

**EXPLAIN ANALYZE** is your best debugging tool. It shows you exactly how PostgreSQL executes a query and how long each part takes. Run it in the Supabase SQL Editor:

\`\`\`sql
EXPLAIN ANALYZE
SELECT s.*, COUNT(dp.id) as data_point_count
FROM signals s
LEFT JOIN data_points dp ON dp.signal_id = s.id
WHERE s.user_id = '123e4567-e89b-12d3-a456-426614174000'
GROUP BY s.id
ORDER BY s.created_at DESC;
\`\`\`

The output shows:

- **Seq Scan** - scanning every row (slow for large tables)
- **Index Scan** - using an index to jump to relevant rows (fast)
- **Execution time** - actual milliseconds spent

If you see "Seq Scan" on a large table, you need an index. An index is like a book's index - instead of reading every page to find "signals," you look it up in the index which tells you exactly which pages to read.

Create an index:
\`\`\`sql
CREATE INDEX idx_signals_user_id ON signals(user_id);
\`\`\`

Now queries filtering by `user_id` use the index and run 10-100x faster.

Your Camino database already has indexes on common filter columns. Check your migration scripts - you'll see indexes on `user_id`, `signal_id`, `created_at`.

## The N+1 Query Problem

This is the most common performance bug in web apps. Here's how it happens:

\`\`\`typescript
// Load all signals for a user
const { data: signals } = await supabase
  .from('signals')
  .select('*')
  .eq('user_id', userId)

// For each signal, load its data points
for (const signal of signals) {
  const { data: dataPoints } = await supabase
    .from('data_points')
    .select('*')
    .eq('signal_id', signal.id)
  signal.dataPoints = dataPoints
}
\`\`\`

If you have 20 signals, this makes 21 queries: 1 for signals, then 20 more for data points. That's the "N+1" - one initial query plus N additional queries in a loop.

The fix: load everything in one query with a join:

\`\`\`typescript
const { data: signals } = await supabase
  .from('signals')
  .select(`
    *,
    data_points (*)
  `)
  .eq('user_id', userId)
\`\`\`

Supabase automatically performs the join and nests the data_points array inside each signal. One query instead of 21.

Always watch for loops that make database calls. If you find one, there's usually a way to do it in a single query with a join or a subquery.

## Caching: When and How

Caching means storing the result of an expensive operation so you don't have to repeat it. Your app already uses caching for AI interpretations - once generated, they're saved in the `signal_interpretations` table.

Here's when to cache:

**Cache when:**
- The data is expensive to compute (AI calls, complex calculations)
- The data doesn't change often (signal interpretations, user profiles)
- Multiple users request the same data (public signals, shared analyses)

**Don't cache when:**
- The data changes frequently (real-time metrics, live dashboards)
- The cache becomes stale quickly (current user session, temporary state)
- Fetching fresh data is already fast (simple database queries)

Your caching strategy for interpretations:

\`\`\`typescript
// Check if interpretation exists
const { data: cached } = await supabase
  .from('signal_interpretations')
  .select('*')
  .eq('signal_id', signalId)
  .single()

if (cached && !forceRefresh) {
  return cached
}

// Generate new interpretation
const interpretation = await generateInterpretation(signal)

// Save to cache
await supabase
  .from('signal_interpretations')
  .upsert({ signal_id: signalId, ...interpretation })

return interpretation
\`\`\`

This pattern: check cache, return if found, otherwise compute and save. Simple and effective.

For even faster caching, you could use Redis (via Upstash) to cache in memory instead of the database. But for AI interpretations that take 2-3 seconds to generate, database caching is plenty fast.

## Image and Asset Optimization

Your app is currently lightweight - mostly text and simple UI. But if you add images, charts, or large assets, optimization matters.

**Next.js Image Component** automatically optimizes images:

\`\`\`typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Camino logo"
  width={200}
  height={50}
  priority // Load immediately for above-the-fold images
/>
\`\`\`

This automatically:
- Resizes images to the exact size needed
- Converts to modern formats (WebP, AVIF)
- Lazy loads images below the fold
- Serves from CDN for fast delivery

Never use `<img src="/big-image.jpg">` directly - always use Next.js `Image`.

For charts and data visualizations, consider server-side rendering. Generate the chart on the server and send a static image instead of sending all the data and rendering on the client. This is faster for complex charts with thousands of data points.

## Lazy Loading: Only Load What's Visible

Your signals page might eventually show hundreds of signals. Loading and rendering them all at once is slow and wasteful. Instead, use lazy loading:

\`\`\`typescript
import { Suspense, lazy } from 'react'

const SignalCard = lazy(() => import('@/components/signal-card'))

export function SignalsList({ signals }) {
  return (
    <div>
      {signals.map(signal => (
        <Suspense key={signal.id} fallback={<div>Loading...</div>}>
          <SignalCard signal={signal} />
        </Suspense>
      ))}
    </div>
  )
}
\`\`\`

Or use virtual scrolling with a library like `react-virtual` to only render signals visible in the viewport. If you have 500 signals but only 10 fit on screen, why render 490 that the user can't see?

For now, your signal list is small enough that this doesn't matter. But keep it in mind as you scale.

## Bundle Size: What Ships to the Browser

Every JavaScript file you import increases your bundle size - the amount of code the browser downloads. Larger bundles = slower page loads.

Check your bundle size:
\`\`\`bash
npm run build
\`\`\`

Look for the output:
\`\`\`
Route (app)                Size     First Load JS
┌ ○ /                      1.2 kB    85 kB
├ ○ /signals               5.4 kB    120 kB
└ ○ /upload                3.8 kB    95 kB
\`\`\`

"First Load JS" is what users download on first visit. Aim to keep this under 200 kB for fast loading.

If a page is too large:
- Use dynamic imports for heavy components
- Remove unused dependencies
- Minimize third-party libraries

Your Camino bundle is likely fine - Next.js automatically code-splits by route and only loads what's needed. But watch it as you add features.

## Security: The Fundamentals

Security is about layers. No single technique makes you secure - you need multiple defenses so if one fails, others catch it.

**Layer 1: Row Level Security (RLS)**

This is your primary defense. RLS is a PostgreSQL feature that enforces access control at the database level. Even if your application code has a bug, the database won't return unauthorized data.

Your RLS policies look like this:

\`\`\`sql
-- Users can only read their own signals
CREATE POLICY "Users can read own signals"
  ON signals FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert signals for themselves
CREATE POLICY "Users can insert own signals"
  ON signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);
\`\`\`

`USING` controls which rows are visible (SELECT). `WITH CHECK` controls which rows can be inserted/updated.

The key is `auth.uid()` - this is the user ID from their JWT token. Supabase validates the token and injects the user ID automatically. You can't fake it.

Every table that stores user data should have RLS policies. Otherwise, anyone can read anyone's data by querying the database directly.

Check your RLS policies in the Supabase dashboard under "Authentication" > "Policies". Every table should show green checkmarks for "RLS enabled."

**Layer 2: Input Validation**

Never trust user input. Always validate with Zod before using it:

\`\`\`typescript
const UploadSchema = z.object({
  file: z.instanceof(File),
  rowType: z.enum(['deals', 'leads', 'tickets']),
})

const result = UploadSchema.safeParse(input)
if (!result.success) {
  return { error: "Invalid input" }
}
\`\`\`

This prevents SQL injection, script injection, and other attacks where malicious input exploits your code.

**Layer 3: Parameterized Queries**

SQL injection happens when user input is concatenated into SQL:

\`\`\`typescript
// DANGEROUS - user could input "'; DROP TABLE signals; --"
const query = `SELECT * FROM signals WHERE name = '${userInput}'`
\`\`\`

The solution: parameterized queries. Supabase does this automatically:

\`\`\`typescript
// SAFE - userInput is escaped properly
const { data } = await supabase
  .from('signals')
  .select('*')
  .eq('name', userInput)
\`\`\`

Never construct SQL strings with user input. Always use the query builder or parameterized queries.

**Layer 4: Authentication Checks in API Routes**

Every API route that handles sensitive data should verify the user is authenticated:

\`\`\`typescript
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createClient()
  
  // Check auth
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // User is authenticated, proceed
  const signals = await getSignals(user.id)
  return Response.json({ signals })
}
\`\`\`

Don't rely on client-side checks - they can be bypassed. Always verify on the server.

## Environment Variables: Never Expose Secrets

Your app has two types of environment variables:

**Public** (prefixed with `NEXT_PUBLIC_`):
- Can be used on the client
- Example: `NEXT_PUBLIC_SUPABASE_URL`
- Not secret - visible in browser source

**Private** (no prefix):
- Only available on the server
- Example: `SUPABASE_SERVICE_ROLE_KEY`
- Secret - never send to browser

The service role key has unlimited database access, bypassing RLS. If it leaks, anyone can read/modify all your data. Never import it in a "use client" file.

Check your imports:
\`\`\`bash
grep -r "SUPABASE_SERVICE_ROLE_KEY" components/
\`\`\`

If this finds anything in client components, you have a security bug. Move that code to a server action or API route.

## HTTPS, CSRF, and XSS: Handled by Vercel and Next.js

Good news: Vercel and Next.js handle many security concerns automatically.

**HTTPS:** All Vercel deployments use HTTPS by default. Your data is encrypted in transit.

**CSRF (Cross-Site Request Forgery):** Next.js server actions include CSRF protection automatically. You don't need to do anything.

**XSS (Cross-Site Scripting):** React escapes all variables by default. Writing `<div>{userInput}</div>` is safe - React turns `<script>alert('xss')</script>` into the literal text, not executable code.

However, be careful with `dangerouslySetInnerHTML`:
\`\`\`typescript
// DANGEROUS - don't do this with user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />
\`\`\`

This bypasses React's escaping. Only use it with trusted content, or sanitize with a library like DOMPurify first.

## Rate Limiting: Preventing Abuse

Your upload endpoint should have rate limiting to prevent abuse:

\`\`\`typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return Response.json({ error: "Too many requests" }, { status: 429 })
  }
  
  // Process upload
}
\`\`\`

This prevents a malicious user from uploading thousands of files and overloading your server or exceeding API quotas.

For now, Vercel's default rate limiting is probably sufficient. But as you scale, add explicit rate limiting to expensive endpoints.

## Measuring Performance: What to Track

You can't improve what you don't measure. Track these metrics:

**Page Load Time:** How long until the page is interactive. Check in Chrome DevTools > Network tab > Disable cache > Reload. Aim for under 3 seconds on fast connections, under 10 seconds on slow connections.

**API Response Time:** How long do your API routes take? Add logging:
\`\`\`typescript
const start = Date.now()
const result = await expensiveOperation()
const duration = Date.now() - start
console.log(`[API] Operation took ${duration}ms`)
\`\`\`

Aim for under 1 second for most endpoints, under 5 seconds for AI-heavy ones.

**Database Query Time:** Check slow queries with EXPLAIN ANALYZE. Anything over 100ms deserves investigation.

**Bundle Size:** Run `npm run build` and check the output. Keep pages under 200 KB first load JS.

**Error Rate:** What percentage of requests fail? Track this in Vercel logs. Aim for under 1% error rate.

Set up monitoring with Vercel Analytics or a tool like Sentry to track these automatically.

## Security Checklist Before Launch

Before your first paying customer uses Camino:

- [ ] RLS enabled on all tables with user data
- [ ] RLS policies tested (can user A access user B's data? No.)
- [ ] All API routes check authentication
- [ ] Service role key never imported in client components
- [ ] All user input validated with Zod
- [ ] Environment variables correctly set (public vs private)
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] No secrets committed to repository
- [ ] No console.log with sensitive data
- [ ] Error messages don't leak sensitive information
- [ ] File uploads limited to reasonable sizes
- [ ] Rate limiting on expensive endpoints
- [ ] Database backups configured (Supabase does this automatically)

Go through this checklist. Fix any gaps. Security isn't something to add later - it's foundational.

## Performance Checklist Before Launch

- [ ] All pages load in under 3 seconds on fast connection
- [ ] Loading states shown for operations over 500ms
- [ ] Database queries use indexes (check with EXPLAIN ANALYZE)
- [ ] No N+1 query patterns (loops making database calls)
- [ ] Expensive operations cached (AI interpretations, complex calculations)
- [ ] Images optimized (using Next.js Image component)
- [ ] Bundle size under 200 KB per page
- [ ] No blocking operations on the client (use server actions)
- [ ] Error boundaries catch component failures
- [ ] 404 and 500 error pages exist and are helpful

## Real-World Example: Optimizing the Signals Page

Let's apply these concepts to optimize your signals page:

**Current:** Load all signals for the user, then for each signal that's expanded, load AI interpretation.

**Problem:** If user has 100 signals and expands 5, we're making 6 queries (1 for signals, 5 for interpretations).

**Optimization 1:** Eager load interpretations for signals that have them:
\`\`\`typescript
const { data: signals } = await supabase
  .from('signals')
  .select(`
    *,
    signal_interpretations (*)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
\`\`\`

Now it's one query instead of 6.

**Optimization 2:** Add pagination - only load 20 signals at a time:
\`\`\`typescript
const { data: signals } = await supabase
  .from('signals')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .range(0, 19) // First 20
\`\`\`

**Optimization 3:** Cache the query on the client - if user goes to another page and comes back, don't refetch:
\`\`\`typescript
import useSWR from 'swr'

const { data: signals } = useSWR(
  'signals',
  () => fetchSignals(),
  { revalidateOnFocus: false }
)
\`\`\`

SWR caches in memory and only refetches when you explicitly invalidate.

These three optimizations together make the signals page load faster and use fewer resources.

## Conclusion: Shipping with Confidence

You've completed all 12 weeks of the Camino Builder learning curriculum. Let's review what you've learned:

**Weeks 1-4 (Foundations):**
- TypeScript type system and how it prevents bugs
- React component model and state management
- Next.js App Router and server vs client components
- SQL fundamentals and database design

**Weeks 5-8 (Your Stack):**
- Supabase authentication and Row Level Security
- Supabase query builder and real-time subscriptions
- AI SDK and prompt engineering for quality output
- Tailwind CSS and component-driven UI design

**Weeks 9-12 (Production Skills):**
- Git workflow and deployment with Vercel
- Error handling and debugging techniques
- Testing strategies and data validation with Zod
- Performance optimization and security best practices

You now understand not just how to write code, but why it works, how to debug it, and how to ship it confidently.

## What's Next

Your learning doesn't stop here. As you build Camino, you'll encounter new challenges that require deeper knowledge. When that happens:

1. Reference these chapters as a foundation
2. Consult the official docs (Next.js, Supabase, Tailwind)
3. Search for specific solutions to specific problems
4. Ask AI tools for explanations of unfamiliar code
5. Read the code you've written - it's your best teacher

The goal was never to make you an expert in 12 weeks. The goal was to give you enough knowledge to learn effectively, debug systematically, and ship confidently.

You're ready. Build Camino. Ship features. Learn from real users. And remember: every bug is a lesson, every slowdown is an optimization opportunity, and every security concern is a chance to build trust.

Welcome to the builder life. Now go build something that matters.
