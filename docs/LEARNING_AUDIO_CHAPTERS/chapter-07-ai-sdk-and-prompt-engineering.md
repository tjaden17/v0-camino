# Chapter 7: AI SDK and Prompt Engineering
## How Your App Thinks, and How to Make It Think Better

### Introduction

Welcome to Chapter 7. This is arguably the most important chapter for Camino's product value, because the AI-generated interpretation is what makes Camino more than a dashboard. Dashboards show numbers. Camino explains what those numbers mean, why they matter, and what to do about them. That explanation comes from a large language model, and the quality of that explanation depends almost entirely on how you ask for it.

This chapter covers two things. First, the AI SDK by Vercel, which is the toolkit your app uses to talk to AI models. Second, prompt engineering, which is the art and science of writing instructions that get the AI to produce useful, consistent, accurate output.

The AI SDK is the plumbing. Prompt engineering is the recipe. You need both. Great plumbing with a bad recipe produces garbage output quickly. A great recipe with bad plumbing means the output might be good but the app is slow, unreliable, or expensive. Let's start with the plumbing.

### The AI SDK: What It Does

The AI SDK is a library that provides a unified interface for talking to AI models. Without it, you'd have to learn the specific API format for each model provider. OpenAI's API has one format. Anthropic's has another. Google's has a third. The AI SDK abstracts this away. You write your code once, and you can switch between models by changing a single string.

In Camino, your interpretation service uses the AI SDK to generate the five-section analysis for each signal. It sends a prompt describing the signal, the user's context, and the desired output format. The AI model processes that prompt and returns the interpretation. The SDK handles the network request, streaming, error handling, and response parsing.

The two main functions you'll use are generateText and streamText. generateText sends a prompt and waits for the complete response. It's simpler and good for background processing where the user isn't watching. streamText sends a prompt and starts returning the response word by word as the model generates it. It's better for real-time experiences where the user wants to see the text appearing.

For Camino's signal interpretations, generateText makes sense because the interpretations are generated after upload, not in real time while the user watches. The user opens a signal and sees the pre-generated interpretation instantly. If you were building a chat interface where the user asks questions about their signals, you'd use streamText so the response appears progressively.

### Model Selection

The AI SDK supports multiple model providers through the Vercel AI Gateway. You specify a model as a string like "openai/gpt-4o" or "anthropic/claude-sonnet-4" and the gateway routes your request to the right provider.

Different models have different strengths. Some are faster but less capable. Some produce better analysis but cost more and are slower. For Camino's interpretations, the trade-off is between quality and cost.

A more capable model like GPT-4o or Claude Sonnet will produce more nuanced, accurate analysis. It will understand business context better, make more insightful connections, and write more clearly. But each request costs more and takes longer.

A faster, cheaper model like GPT-4o-mini will produce acceptable analysis for simpler signals but might miss nuance or produce generic advice for complex ones.

For the MSS phase, quality matters more than cost because you have one customer and you need the interpretations to be impressive enough to justify billing. As you scale to more customers and generate more interpretations, you might use a faster model for routine signals and reserve the more capable model for complex ones. This is called model routing, and the AI SDK makes it easy because switching models is just changing the model string.

### The System Prompt

Every AI request has two parts: the system prompt and the user message. The system prompt sets the AI's persona, rules, and constraints. It's the same for every request. The user message contains the specific data for this particular request.

In Camino's interpretation service, the system prompt tells the AI: you are a business intelligence analyst. You provide concise, actionable insights. You write in a specific format with five sections. You never make up numbers. You always connect insights to the user's role and priorities.

The system prompt is the most leveraged thing you can improve. A small change to the system prompt affects every interpretation generated from that point forward. If you add "always start the So What section with a specific recommendation," every future interpretation will follow that pattern. If you add "never use more than three sentences per section," every interpretation becomes more concise.

Writing a good system prompt is like writing a good job description. You're hiring an AI analyst, and you need to tell them exactly what you expect. The more specific you are, the more consistent and useful the output.

### Prompt Engineering: The Core Principles

Prompt engineering is the practice of writing prompts that produce good output from AI models. It's called engineering because it's systematic, not magic. There are patterns that reliably improve output quality.

The first principle is: be specific. Vague instructions produce vague output. "Analyse this signal" produces generic fluff. "Analyse this signal's trend in the context of a 25-person SaaS company where the CEO's top priority this quarter is reducing customer churn" produces specific, relevant insights.

The second principle is: show, don't just tell. Instead of saying "write a good analysis," show the AI an example of what a good analysis looks like. This is called few-shot prompting. You include one or two examples of a signal and its ideal interpretation in the prompt. The AI mimics the pattern.

The third principle is: define the output format explicitly. If you want five sections, name them. If you want each section to be two to three sentences, say so. If you want the AI to return JSON, provide the exact schema. Ambiguity in the expected output leads to inconsistency.

The fourth principle is: give context. The AI doesn't know anything about the user, the organisation, or the business unless you tell it. The more relevant context you include, the more personalised and accurate the output. In Camino, this means including the user's role, their upcoming priorities, their signal preferences, the organisation's industry, company stage, and team size.

The fifth principle is: set boundaries. Tell the AI what not to do. "Never speculate about numbers you don't have." "Never recommend specific vendors or products." "If you don't have enough context for a section, say so rather than making something up." Boundaries prevent the AI from hallucinating, which means generating plausible-sounding but false information.

### Structured Output

For Camino, the AI doesn't just produce free-form text. It produces a structured interpretation with specific sections. This requires structured output, meaning you tell the AI to return data in a specific format, typically JSON.

