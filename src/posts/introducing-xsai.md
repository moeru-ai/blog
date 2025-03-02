---
title: Introducing xsAI,<br />a < 6KB AI SDK Alternative
date: 2025-03-03
author: 藍+85CD
tags:
  - Announcements
---

> A minimal AI SDK, you can run anywhere.

## Why another AI SDK?

Vercel AI SDK is too big.

[![pkg-size-ai](/images/pkg-size-ai.png)](https://pkg-size.dev/ai@4.1.47)

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

xsAI does not use the provider function by default, it is split into `apiKey`, `baseURL` and `model`.

- apiKey: Provider API Key
- baseURL: Provider Base URL (will be merged with the path of the corresponding util, e.g. `new URL('chat/completions', 'https://api.openai.com/v1/')`)
- model: Name of the model to use

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

Wait, [`zod`](https://zod.dev) is not good for tree shaking. Can we use [`valibot`](https://valibot.dev)? Of course!

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

## Next steps

We are working on [Model Context Protocol](https://modelcontextprotocol.io/introduction) support: [#84](https://github.com/moeru-ai/xsai/pull/84)

After that, it could be Framework Binding.

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
