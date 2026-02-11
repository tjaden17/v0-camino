# Chapter 3: Next.js App Router
## Why Some Code Runs on the Server and Some on the Client

### Introduction

Welcome to Chapter 3. You've learned TypeScript, which is the language. You've learned React, which builds the user interface. Now you need to understand Next.js, which is the framework that ties everything together and decides where and when your code runs.

Here's the core question Next.js answers: when a user visits your app, what happens between them typing the URL and seeing the page? In a simple React app, the answer is straightforward. The browser downloads a big JavaScript file, runs it, and builds the page right there on the user's device. That's called client-side rendering.

Next.js changes the equation. It says: why make the user's device do all the work? Let's do some of the work on the server before we send anything to the browser. The server can fetch data from the database, render the initial page, and send ready-to-display HTML to the user. The page appears faster because the user doesn't have to wait for JavaScript to download and execute before seeing anything.

But here's where it gets interesting for Camino. Some things have to happen on the server, like reading from the database or checking authentication. Other things have to happen in the browser, like responding to button clicks or showing upload progress. Next.js gives you tools to decide which code runs where. And your entire app's architecture depends on this distinction.

### File-Based Routing

The first thing Next.js does differently from plain React is routing. In a plain React app, you have to configure routes manually, telling the app which component to show at which URL. In Next.js, the file system is the router. The folder structure inside your app directory directly maps to URLs.

In Camino, you have a file at app, then a folder called "(protected)," then a folder called "signals," then page.tsx. That file becomes the page that renders when someone visits the /signals URL. You have app, "(protected)," "upload," page.tsx. That becomes /upload. You have app, api, upload, generate, route.ts. That becomes the API endpoint at /api/upload/generate.

This means you can look at the folder structure and immediately know every URL in your application. No configuration file. No routing table. The folders are the routes.

### Route Groups

You might have noticed the "(protected)" folder in Camino's file structure. The parentheses make it a route group. A route group affects how your code is organised but doesn't affect the URL. The /signals URL is just /signals, not /protected/signals. The "(protected)" folder is invisible in the URL.

So why does it exist? Because route groups can have their own layout files. In Camino, the "(protected)" layout wraps every page inside it with authentication checking. It verifies that the user is logged in before showing the page. If they're not logged in, it redirects them to the sign-in page.

This is elegant because it means you don't have to add authentication checks to every individual page. You put all the pages that require authentication inside the "(protected)" route group, and the group's layout handles the auth check once. Any page outside the group, like the sign-in page or a public landing page, doesn't get the auth check.

### Server Components vs Client Components

This is the most important concept in this chapter, and probably the most confusing one in modern Next.js. Every component in your app is either a Server Component or a Client Component, and the distinction changes everything about what that component can do.

A Server Component runs on the server. It can directly read from the database, access environment variables with secrets, and fetch data without the user's browser being involved. The user never sees the code of a Server Component. It runs, produces HTML, and sends that HTML to the browser. Server Components are the default in Next.js. If you don't do anything special, every component is a Server Component.

A Client Component runs in the browser, on the user's device. It can respond to clicks, manage state with useState, use effects with useEffect, and access browser-specific features. A Client Component is marked with "use client" at the top of the file.

Here's the key rule: Server Components cannot use useState, useEffect, or event handlers. They don't run in the browser, so there's no user interaction to respond to. Client Components cannot directly access the database or server-only secrets. They run in the browser, and you can't give the browser your database password.

In Camino, your signals page is a Server Component. It fetches signal data from the database on the server and renders the initial page. But the signal card with its expand and collapse behaviour is a Client Component, because expanding a card requires managing state in the browser. The upload page is a Client Component because it needs to manage file selection, form state, and upload progress.

The mental model is: Server Components are for reading and displaying data. Client Components are for interactive behaviour. Data flows from Server to Client, never the other way around.

### Layouts

Layouts are components that wrap multiple pages. Your root layout at app/layout.tsx wraps every page in the entire application. It's where you set the HTML structure, load fonts, and include global CSS. Every page inherits from this layout.

Your "(protected)" layout at app/(protected)/layout.tsx wraps every authenticated page. It adds the authentication check and the main navigation. When a user moves from /signals to /upload, the root layout and the protected layout stay mounted. Only the page content changes. This means the navigation doesn't flash or reload, and any state held in the layouts persists across page transitions.

This nesting is powerful. The root layout provides the global shell. The protected layout provides the authenticated shell. Each page provides its specific content. When you navigate between pages, Next.js only re-renders the parts that changed, not the entire screen.

### API Routes

Not everything in your app is a page. Some URLs are API endpoints, meaning they receive data, process it, and return a response. In Next.js, API routes live in the app/api folder and are defined in route.ts files.

In Camino, your most important API route is app/api/upload/generate/route.ts. This receives the uploaded data and the user's 3-question answers, processes them, generates signals, and returns the results. It's a POST endpoint, meaning it receives data and creates something new.

