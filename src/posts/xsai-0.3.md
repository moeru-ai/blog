---
title: 'Announcing xsAI 0.3 "future base"'
date: 2025-07-15
author: 藍+85CD
tags:
  - Announcements
metas:
  description: extra-small AI SDK.
  image: https://npm.chart.dev/__og-image__/image/@xsai/shared/og.png
  # image: https://bundlephobia.com/api/stats-image?name=xsai&version=0.3.0-beta.9&wide=true
---

Nice to see you again!

We have released xsAI v0.3, which is a "prepare to the future" update.

This codename is also a song by Kizuna AI and you can listen to it while reading:

<iframe width="100%" height="405" src="https://www.youtube.com/embed/yeD7eAuza74" title="YouTube video player" frameborder="0" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

OK, so here's the new features:

- [Stream text overhaul](#stream-text-overhaul)
- [Generate transcription improvements](#generate-transcription-improvements)
- [Raw tool util](#raw-tool-util)
- [Standalone stream object util](#standalone-stream-object-util)
- [Zod 4 support](#zod-4-support)

## Stream text overhaul

streamText has been completely rewritten to more closely match the output of the Vercel AI SDK and to be clearer.

- `chunkStream` has been removed.
- `stepStream` is now `fullStream` (vercel compatible)
- `StreamTextStep` has been merged with `GenerateTextStep` to become `CompletionStep`
- Returns Promise-based `steps` and `messages` directly
- Support for [streaming tool call arguments](https://platform.openai.com/docs/guides/function-calling?api-mode=chat#streaming)

```ts
import { streamText } from '@xsai/stream-text'
import { createOllama } from '@xsai-ext/provider-local'

const ollama = createOllama()

// fullStream: ReadableStream<StreamTextEvent>
// messages: Promise<Message[]>
// textStream: ReadableStream<string>
// steps: Promise<CompletionStep[]>
const { fullStream, messages, textStream, steps } = await streamText({
  ...ollama.chat('gemma3'),
  messages: [
    {
      content: 'You are a helpful assistant.',
      role: 'system',
    },
    {
      content: 'Why is the sky blue?',
      role: 'user',
    },
  ],
})
```

## Generate transcription improvements

In v0.3, we support `segments` and `words`.

You can now get more detailed return data with `responseFormat` and `timestampGranularities`:

```ts
import { generateTranscription } from '@xsai/generate-transcription'
import { createSpeaches } from '@xsai-ext/providers-local'

const speaches = createSpeaches()

const { duration, language, segments, text } = await generateTranscription({ 
  ...speaches.transcription('deepdml/faster-whisper-large-v3-turbo-ct2')
  file: await openAsBlob('./test/fixtures/basic.wav', { type: 'audio/wav' }),
  fileName: 'basic.wav',
  language: 'en',
  responseFormat: 'verbose_json', 
})

const { duration, language, text, words } = await generateTranscription({ 
  ...speaches.transcription('deepdml/faster-whisper-large-v3-turbo-ct2')
  file: await openAsBlob('./test/fixtures/basic.wav', { type: 'audio/wav' }),
  fileName: 'basic.wav',
  language: 'en',
  responseFormat: 'verbose_json', 
  timestampGranularities: 'word', 
})
```

## Raw tool util

Previously you could only provide JSON Schema-based tools directly by passing objects, with fewer type hints.

Now we have a `rawTool` tool to make your experience even better:

```ts
import type { Tool } from '@xsai/shared-chat'

import { rawTool } from '@xsai/tool'

const weatherObject: Tool = {
  description: 'Get the weather in a location',
  execute: (params) => 'cloudy', // params: unknown
  name: 'weather',
  // Record<string, unknown>
  parameters: {
    additionalProperties: false,
    properties: {
      location: {
        description: 'The location to get the weather for',
        type: 'string',
      },
    },
    required: [
      'location',
    ],
    type: 'object',
  },
}

const weatherRawTool = rawTool<{ location: string }>({
  description: 'Get the weather in a location',
  execute: ({ location }) => 'cloudy', // params: { location: string }
  name: 'weather',
  // import('xsschema').JsonSchema (JSON Schema auto-completion)
  parameters: {
    additionalProperties: false,
    properties: {
      location: {
        description: 'The location to get the weather for',
        type: 'string',
      },
    },
    required: [
      'location',
    ],
    type: 'object',
  },
})
```

## Standalone stream object util

We've split out the internal implementation of streamObject so you can use it on its own:

```ts
import { toElementStream, toPartialObjectStream } from '@xsai/stream-object'

const elementStream = await fetch('https://example.com')
  .then(res => res.body!.pipeThrough(new TextDecoderStream()))
  .then(stream => toElementStream<{ foo: { bar: 'baz' }}>(stream))

const partialObjectStream = await fetch('https://example.com')
  .then(res => res.body!.pipeThrough(new TextDecoderStream()))
  .then(stream => toPartialObjectStream<{ foo: { bar: 'baz' }}>(stream))
```

## Zod 4 support

Although we already had imperfect compatibility in v0.2.2, we now officially support Zod 4 and Zod Mini.

You can now use it in `tool` or `{generate,stream}-object`.

## What's Next?

In v0.4, we will have some important updates:

- prepareStep
- OpenTelemetry support (`@xsai-ext/opentelemetry`)
- Response API support (very experimental)

By the time you read this, we may already be preparing. stay tuned!

## Join our Community

If you have questions about anything related to xsAI,

you're always welcome to ask our community on [GitHub Discussions](https://github.com/moeru-ai/xsai/discussions).
