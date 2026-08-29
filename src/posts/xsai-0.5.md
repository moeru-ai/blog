---
title: 'Announcing xsAI 0.5 "mirai"'
date: 2026-08-30
author: 藍+85CD
tags:
  - Announcements
metas:
  description: extra-small AI SDK.
  image: https://bundlephobia.com/api/stats-image?name=xsai&version=0.5.0&wide=true
---

Long time no see—we’ve released [xsAI v0.5](https://github.com/moeru-ai/xsai/releases/tag/v0.5.0).

This release brings Responses API support, explicit control over multi-step generation,
a clearer event model, safer tool execution, and streaming speech—while keeping each piece small and composable.

This version's codename is **mirai**.
It is also a song by Kizuna AI, so you can listen to it while reading:

<iframe width="100%" height="405" src="https://www.youtube.com/embed/HRCqXIBFRhU" title="YouTube video player" frameborder="0" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Let's walk through the parts that matter:

- [Responses API](#responses-api)
- [Stop conditions and `prepareStep`](#stop-conditions-and-preparestep)
- [A proper event stream](#a-proper-event-stream)
- [Safer and more flexible tools](#safer-and-more-flexible-tools)
- [Streaming speech](#streaming-speech)
- [A smaller core and refreshed providers](#a-smaller-core-and-refreshed-providers)
- [Breaking changes](#breaking-changes)
- [What's next?](#what-s-next)

## Responses API

Some newer models and agent workflows are designed around the Responses API instead of Chat Completions.
xsAI now has a dedicated [`@xsai-ext/responses`](https://xsai.js.org/docs/packages-ext/responses) package for it.

It is primarily targeting [Open Responses](https://openresponses.org/), and remains experimental in the `0.5.x` line.
It supports string input as well as Responses API item arrays, reasoning streams, tool calls, and accumulated usage:

```bash
npm i @xsai-ext/responses
```

```ts
import { responses } from '@xsai-ext/responses'
import { env } from 'node:process'

const { reasoningTextStream, steps, textStream, totalUsage } = responses({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  input: 'Why is the sky blue?',
  instructions: 'You are a helpful assistant.',
  model: 'gpt-5.5',
  reasoning: { effort: 'low' },
})

let text = ''
for await (const chunk of textStream)
  text += chunk

let reasoningText = ''
for await (const chunk of reasoningTextStream)
  reasoningText += chunk

console.log(text)
console.log(reasoningText)
console.log(await steps)
console.log(await totalUsage)
```

The package only uses streaming mode, so you do not need to pass `stream: true` yourself.
It also uses the same `Tool` shape as the rest of xsAI, which means tool execution and step control work across both APIs.

## Stop conditions and `prepareStep`

Previously, multi-step generation was controlled with `maxSteps`.
In v0.5, `generateText`, `streamText`, and `responses` share a more expressive `stopWhen` API.

The default is `stepCountAtLeast(1)`, which keeps a simple request simple.
When tools are involved, you can allow the model to continue until your condition is satisfied:

```ts
import { generateText } from '@xsai/generate-text'
import { stepCountAtLeast } from '@xsai/generate-text/shared-chat'
import { env } from 'node:process'

const { steps, text, totalUsage } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [{
    content: 'Find the weather and then summarize it in one sentence.',
    role: 'user',
  }],
  model: 'gpt-4o',
  tools: [weather],
  stopWhen: stepCountAtLeast(3),
})

console.log(text)
console.log(steps)
console.log(totalUsage)
```

You can also write your own condition. It receives the current `step`, all completed `steps`, and the current input.
For convenience, xsAI provides `stepCountAtLeast`, `hasToolCall`, `and`, `or`, and `not`.

`prepareStep` is the other half of this change. It lets you change the input, model, or tool choice before each step:

```ts
const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [{
    content: 'Find the weather and summarize it.',
    role: 'user',
  }],
  model: 'gpt-4o',
  tools: [weather],
  stopWhen: stepCountAtLeast(3),
  prepareStep: ({ stepNumber }) => stepNumber === 0
    ? {}
    : { model: 'gpt-4o-mini' },
})
```

This is useful when the first step needs a more capable model, while follow-up tool calls can use a smaller one.
You can also use it for context management or to change `toolChoice` as the agent progresses.

## A proper event stream

Streaming used to expose a single event stream through `fullStream`.
That made it difficult to distinguish xsAI's normalized events from the provider's raw response chunks.

In v0.5, `streamText` exposes both:

- `eventStream`: normalized xsAI events
- `fullStream`: parsed chat-completion chunks from the provider

There are still smaller streams for the common cases: `textStream` for text and `reasoningTextStream` for reasoning.
The normalized event names now describe the lifecycle clearly:

- `step.start` and `step.done`
- `reasoning.start`, `reasoning.delta`, and `reasoning.done`
- `text.start`, `text.delta`, and `text.done`
- `tool-call.start`, `tool-call.delta`, and `tool-call.done`
- `tool-result.done`

```ts
import { streamText } from '@xsai/stream-text'
import { env } from 'node:process'

const { eventStream } = streamText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [{
    content: 'Tell me a short joke.',
    role: 'user',
  }],
  model: 'gpt-4o',
})

for await (const event of eventStream) {
  if (event.type === 'text.delta')
    process.stdout.write(event.delta)

  if (event.type === 'step.done')
    console.log('\nusage:', event.usage)
}
```

`streamObject` is built on top of `streamText`, so it gets the same event layers as well.
The Responses API follows the same idea: its `eventStream` contains normalized xsAI events, while its `fullStream`
contains raw Responses API events.

## Safer and more flexible tools

If your schema library already exposes Standard JSON Schema, you can now use `defineTool`.
It is synchronous and is the recommended option over `tool()`:

```ts
import { defineTool } from '@xsai/tool'
import * as z from 'zod'

const weather = defineTool({
  description: 'Get the weather in a location',
  execute: ({ location }) => JSON.stringify({
    location,
    temperature: 42,
  }),
  name: 'weather',
  parameters: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
})
```

`tool()` is still available for any Standard Schema implementation that needs conversion to JSON Schema,
and `rawTool()` remains available when you already have a JSON Schema.

Tools created with `defineTool` or `tool()` now validate the model's arguments before calling `execute`.
Invalid arguments and tool execution failures can be returned as tool results with error information,
so an agent can inspect the failure and decide what to do next.

Tool execution is also observable and customizable through `preToolCall` and `postToolCall`.
The former can inspect or rewrite a call, or provide a result without executing the tool;
the latter can inspect or replace the result. Together with `onEvent`, `onStepFinish`, and `onFinish`,
this gives you enough hooks to add logging, authorization, retries, or metrics without wrapping every tool yourself.

## Streaming speech

Text-to-speech can now be consumed as audio arrives with [`@xsai/stream-speech`](https://xsai.js.org/docs/packages/stream/speech):

```bash
npm i @xsai/stream-speech
```

```ts
import { streamSpeech } from '@xsai/stream-speech'
import { env } from 'node:process'

const { fullStream, usage } = await streamSpeech({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  input: 'The quick brown fox jumped over the lazy dog.',
  model: 'gpt-4o-mini-tts',
  responseFormat: 'mp3',
  voice: 'alloy',
})

const audioChunks: Uint8Array[] = []
for await (const chunk of fullStream)
  audioChunks.push(chunk)

console.log(`received ${audioChunks.length} audio chunks`)
console.log(await usage)
```

`fullStream` here yields decoded `Uint8Array` audio chunks, so you can send them directly to a player,
file sink, or another streaming pipeline. This utility is experimental in the `0.5.x` line.

## A smaller core and refreshed providers

The streaming internals have been extracted into a new `@xsai/shared-stream` package.
It is shared by the text, object, transcription, speech, and Responses implementations,
and v0.5 also includes further size reductions.

The `@xsai-ext/providers` package has been synchronized with upstream model data again.

The top-level `xsai` package now re-exports the streaming speech utility and the shared stream helpers as well.

## Breaking changes

If you are upgrading from v0.4, there are a few changes worth checking:

- Replace `maxSteps` with `stopWhen`, for example `stepCountAtLeast(3)`.
- `streamText().fullStream` is now the provider chunk stream. Use `eventStream` for normalized xsAI events.
- Event names use dot notation, such as `text.delta` and `tool-call.done`.
- `CompletionStep.stepType` and the old `step` type have been removed.
- `@xsai/utils-reasoning` is deprecated. Use `reasoningText` from `generateText()` or
  `reasoningTextStream` from `streamText()` instead.
- `toAsyncIterator` has been removed from `@xsai/utils-stream`.

The Responses API remains experimental in the `0.5.x` line and will be revisited as part of the next major release.
For the complete list of changes, please read the [v0.5.0 release notes](https://github.com/moeru-ai/xsai/releases/tag/v0.5.0).

## Get started

Install the full package:

```bash
npm i xsai@0.5.0
```

Or install only the utilities you need, such as `@xsai/generate-text`, `@xsai/stream-text`,
`@xsai-ext/responses`, or `@xsai/stream-speech`.

The documentation is available at <https://xsai.js.org/docs>.

## What's next?

There will be no xsAI 0.6 after the `0.5.x` line.
The next milestone is xsAI 1.0, which will be a complete rewrite from the ground up.

Please stay tuned—we have a lot to rebuild and rethink.

## Join our Community

If you have questions about anything related to xsAI,

you're always welcome to ask our community on [GitHub Discussions](https://github.com/moeru-ai/xsai/discussions).