API routes run entirely on the server. They can access the database, call external APIs, process data, and return JSON responses. The browser calls them using fetch, sends data, and receives results. This is how your upload flow works: the Client Component in the browser collects the files and answers, sends them to the API route, and the API route does the heavy lifting of signal generation on the server.

The separation is clean. The browser handles the user interaction, collecting files and answers. The server handles the data processing, calculating signals and storing them. They communicate through API routes.

### Server Actions

Server Actions are a newer feature in Next.js that blur the line between client and server in a convenient way. A Server Action is a function that runs on the server but can be called directly from a Client Component without you having to create an API route.

You define a Server Action by adding "use server" at the top of a function or file. Then you can call that function from a form or a button handler in the browser. Next.js handles the network request behind the scenes. The function runs on the server, accesses the database or whatever it needs, and returns the result.

Server Actions are particularly useful for form submissions and data mutations. Instead of creating an API route, writing a fetch call in the client, and handling the request and response manually, you just call the function. It's cleaner and less code.

In Camino, Server Actions could be used for things like saving profile updates, creating organisations, or triggering signal generation. Some of these might currently be API routes, and that's fine. Both approaches work. Server Actions are just a more ergonomic option for certain patterns.

### Loading and Error States

Next.js has built-in support for loading and error states at the route level. If you create a loading.tsx file next to a page.tsx file, Next.js automatically shows that loading component while the page is loading its data. If you create an error.tsx file, Next.js shows that error component if the page throws an error.

This is important because it means the user always sees something. If your signals page takes 2 seconds to load data from the database, the user sees a loading state during those 2 seconds, not a blank screen. If something goes wrong, the user sees a friendly error message, not a crashed page.

The error.tsx file is particularly valuable because it acts as an error boundary. If a component inside the page throws an error, the error boundary catches it and shows a fallback UI. Without it, the entire page, or even the entire app, could crash. With it, the error is contained to that specific page.

For Camino, this means: if the signal calculation fails for one user, the error boundary catches it and shows a message like "Something went wrong loading your signals." The rest of the app still works. The user can navigate to other pages. This is much better than a white screen of death.

### Middleware and Authentication

The last major concept is middleware, which in Next.js runs before any page loads. Middleware intercepts every request and can redirect, rewrite, or modify the response before the page even starts rendering.

In Camino, middleware is used for authentication. Before any protected page loads, middleware checks if the user has a valid session. If they do, the request continues to the page. If they don't, middleware redirects them to the sign-in page. This happens before any page code runs, so unauthorised users never even see a flash of the protected page.

Middleware is defined in a middleware.ts file at the root of your project, or in Next.js 16, it can also be proxy.js, though middleware.ts is backwards compatible. It uses a matcher configuration to specify which routes it applies to. In Camino, the matcher likely includes all routes except the sign-in page and public routes.

### How This All Fits Together in Camino

When a user visits /signals, here's what happens:

First, middleware checks authentication. The user has a valid session, so the request proceeds.

Second, the root layout renders the HTML shell, the body tag, the global styles.

Third, the "(protected)" layout renders the authenticated shell, including the navigation. It also double-checks auth.

Fourth, the signals page, a Server Component, runs on the server. It queries the database for the user's signals. It gets back an array of signal objects.

Fifth, the page renders signal card components, passing each signal as props. The signal cards are Client Components because they have interactive expand and collapse behaviour.

Sixth, Next.js sends the rendered HTML to the browser. The user sees the signals immediately.

Seventh, the browser loads the JavaScript for the Client Components. Now the signal cards become interactive. The user can click to expand them.

This entire flow, from URL to interactive page, is orchestrated by Next.js. You don't manage any of it manually. You just put files in the right folders, mark components as server or client, and Next.js handles the rest.

### Explain It Like I'm 12

Imagine your app is a restaurant. The kitchen is the server. The dining room is the browser where the user sits.

Next.js is the restaurant manager. It decides what gets prepared in the kitchen and what happens at the table.

The heavy work, cooking the food, getting the ingredients, happens in the kitchen. That's your Server Components fetching data from the database. The customer never goes into the kitchen. They just get the finished plate.

The interactive stuff, choosing from the menu, asking for extra sauce, happens at the table. That's your Client Components responding to clicks and managing state.

The file structure is like the restaurant's floor plan. Each folder is a room, and the room's name tells you the address. The signals folder becomes the /signals table number. The upload folder becomes the /upload table number.

Layouts are like the restaurant's decor that stays the same no matter which table you sit at. The walls, the music, the general atmosphere don't change when you move from one table to another.

And the middleware is the person at the door checking if you have a reservation. If you do, you get in. If you don't, they send you to the booking page. This happens before you even see the restaurant, so you can't sneak in.

The whole point: Next.js makes sure the right work happens in the right place, the kitchen for heavy lifting, the table for interaction, so the customer gets their food fast and can interact with it comfortably.
