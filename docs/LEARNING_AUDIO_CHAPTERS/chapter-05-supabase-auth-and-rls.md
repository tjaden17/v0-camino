# Chapter 5: Supabase Auth and Row Level Security
## How Your App Knows Who You Are and What You Can See

### Introduction

Welcome to Chapter 5. We're now in Phase 2, going deeper on the specific tools in your stack. This chapter is about two things that are intimately connected: authentication and data security. Authentication is how the app knows who you are. Row Level Security, or RLS, is how the database decides what data you're allowed to see.

These two concepts are the backbone of multi-tenant security. Multi-tenant means multiple customers share the same application and the same database, but each customer can only see their own data. When your first customer's exec logs in, they should see their organisation's signals. They should never, under any circumstances, see another company's signals. Authentication tells the system who's asking. RLS ensures they only get what they're allowed to get.

Supabase handles both of these, and it handles them well. But you need to understand how they work, because a misconfiguration in either one could mean data leaking between organisations. And when your product handles business intelligence data, that's not just a bug. That's a trust-destroying, contract-ending, possibly legal event.

### How Authentication Works

Authentication is the process of proving you are who you claim to be. In the physical world, you show your driver's licence. In the digital world, you type your email and password, and the system checks if they match.

Supabase Auth handles this entire flow. When a user signs up, Supabase creates a record in its internal auth.users table, hashes the password so it can never be read in plain text, and sends a confirmation email. When a user signs in, Supabase checks the password against the hash and, if it matches, creates a session.

A session is like a wristband at an event. Once you've shown your ticket at the door and received a wristband, you can move around freely without showing your ticket again. The wristband proves you're authorised. In Supabase, the session is stored as a token, specifically a JWT, a JSON Web Token.

A JWT is a string of characters that contains encoded information about the user: their unique id, their email, when the token was created, and when it expires. Importantly, this token is cryptographically signed. That means if anyone tries to tamper with it, change the user id or extend the expiration, the signature won't match and the token will be rejected.

In Camino, when a user logs in, Supabase returns a JWT. That JWT is stored in the browser as a cookie. Every time the browser makes a request to your app, the cookie is included automatically. Your Next.js middleware reads the cookie, verifies the JWT, and either allows the request to proceed or redirects to the sign-in page.

### What auth.uid() Actually Returns

This is a small but crucial detail. In Supabase, the function auth.uid() returns the currently authenticated user's unique ID. This ID is a UUID that matches the user's id in the profiles table.

When you write a database query through Supabase's client library, the JWT is automatically included in the request. The database reads the JWT, extracts the user id, and makes it available as auth.uid(). This means the database itself knows who is making the request, not just your application code.

This is the foundation of Row Level Security. The database can make access decisions based on who's asking, not just what's being asked for.

### Row Level Security: The Concept

Row Level Security, or RLS, is a PostgreSQL feature that adds invisible WHERE clauses to every query. When RLS is enabled on a table, every SELECT, INSERT, UPDATE, and DELETE is automatically filtered based on policies you define.

Think of it this way. Without RLS, if you query "SELECT star FROM signals," you get every signal in the database, from every organisation, for every user. With RLS, the same query automatically becomes "SELECT star FROM signals WHERE" and then whatever your policy says. If your policy says "only signals from the user's organisation," the user gets only their organisation's signals. They can't even see that other organisations' signals exist.

This is not application-level security. This is database-level security. Even if your application code has a bug and forgets to filter by organisation, RLS catches it. The database itself enforces the rules. This is defence in depth, multiple layers of protection.

### USING vs WITH CHECK

RLS policies have two parts, and understanding the distinction is important. The USING clause applies to reading data, that is SELECT queries. It defines which rows the user can see. The WITH CHECK clause applies to writing data, that is INSERT and UPDATE queries. It defines which rows the user can create or modify.

In Camino, a signals USING policy might say "true," meaning anyone can read any signal. This sounds scary, but it depends on your architecture. If signals are already filtered by org_id in your application code, and you trust that the signals table contains only data that should be visible to authenticated users, then a permissive USING policy is acceptable for the MSS phase.

However, a more secure USING policy would be something like: the user can see signals where the signal's org_id matches the org_id in the user's profile. This means even if your application code has a bug, the database won't return signals from the wrong organisation.

The WITH CHECK policy for signals might say: the user can only insert signals where the org_id matches their own organisation. This prevents a malicious or buggy request from creating signals in someone else's organisation.

### How Camino's RLS Policies Work

Let me walk through the specific RLS policies in your database.

For the profiles table, the USING policy says auth.uid() equals id. This means a user can only read their own profile. They can't see other users' profiles. This is straightforward. My user id is abc123. I can read the row where id is abc123. I can't read any other rows.

For the signals table, if the policy says USING true, that means any authenticated user can read any signal. For the MSS phase with one customer, this is acceptable. But as you add more customers, this needs to tighten to filter by the user's org_id.

