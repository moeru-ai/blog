---
title: Introducing xsAI
date: 2025-03-03
author: 藍+85CD
---

> A minimal AI SDK, you can run anywhere.

## Why another AI SDK?

Vercel AI SDK is too big.

[![pkg-size-ai](/images/pkg-size-ai.png)](https://pkg-size.dev/ai@4.1.47)

### So how small is xsAI?

Without further ado, let's look:

[![pkg-size-xsai](/images/pkg-size-xsai.png)](https://pkg-size.dev/xsai@0.1.0-beta.9)

## Get Started

You can install the `xsai` package, which contains all the core utils.

```bash
npm i xsai
```

Or install the corresponding packages separately according to the required
features:

```bash
npm i @xsai/generate-text @xsai/embed @xsai/model
```

### Examples

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
});
```

xsAI does not use the provider function by default, it is split into `apiKey`, `baseURL` and `model`.

- apiKey: Provider API Key
- baseURL: Provider Base URL (will be merged with the path of the corresponding util, e.g. `new URL('chat/completions', 'https://api.openai.com/v1/')`)
- model: Name of the model to use

This allows xsAI to support any OpenAI-compatible API without having to create provider packages.

## What's Next?

We are working on Model Context Protocol support: [#84](https://github.com/moeru-ai/xsai/pull/84)

After that, it could be Framework Binding.
