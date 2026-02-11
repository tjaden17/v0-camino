# Chapter 1: TypeScript Fundamentals
## Why Every Line of Your Code Has a Type -- And Why That Matters

### Introduction

Welcome to Chapter 1 of the Camino Builder curriculum. This chapter is about TypeScript, the programming language your entire application is written in. Every single file in Camino, from the upload page to the signal calculation service to the AI interpretation engine, is TypeScript.

But here's the thing. TypeScript isn't really a separate language. It's JavaScript with one crucial addition: types. And understanding types is the single most important thing you can learn right now, because types are what prevent an entire category of bugs before your code even runs.

Think about it this way. JavaScript is like writing a recipe where you say "add some of the white stuff to the bowl." Could be sugar, could be salt, could be flour. JavaScript doesn't care. It just tries to do whatever you tell it, even if it makes no sense. TypeScript is like writing a recipe where you say "add 200 grams of plain flour to the bowl." Now everyone knows exactly what goes in, and if someone tries to put salt in instead, the recipe stops you before you ruin the cake.

That's what TypeScript does. It catches mistakes before your code runs, not after your customer sees a broken page.

### What Are Types?

At the most basic level, a type describes what kind of value something is. In the real world, you intuitively understand types. The number 42 is different from the word "hello" which is different from the idea of true or false. You'd never try to multiply the word "hello" by 3. That doesn't make sense.

In TypeScript, you make these distinctions explicit. You can say: this variable is a number. This variable is a string. This variable is a boolean, which means it's either true or false.

TypeScript has a handful of basic types that everything else is built from. There's "string" for text, "number" for any numeric value including decimals, "boolean" for true or false, "null" for intentionally empty, "undefined" for not yet set, and "any" which means "I give up, it could be anything." You want to avoid "any" as much as possible because it turns off TypeScript's safety net.

In Camino, you see types everywhere. When a signal has a trend field, that field isn't just any string. It's specifically "up" or "down" or "stable." When a signal has an absolute_value field, that's specifically a number, not a string that happens to contain digits. This precision is what prevents the kind of bugs where you try to do math on the text "five hundred" instead of the number 500.

### Type Annotations vs Type Inference

There are two ways TypeScript knows what type something is. The first is type annotations, where you explicitly write the type. You might write "const name: string equals 'Camino'" and you've told TypeScript that name is a string. The second is type inference, where TypeScript figures it out on its own. If you write "const count equals 42" without saying the type, TypeScript looks at the value 42 and infers that count must be a number.

Type inference is one of TypeScript's best features because it means you don't have to write types everywhere. The compiler is smart enough to figure most of them out. But there are times when you should write the type explicitly. Function parameters are the big one. If a function takes a parameter, TypeScript can't know what type it should be unless you tell it. Return types are another, they help document what a function gives back.

In your Camino codebase, you'll see both patterns. Some functions have explicit return types. Others let TypeScript infer. Both are valid, but being explicit about important boundaries, like what an API route returns or what a service function accepts, makes the code much easier to read and maintain.

### Interfaces and Types

Once you move beyond basic types like string and number, you need a way to describe the shape of objects. In your Camino code, you're not passing around simple strings. You're passing around signal objects with names, values, trends, dates, categories, and more. You need a way to say "a signal looks like this."

TypeScript gives you two tools for this: interfaces and types. They're very similar, and in practice you can use either one. An interface says "an object with this shape." A type alias says "this name refers to this structure." The Camino codebase uses both. Your SignalInterpretation is defined as an interface. It says: an interpretation has an id which is a string, a signal_id which is a string, sections which is an array of objects each with a title and content, and so on.

The practical difference is small. Interfaces can be extended, meaning you can create a new interface that inherits from an existing one and adds extra fields. Types are more flexible, they can represent unions, intersections, and other more complex structures. But for defining the shape of an object, they're interchangeable.

The key takeaway isn't which one to use. It's that you should define the shape of your data. When you pass a signal object from the database to the UI, both the sender and the receiver should agree on what that object looks like. The interface is the contract between them.

### Generics

Generics are where TypeScript gets more powerful, and they're easier to understand than they look. A generic is a type that takes a parameter. It's like a function, but for types.

You've already used generics without realising it. Every time you write "Promise" followed by a type in angle brackets, that's a generic. A Promise of boolean means "this is a promise that will eventually resolve to a boolean." A Promise of string means "this is a promise that will eventually resolve to a string." The Promise is the same structure, but what it contains varies.