For the organisations table, the policy might allow users to read their own organisation's data. This uses a subquery: the user can read organisations where the org's id matches the org_id in the user's profile.

The important pattern in several policies uses COALESCE. Some policies say: the user can access data where org_id matches their org_id, using COALESCE to handle the case where the user's org_id might be NULL. COALESCE of the user's org_id and an empty UUID ensures that if the user has no organisation assigned, the comparison fails gracefully rather than producing an error.

### Service Role vs Anon Key

Supabase gives you two keys to access the database, and using the wrong one is a common security mistake.

The anon key is the public key. It's safe to use in the browser because it's limited by RLS policies. When you make a database request with the anon key, RLS is enforced. The user can only see what the policies allow.

The service role key is the admin key. It bypasses all RLS policies. When you make a request with the service role key, you get everything. This is necessary for admin operations like creating users, migrating data, or running background jobs that need to access data across all organisations.

The critical rule: the service role key must never be used in client-side code. It must never appear in a file that has "use client" at the top. It should only be used in server-side code, in API routes, Server Components, or Server Actions. If the service role key leaks to the browser, anyone can bypass RLS and access all data in your database.

In Camino, you should have two Supabase client configurations. The browser client uses the anon key and the NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. The server client uses the service role key and the SUPABASE_SERVICE_ROLE_KEY environment variable. The NEXT_PUBLIC prefix means the anon key is safe to expose to the browser. The service role key has no such prefix, meaning Next.js keeps it server-side only.

### Auth Helpers for Next.js

Supabase provides helper libraries specifically for Next.js that handle the complexity of sessions across server and client. There are two main functions.

createBrowserClient creates a Supabase client for use in Client Components. It uses the anon key, manages the session in the browser, and respects RLS.

createServerClient creates a Supabase client for use in Server Components, API routes, and middleware. It reads the session from cookies, uses the appropriate key, and can be configured with the service role key for admin operations.

In Camino, you have lib/supabase/client.ts for the browser client and lib/supabase/server.ts for the server client. The distinction is crucial. If you accidentally import the server client in a Client Component, you might expose the service role key. If you use the browser client in a Server Component, you might not have access to the session cookie.

### The Auth Flow in Camino, Step by Step

When a user visits Camino, here's the complete authentication flow.

Step one: the user navigates to the app. Middleware runs, checks for a session cookie. No cookie found. Middleware redirects to the sign-in page.

Step two: the user enters email and password. Supabase Auth verifies the credentials. If correct, Supabase returns a JWT and a refresh token. The Supabase client stores these as cookies.

Step three: the user is redirected to the signals page. Middleware runs again, finds the session cookie, verifies the JWT. The JWT is valid. The request proceeds.

Step four: the signals page loads. It creates a server Supabase client, which reads the session from the cookie. It queries the signals table. RLS policies kick in, filtering the results to only this user's organisation's signals.

Step five: the user sees their signals. They click to expand one, which triggers an API call to load the AI interpretation. The server client reads the session, the database applies RLS, and only the interpretation for the user's signal is returned.

Step six: the JWT expires, typically after an hour. The Supabase client automatically uses the refresh token to get a new JWT, without the user having to sign in again. This happens silently.

Step seven: eventually, the refresh token also expires, typically after a week or longer. Now the user has to sign in again. This is the session lifetime.

### Common Auth Mistakes to Avoid

There are several patterns that cause security problems, and they're worth knowing so you can spot them.

First: not enabling RLS on a table. If RLS is not enabled, any authenticated user can read every row. In Supabase, RLS is off by default on new tables. You must enable it explicitly.

Second: using USING true on a sensitive table. This means any authenticated user can read any row. It's fine for truly public data, but not for data that should be organisation-scoped.

Third: importing the service role key in client code. This gives the browser full database access, bypassing all RLS.

Fourth: not handling the session expiry gracefully. If the JWT expires and the refresh fails, the user should be redirected to sign-in, not shown a cryptic error.

Fifth: not testing RLS policies. You should manually test that user A cannot see user B's data. Log in as user A, try to query user B's signals. If you get results, your policies are wrong.

### Explain It Like I'm 12

Authentication is like the lock on your phone. You put in your password or use your fingerprint, and the phone says "OK, I know it's you." If someone else picks up your phone, it won't unlock because it doesn't recognise them.

Row Level Security is like having separate photo albums for each person in a family. Even though all the photos are on the same phone, each person can only see their own album. Dad can't accidentally look through Mum's private photos, and the kids can't see the parents' photos. The phone automatically shows you only your album when you open the photos app.

The anon key is like the front door key to an apartment building. It gets you in the building, but you can only open your own apartment. The service role key is like the building manager's master key. It opens every apartment. You'd never give the master key to a random visitor. That's why you only use the service role key on the server, never in the browser.

Together, authentication and RLS mean that even if something goes wrong in the app's code, the database itself protects each customer's data. It's like having a security guard at every door who checks your wristband before letting you in, even if the person who gave you directions made a mistake about which room you should go to.