The AI SDK supports structured output in two ways. The first is including format instructions in the prompt: "Return your response as a JSON object with these keys: summary, trend_analysis, so_what, action_items, context." The AI parses this instruction and formats its response accordingly.

The second is using the AI SDK's built-in schema validation, where you define a Zod schema for the expected output and the SDK ensures the response matches. This is more reliable because the SDK retries or adjusts if the response doesn't match the schema.

In Camino's interpretation service, structured output ensures that every interpretation has exactly five sections, each with a title and content. The UI can render each section consistently because it knows the exact shape of the data. If the AI returned unstructured text, you'd have to parse it and hope the sections are labelled correctly.

### Temperature: Creativity vs Consistency

Temperature is a parameter that controls how creative or random the AI's output is. A temperature of 0 means the AI always picks the most likely next word, producing deterministic, consistent output. A temperature of 1 means the AI introduces more randomness, producing more varied and creative output.

For Camino's interpretations, you want low temperature, around 0.2 to 0.4. You want the analysis to be consistent and grounded, not creative and surprising. If the same signal produces wildly different interpretations each time, users will lose trust. They'll wonder which interpretation is correct.

Low temperature doesn't mean boring. It means reliable. The AI still produces different text for different signals because the input data is different. But for the same signal with the same context, the analysis will be similar each time. This consistency is what makes the output feel authoritative rather than random.

### Token Limits and Cost

AI models process text in units called tokens. A token is roughly four characters of English text. Both the input, your prompt plus context, and the output, the AI's response, consume tokens. Most models have a maximum context window, the total number of input plus output tokens they can handle.

For Camino, the context window matters because your prompts can get large. The system prompt, plus the signal data, plus the user profile, plus the organisation context, plus few-shot examples, plus the formatting instructions, all adds up. If you exceed the context window, the model either truncates your input or rejects the request.

Cost is directly proportional to tokens. More tokens in, more tokens out, higher cost. For the MSS phase with one customer and maybe 20 signals, the cost is negligible. But at scale with hundreds of customers and thousands of signals, each being reinterpreted weekly, costs add up.

The optimisation is: include only what's necessary in the prompt. Don't dump the entire user profile if only the role and priorities are relevant. Don't include five examples if two are enough. Be concise in the system prompt. Every unnecessary word costs tokens.

### Error Handling and Reliability

AI API calls can fail. The model provider might be down. The request might timeout. The response might not match the expected format. Your app needs to handle all of these gracefully.

The AI SDK provides retry functionality. If a request fails due to a transient error, the SDK can automatically retry a configurable number of times with exponential backoff. This handles most temporary failures without the user noticing.

For format errors, where the AI returns text that doesn't match your expected structure, you should have a fallback. Parse the response, and if it doesn't match, either retry with a clearer prompt or return a generic "interpretation unavailable" message. Don't show malformed data to the user.

For timeout errors, set a reasonable timeout for each request. A signal interpretation shouldn't take more than 15 to 20 seconds. If it does, something is wrong. Time out, log the error, and show a fallback.

In Camino, interpretations are generated after upload, not in real time. This means a failure doesn't block the user. The signals appear immediately after upload. The interpretations are generated in the background. If an interpretation fails, the signal card shows "Interpretation pending" and the system retries later.

### Improving Camino's Interpretations

Now let's get specific. Here are practical ways to improve the quality of Camino's AI-generated interpretations.

First, add few-shot examples. Take a real signal from your first customer, write the ideal interpretation manually, and include it in the prompt as an example. The AI will match the tone, depth, and format of your example.

Second, inject more context. The more the AI knows about the user and their business, the more personalised the output. Include the user's role, their stated priorities, what decisions they're making this quarter, what industry they're in, and how many people they manage.

Third, add negative examples. Show the AI what bad output looks like and tell it not to do that. "Don't write generic advice like 'consider reviewing your metrics.' Always connect advice to the specific signal and user context."

Fourth, test with real data. Generate interpretations for your first customer's actual signals and read them critically. Are they accurate? Are they specific? Would an exec find them useful? If not, adjust the prompt and regenerate.

Fifth, version your prompts. Keep a record of each prompt version and the output quality it produces. When you change the prompt, regenerate a few test interpretations and compare. This prevents regressions where a prompt change improves one section but degrades another.

### Explain It Like I'm 12

Imagine you hire a really smart assistant who has read millions of business books and reports. This assistant can analyse any data you give them and write a summary. But here's the catch: they only know what you tell them in each conversation. They don't remember you from last time. They don't know your company, your role, or what you care about, unless you include it in your message.

The system prompt is like a job briefing you give the assistant before each task. "You work for a 25-person tech company. The CEO cares about customer churn. Always explain why metrics matter, not just what they are. Write in five sections. Keep it under 200 words per section."

The user message is the specific task. "Here's a signal: Pipeline Value dropped 34% this month. Here are the details. Analyse it."

The better your briefing, the better the analysis. If you just say "analyse this number," you get a generic response. If you say "analyse this number for a CEO who's worried about losing customers and is considering raising prices," you get a response that directly addresses their concerns.

Temperature is how creative you want the assistant to be. For business analysis, you want them to be reliable and consistent, not surprising and creative. You set the creativity dial low.

And tokens are like the word limit on a school essay. Your instructions and the assistant's response both count toward the limit. So you want your instructions to be clear and concise, not rambling, to leave room for a good response.

The whole point: the AI is only as good as the instructions you give it. Better prompts equal better interpretations. And better interpretations are what make a customer say "this is worth paying for."