In Camino, your checkConnection function returns "Promise boolean." That tells everyone: when this function finishes, you'll get back either true or false. If you tried to treat the result as a string, TypeScript would catch that mistake.

Arrays are also generic. "string array" or "Array of string," same thing, means "a list where every item is a string." Your signals might be typed as "Signal array" meaning "a list where every item matches the Signal interface."

The concept is: generics let you write reusable structures that work with different types. You don't need to write a separate Promise for strings and a separate Promise for numbers. You write one Promise that works with any type, and you specify which type when you use it.

### Union Types

Union types are one of the most useful features in TypeScript, and your Camino codebase uses them heavily. A union type means "this value can be one of several types." You write it with a pipe character between the options.

The most important union type in your code is the signal trend field: "up" pipe "down" pipe "stable." This means a trend can only be one of those three exact strings. Not "UP" with capitals, not "going up," not "positive." Just those three values. If any code tries to set the trend to something else, TypeScript catches it immediately.

Union types are powerful because they force you to handle all the possibilities. If a function receives a trend that's "up" or "down" or "stable," and you write logic that only handles "up" and "down," TypeScript can warn you that you forgot about "stable." This prevents the class of bugs where an unexpected value slips through and causes a crash.

You also see union types with "null" or "undefined." A signal's description might be typed as "string or null," meaning it can either have a description or not have one. This forces you to check for null before using the description, preventing the dreaded "Cannot read property of null" error that crashes so many JavaScript applications.

### Optional Properties

Related to union types is the concept of optional properties. In an interface, you can mark a property with a question mark to say "this field might not be present." It's different from null. Null means the field exists but has no value. Optional means the field might not be there at all.

In your Camino interfaces, you'll see things like "description question mark colon string." This means an object might or might not have a description field. When you access it, TypeScript knows it could be undefined, so it nudges you to check first.

This is especially important for your upload flow. When a user uploads a CSV, some columns might be present and some might not. The TypeScript types should reflect that reality. If a date column is optional because not every CSV has dates, the type should say so. Then any code that tries to use the date column is forced to handle the case where it's missing.

### Type Narrowing

The final concept for this chapter is type narrowing, and it's where everything comes together. Type narrowing is how TypeScript gets smarter about a type within a block of code based on the checks you've made.

Say you have a variable that's typed as "string or number." At the top of your function, TypeScript only knows it's one of those two things. But if you write an if statement that checks "if typeof value equals string," then inside that if block, TypeScript knows the value is specifically a string. You've narrowed the type from "string or number" down to just "string."

In your Camino catch blocks, you see this pattern constantly. The error in a catch block is typed as "unknown" because literally anything can be thrown in JavaScript. But when you check "if error instanceof Error," TypeScript narrows it down to the Error type, and now you can safely access error.message. Without that check, TypeScript won't let you access .message because it doesn't know the caught value is actually an Error object.

Type narrowing is why TypeScript feels intelligent. It's not just checking types at the top of a function and giving up. It tracks how types change as your code executes, getting more precise after every check.

### How This Applies to Camino Right Now

Everything in this chapter directly maps to your codebase. Your signal generation pipeline depends on correct types to ensure that a numeric value stays numeric throughout the calculation chain. Your field aliases system uses union types to constrain what data types are valid. Your AI interpretation service uses interfaces to define the exact shape of the prompt and the response. Your error handling uses type narrowing to safely extract error messages.

When you open your Camino code next, look at the types. Read the interfaces. Notice where TypeScript is protecting you from mistakes. And when you see a type error, don't just add "as any" to make it go away. The error is telling you something. It's saying "these two things don't match, and if you ignore me, your customer might see a bug."

### Explain It Like I'm 12

Imagine you have a bunch of labelled boxes. One box says "numbers only," another says "words only," another says "true or false only." When you're building something, you have to put things in the right boxes. If you try to put a word in the numbers box, someone stops you and says "that's the wrong box."

That's TypeScript. It's the labels on the boxes. JavaScript lets you put anything anywhere and hopes for the best. TypeScript makes you label everything, so you know exactly what's in each box. It catches mistakes before they cause problems.

The fancier stuff, like interfaces, generics, and union types, is just building bigger boxes out of smaller boxes. An interface says "this box contains a smaller box of words, a smaller box of numbers, and a smaller box of true-or-false." A generic says "this box can hold any type of smaller box, you just tell me which one when you use it." A union type says "this box accepts words or numbers, but nothing else."

The whole point is: if the labels are right, the stuff inside will be right too. And when you're building an app that calculates business metrics for a paying customer, "right" really matters.
