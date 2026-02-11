# Chapter 2: React Fundamentals
## How Your User Interface Actually Works Under the Hood

### Introduction

Welcome to Chapter 2. This chapter is about React, the library that powers every screen your customer sees in Camino. When an exec opens the app and sees their signal cards, when an admin uploads a CSV, when anyone clicks a button or scrolls through a list, that's React doing its job.

React has one big idea, and once you understand it, everything else falls into place. That idea is: your UI is a function of your data. You give React some data, and it gives you back a screen. When the data changes, the screen updates automatically. You never manually update the screen. You just update the data, and React figures out what changed and redraws the parts that need redrawing.

This is a fundamentally different way of thinking about user interfaces compared to the old approach where you'd manually find a button on the screen, change its colour, find a text label, change its words, find a list, add an item to it. That approach is like giving someone step-by-step directions: "walk to the kitchen, open the second drawer, take out a fork." React's approach is like describing what the table should look like: "I need a plate, a fork, a knife, and a glass." React figures out what to add, remove, or change to make the current table match your description.

### Components: The Building Blocks

In React, everything is a component. A component is a function that returns a description of what should appear on screen. That description is written in a syntax called JSX, which looks like HTML but lives inside your JavaScript code.

In Camino, your signal accordion card is a component. It's a function that receives a signal object, the name, the value, the trend, and returns a description of a card with a title, a number, an arrow icon, and a percentage. Your upload page is a component. Your admin panel is a component. Your entire app is made up of components nested inside other components.

Think of components like Russian nesting dolls. Your page component contains a header component and a content component. The content component contains a list of signal card components. Each signal card component contains a title component, a value component, and a trend component. This nesting creates a tree structure, and React manages the entire tree.

The power of components is reusability. You write the signal card component once, and you use it fifty times, once for each signal. If you need to change how every signal card looks, you change it in one place, and every card updates. This is why your codebase has a components folder full of reusable pieces.

### Props: How Data Flows Down

Components need data to know what to display. That data comes through props, short for properties. Props are like the arguments you pass to a function, because components are functions.

When your signals page renders a signal card, it passes the signal data as props. The card receives those props and uses them to decide what to display. The signal name becomes the card title. The absolute value becomes the displayed number. The trend direction determines whether an up arrow or down arrow appears.

The crucial rule about props is that they flow in one direction: from parent to child. The signals page passes data down to the signal card. The signal card never reaches back up to change data in the signals page. This one-way flow is what makes React predictable. When something goes wrong, you can trace the data from parent to child and find where the wrong value entered the tree.

In Camino, this means: the data for your signals page comes from the top. It's fetched from the database, passed to the page component, which passes individual signals to card components, which pass pieces to their child components. If a signal card is showing the wrong number, you trace upward. Is the card receiving the wrong prop? Is the page passing the wrong data? Is the database returning the wrong value? The one-way flow gives you a clear debugging path.

### State: Data That Changes Over Time

Props are data that comes from a parent. But what about data that lives inside a component and changes over time? That's state.

In Camino's upload page, there are several pieces of state. Which files has the user selected? That's state. Which step of the upload flow are they on? That's state. Are the 3-question answers filled in? That's state. Has the upload started processing? That's state.

React provides a tool called useState for managing state inside a component. When you call useState, you get two things back: the current value and a function to update it. When you call that update function, React re-renders the component with the new value.

The key insight is: you never change state directly. You don't say "files equals new list." You say "setFiles new list." This distinction matters because React needs to know when state changes so it can re-render. If you change the variable directly, React doesn't know anything happened, and the screen won't update.

This is probably the most common source of confusion for new React developers. "I changed the value, why didn't the screen update?" The answer is almost always: you changed it directly instead of using the setter function.

In your Camino codebase, every useState call represents a piece of interactive data. The upload flow has state for the selected files, the current step, the parsed data, the user's answers to the 3 questions, and the processing status. Each piece of state has its own setter function, and when any of them change, React re-renders the relevant parts of the screen.

### Effects: Doing Things When Data Changes

Sometimes you need to do something in response to a change. When the user selects a file, you need to parse it. When the upload completes, you need to show a success message. When the component first appears on screen, you might need to load some data.

This is what useEffect is for. An effect is a function that runs after the component renders. You tell it what data to watch, and it runs whenever that data changes.

In the old way of thinking about UIs, you'd say "when the user clicks this button, do this thing." Effects flip that around. You say "whenever this piece of data changes, do this thing." It doesn't matter how the data changed, whether it was a button click, a timer, or data arriving from the server. The effect responds to the change, not the event.

