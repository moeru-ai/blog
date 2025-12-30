---
title: 'Announcing xsAI 0.4 "AIAIAI"'
date: 2025-12-30
author: 藍+85CD
tags:
  - Announcements
metas:
  description: extra-small AI SDK.
  image: https://npm.chart.dev/__og-image__/image/@xsai/shared/og.png
  # image: https://bundlephobia.com/api/stats-image?name=xsai&version=0.4.0-beta.13&wide=true
---

After more than five months, we have finally released xsAI 0.4.

## Why is it taking so long?

I planned to implement many new features in version 0.4,
but upon writing the code, I found some of them to be quite challenging.

Additionally, I've created a lot of new projects... (This is the main reason)

I ultimately postponed these features:

- [Responses API](https://github.com/moeru-ai/xsai/issues/100)
- [prepareStep](https://github.com/moeru-ai/xsai/issues/184)

But don't worry - this version still has quite a few new features.

btw, this codename is also a song by Kizuna AI and you can listen to it while reading:

<iframe width="100%" height="405" src="https://www.youtube.com/embed/S8dmq5YIUoc" title="YouTube video player" frameborder="0" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Alright, let's take a look:

## All-In-One Providers

We now have a new package: `@xsai-ext/providers`

It codegen most providers based on data from https://models.dev, with a small portion completed manually.

This includes the model list, so your editor can auto-completion to the latest models.

```ts
import { anthropic, google, openai } from '@xsai-ext/providers'

anthropic.chat('claude-sonnet-4-5-20250929') // claude-haiku-4-5-20251001, claude-opus-4-5-20251101...
google.chat('gemini-3-pro-preview') // gemini-3-flash-preview...
openai.chat('gpt-5.2') // gpt-5.2-chat-latest, gpt-5.2-pro...
```

To create a new provider:

```diff
- import { createChatProvider, createModelProvider, merge } from '@xsai-ext/shared-providers'
+ import { createChatProvider, createModelProvider, merge } from '@xsai-ext/providers/utils'

/**
 * Create a Foo Provider
 * @see {@link https://example.com}
 */
export const createFoo = (apiKey: string, baseURL = 'https://example.com/v1/') => merge(
  createChatProvider({ apiKey, baseURL }),
  createModelProvider({ apiKey, baseURL }),
)

/**
 * Foo Provider
 * @see {@link https://example.com}
 * @remarks
 * - baseURL - `https://example.com/v1/`
 * - apiKey - `FOO_API_KEY`
 */
export const foo = createFoo(process.env.FOO_API_KEY ?? '')
```

## Reasoning Content

We now officially support the `reasoning_content` field in messages.

Please note that this is different from [`extractReasoning`](https://xsai.js.org/docs/packages/utils/reasoning#extractreasoning). It requires support from the API itself, where is outside the OpenAI specification.

For example, you can try DeepSeek:

```ts
improt { generateText } from '@xsai/generate-text'
import { deepseek } from '@xsai-ext/providers'

const { reasoningText, text } = await generateText({
  ...deepseek.chat('deepseek-chat'),
  thinking: { type: 'enabled' }, // https://api-docs.deepseek.com/guides/thinking_mode
  messages: [{
    role: 'user',
    content: '9.11 and 9.8, which is greater?'
  }]
})

// res.choices[0].message.reasoning_content
console.log(reasoningText)

// res.choices[0].message.content
console.log(text)
```

xsAI automatically handles the `reasoning_content` field,
but for `<think></think>` tags within the `content` field, you currently still need to use `extractReasoning`.

## Stream Transcription

You can now stream STT:

```ts
import { streamTranscription } from '@xsai/stream-transcription'
import { openAsBlob } from 'node:fs'
import { env } from 'node:process'

const { textStream } = streamTranscription({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  file: await openAsBlob('./test/fixtures/basic.wav', { type: 'audio/wav' }),
  fileName: 'basic.wav',
  language: 'en',
  model: 'gpt-4o-transcribe',
})
```

## Telemetry

xsAI now supports OTEL's [GenAI Attributes](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/):

```diff
- import { generateText, streamText } from 'xsai'
+ import { generateText, streamText } from '@xsai-ext/telemetry'
```

```ts
import { generateText } from '@xsai-ext/telemetry'
import { env } from 'node:process'

const instructions = 'You\'re a helpful assistant.'

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [
    {
      content: instructions, 
      role: 'system'
    },
    {
      content: 'Why is the sky blue?',
      role: 'user'
    }
  ],
  model: 'gpt-4o',
  telemetry: { 
    attributes: { 
      'gen_ai.agent.name': 'weather-assistant', 
      'gen_ai.agent.description': instructions, 
    }, 
  }, 
})
```

## Standard JSON Schema

xsSchema now prioritizes [Standard JSON Schema](https://standardschema.dev/json-schema), though this change is not currently reflected at the user level.

In the next version, I will attempt to fully migrate and make xsSchema optional.

## Join our Community

If you have questions about anything related to xsAI,

you're always welcome to ask our community on [GitHub Discussions](https://github.com/moeru-ai/xsai/discussions).
