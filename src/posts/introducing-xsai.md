---
title: Introducing xsAI,<br />a < 6KB Vercel AI SDK alternative
date: 2025-03-03
author: 藍+85CD
tags:
  - Announcements
---

> A minimal AI SDK, you can run anywhere.

## Why another AI SDK?

[Vercel AI SDK](https://sdk.vercel.ai/) is way too big, it includes unnecessary dependencies.

[![pkg-size-ai](/images/pkg-size-ai.png)](https://pkg-size.dev/ai@4.1.47)

For example, Vercel AI SDK shipped with non-optional request and response validation, non-optional
[OpenTelemetry](https://opentelemetry.io/) dependencies, and bind the user to use [zod](https://zod.dev/) (you don't
get to choose), and so much more...

This makes it hard to build small and decent AI applications & CLI tools with less bundle size and more controllable
and atomic capabilities that user truly needed.

But, it doesn't need to be like this, isn't it?

### So how small is xsAI?

Without further ado, let's look:

[![pkg-size-xsai](/images/pkg-size-xsai.png)](https://pkg-size.dev/xsai@0.1.0-beta.9)

It's roughly a hundred times smaller than the Vercel AI SDK (*install size) and has most of its features.

Also it is 5.7KB gzipped, so the title is not wrong.

[![pkg-size-xsai-bundle](/images/pkg-size-xsai-bundle.png)](https://pkg-size.dev/xsai@0.1.0-beta.9)

## Getting started

You can install the `xsai` package, which contains all the core utils.

```bash
npm i xsai
```

Or install the corresponding packages separately according to the required
features:

```bash
npm i @xsai/generate-text @xsai/embed @xsai/model
```

### Generating Text

So let's start with some simple examples.

```ts
import { generateText } from '@xsai/generate-text'
import { env } from 'node:process'

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  model: 'gpt-4o'
  messages: [{
    role: 'user',
    content: 'Why is the sky blue?',
  }],
})
```

xsAI does not use the provider function [like Vercel does](https://sdk.vercel.ai/docs/foundations/providers-and-models) by default,
we simplified them into three shared fields: `apiKey`, `baseURL` and `model`.

- `apiKey`: Provider API Key
- `baseURL`: Provider Base URL (will be merged with the path of the corresponding util, e.g. `new URL('chat/completions', 'https://api.openai.com/v1/')`)
- `model`: Name of the model to use

> Don't worry if you need to support non-OpenAI-compatible API provider, such as [Claude](https://claude.ai/), we left the possibilities to override
> [`fetch(...)`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) where you can customize how the request is made,
> and how the response was handled.

This allows xsAI to support any OpenAI-compatible API without having to create provider packages.

### Generating Text w/ Tool Calling

Continuing with the example above, we now add the tools.

```ts
import { generateText } from '@xsai/generate-text'
import { tool } from '@xsai/tool'
import { env } from 'node:process'
import * as z from 'zod'

const weather = tool({
  name: 'weather',
  description: 'Get the weather in a location',
  parameters: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async ({ location }) => ({
    location,
    temperature: 72 + Math.floor(Math.random() * 21) - 10,
  }),
})

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  model: 'gpt-4o'
  messages: [{
    role: 'user',
    content: 'What is the weather in San Francisco?',
  }],
  tools: [weather],
})
```

Wait, [`zod`](https://zod.dev) is not good for tree shaking and annoying. Can we use [`valibot`](https://valibot.dev)? **Of course!**

```ts
import { tool } from '@xsai/tool'
import { description, object, pipe, string } from 'valibot'

const weather = tool({
  name: 'weather',
  description: 'Get the weather in a location',
  parameters: object({
    location: pipe(
      string(),
      description('The location to get the weather for'),
    ),
  }),
  execute: async ({ location }) => ({
    location,
    temperature: 72 + Math.floor(Math.random() * 21) - 10,
  }),
})
```

We can even use [`arktype`](https://arktype.io), and the list of compatibility will grow in the future:

```ts
import { tool } from '@xsai/tool'
import { type } from 'arktype'

const weather = tool({
  name: 'weather',
  description: 'Get the weather in a location',
  parameters: type({
    location: 'string',
  }),
  execute: async ({ location }) => ({
    location,
    temperature: 72 + Math.floor(Math.random() * 21) - 10,
  }),
})
```

> xsAI doesn't limit your choices into either [`zod`](https://zod.dev), [`valibot`](https://valibot.dev), or [`arktype`](https://arktype.io), with
> the power of [Standard Schema](https://github.com/standard-schema/standard-schema), you can use any schema library it supported you like.

## Next steps

### Big fan of [Anthropic's MCP](https://www.anthropic.com/news/model-context-protocol)?

We are working on [Model Context Protocol](https://modelcontextprotocol.io/introduction) support: [#84](https://github.com/moeru-ai/xsai/pull/84)

After that, it could be Framework Binding.

### Don't like any of the cloud provider?

We are working on a [🤗 Transformers.js](https://huggingface.co/docs/transformers.js/index) provider that enables you to directly run LLMs and any
🤗 Transformers.js supported models directly in browser, with the power of WebGPU!

You can track the progress here: [#41](https://github.com/moeru-ai/xsai/issues/41). It is really cool and playful to run embedding, speech,
and transcribing models directly in the browser, so, stay tuned!

## Documentation

Since this is just an introduction article, it only covers `generate-text` and `tool`.

`xsai` [has more utils:](https://github.com/moeru-ai/xsai/blob/main/packages/xsai/src/index.ts)

```ts
export * from '@xsai/embed'
export * from '@xsai/generate-object'
export * from '@xsai/generate-speech'
export * from '@xsai/generate-text'
export * from '@xsai/generate-transcription'
export * from '@xsai/model'
export * from '@xsai/shared-chat'
export * from '@xsai/stream-object'
export * from '@xsai/stream-text'
export * from '@xsai/tool'
export * from '@xsai/utils-chat'
export * from '@xsai/utils-stream'
```

If you are interested, go to the documentation at <https://xsai.js.org/docs> to get started!

Besides xsAI, we made loads of other cool stuff too! Check out our [`moeru-ai` GitHub organization](https://github.com/moeru-ai)!