Effects have a dependency array, which is the list of values the effect watches. If you pass an empty array, the effect runs once when the component first appears and never again. If you pass specific values, the effect runs whenever any of those values change. If you pass no array at all, the effect runs after every single render, which you almost never want.

In Camino, effects are used in the upload flow to parse files when they're selected, to auto-scroll to the latest step, and to trigger processing when the user confirms their answers. Each effect watches specific state values and responds when they change.

One important note: there's a modern movement in React to use effects less, not more. If you can compute something directly from existing state or props, do that instead of using an effect. Effects are for synchronising with external systems, like APIs, the browser, or databases. They're not for computing derived values. This is a common mistake, and you'll see it corrected in modern React documentation.

### Conditional Rendering

Your UI needs to show different things in different situations. When the user hasn't uploaded a file, show the file picker. When they have, show the classification questions. When they're processing, show a loading spinner. When it's done, show the results.

React handles this with regular JavaScript conditionals inside JSX. You can use an if statement, a ternary operator, or the logical AND operator. There's no special React syntax for this. It's just: if this condition is true, render this, otherwise render that. Or: if this condition is true, render this, otherwise render nothing.

In Camino, the upload flow uses conditional rendering heavily. The current step determines which section of the form is visible. The upload status determines whether a spinner or a success icon appears. Whether the user is an admin determines whether they see the admin panel options.

The mental model is: your component function runs, evaluates conditions, and returns a description of what should appear right now. If the conditions change, the function runs again, evaluates the new conditions, and returns a new description. React compares the old and new descriptions and updates only the parts that changed. This is called reconciliation, and it's what makes React fast.

### Lists and Keys

When you have an array of data and need to render an item for each entry, you use the map function to transform data items into component elements. Your signals page does this: it takes an array of signal objects and maps each one to a signal card component.

There's one important requirement when rendering lists: keys. Every item in a list needs a unique key prop, typically the item's ID from the database. React uses keys to track which items were added, removed, or moved when the list changes. Without keys, React would have to throw away and recreate the entire list every time anything changes. With keys, it can surgically update only the items that actually changed.

In Camino, your signal cards should use the signal's ID as the key. Your upload tabs should use the tab name as the key. If you see a warning in the console about missing keys, it means React can't efficiently update your list, and you might see weird behaviour like the wrong card expanding when you click one.

### Event Handlers

The final piece of the React puzzle for this chapter is event handlers. When a user clicks a button, selects a file, types in a field, or submits a form, your component needs to respond. Event handlers are functions you attach to elements that run when the event occurs.

In JSX, you pass event handlers as props to elements. An onClick prop receives a function that runs when the element is clicked. An onChange prop receives a function that runs when the element's value changes. These handlers typically call state setter functions to update the component's state, which triggers a re-render, which updates the screen.

The flow is always the same: event occurs, handler runs, state updates, component re-renders, screen updates. This cycle is the heartbeat of every React application, including Camino. When you click the "Generate Signals" button, the handler calls setProcessing to true, which re-renders the button to show a spinner, then calls the API, then calls setResults with the response, which re-renders the page to show the generated signals.

### How This Applies to Camino Right Now

Your entire customer-facing experience is React components passing props, managing state, running effects, and responding to events. The signals page fetches data and renders a list of card components. The upload page manages a multi-step form with state for each step. The admin panel conditionally renders based on the user's role.

When something isn't working, the debugging process is always the same. What state is this component managing? What props is it receiving? Are the values correct? If not, trace them upstream. Is an effect running when it shouldn't be, or not running when it should? Is a handler updating the wrong piece of state?

Understanding these fundamentals means you can read any component in your codebase and understand what it's doing. Not every line, but the structure. The data flow. The reason behind each piece of state. And that understanding is what lets you modify, extend, and debug with confidence.

### Explain It Like I'm 12

Imagine you're building something with LEGO. Each LEGO piece is a component. Small pieces snap together to make bigger pieces, which snap together to make even bigger pieces, which eventually make the whole thing.

Each piece needs to know some information to look right. A window piece needs to know how wide it should be. A door piece needs to know what colour it is. That information is called props, and it always comes from the bigger piece that contains it.

Some pieces can change. A door can be open or closed. A light can be on or off. That changing information is called state. When the state changes, like when you flip the light switch, the piece automatically updates to show the new state.

The whole LEGO model is described by its pieces and their current state. When something changes, you don't rebuild the whole model. You just swap the pieces that need to change. React does this swapping automatically and very quickly, so the screen always matches the current state of your data.

That's it. Components, props, state. Build small pieces, pass them information, let them change when they need to. Everything else in React is just a variation on these three ideas.
