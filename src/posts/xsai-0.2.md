---
title: 'Announcing xsAI 0.2 "over the reality"'
date: 2025-05-01
author: 藍+85CD
tags:
  - Announcements
metas:
  description: extra-small AI SDK.
#   image: https://bundlephobia.com/api/stats-image?name=xsai&version=0.2.0&wide=true
---

I'm pleased to announce the release of xsAI v0.2.

This version codename still corresponds to a song by Kizuna AI and you can listen to it:

<iframe width="560" height="315" src="https://www.youtube.com/embed/OIdlW0u3ZXc" title="YouTube video player" frameborder="0" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

~~btw, v0.1 is ["Hello World"](https://www.youtube.com/watch?v=FrcR9qvjwmo)~~

OK, so here's the new features:

- [Generate image](#generate-image)
- [Reasoning utils](#reasoning-utils)
- (experimental) Tool returns schema
- More schema library supported
- More providers
- [More integrations](#more-integrations)

## Generate Image

GPT 4o Image Generation is very popular these days, isn't it?

Now you can also use it via API and [`@xsai/generate-image`](https://xsai.js.org/docs/packages/generate/image):

```ts
import { generateImage } from '@xsai/generate-image'
import { env } from 'node:process'

const prompt = 'A children\'s book drawing of a veterinarian using a stethoscope to listen to the heartbeat of a baby otter.'
 
const { image } = await generateImage({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'http://api.openai.com/v1/',
  model: 'gpt-image-1',
  prompt,
})
 
const { images } = await generateImage({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'http://api.openai.com/v1/',
  n: 4,
  model: 'gpt-image-1',
  prompt,
})
```

If this feature is popular, we may introduce `editImage` later.

## Reasoning Utils

We made [`@xsai/utils-reasoning`](https://xsai.js.org/docs/packages/utils/reasoning) for models like `qwq` and `deepseek-r1`:

```ts
import { generateText } from '@xsai/generate-text'
import { streamText } from '@xsai/stream-text'
import { extractReasoning, extractReasoningStream } from '@xsai/utils-reasoning'
 
const messages = [
  {
    content: 'You\'re a helpful assistant.',
    role: 'system'
  },
  {
    content: 'Why is the sky blue?',
    role: 'user'
  },
]

const { text: rawText } = await generateText({
  baseURL: 'http://localhost:11434/v1/',
  messages,
  model: 'deepseek-r1',
})

const { textStream: rawTextStream } = await streamText({
  baseURL: 'http://localhost:11434/v1/',
  messages,
  model: 'deepseek-r1',
})

// { reasoning: string | undefined, text: string }
const { reasoning, text } = extractReasoning(rawText!)
// { reasoningStream: ReadableStream<string>, textStream: ReadableStream<string> }
const { reasoningStream, textStream } = extractReasoningStream(rawTextStream) 
```

## More Integrations

Did you know? We now have official [Agentic](https://agentic.so/sdks/xsai) and [VoltAgent](https://voltagent.dev/docs/agents/providers/#voltagentxsai-xsai-provider) integrations.

We also have [Transformer.js](https://github.com/moeru-ai/xsai-transformers) and [unSpeech](https://github.com/moeru-ai/unspeech/tree/main/sdk/typescript) providers (these are one of Moeru AI's projects!)

## Join our Community

If you have questions about anything related to xsAI,

you're always welcome to ask our community on [GitHub Discussions](https://github.com/moeru-ai/xsai/discussions).
