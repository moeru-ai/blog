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
- [More schema library supported](#more-schema-library-supported)
- [More providers](#more-providers)
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

## More schema library supported

We have supported [Zod 4 Beta](https://v4.zod.dev) before it was officially released. (also includes [`@zod/mini`](https://v4.zod.dev/packages/mini)!)

[Effect Schema](https://effect.website/docs/schema/introduction/) is supported as well.

## More providers

We now support [Featherless](https://featherless.ai).

Did you know we've added a lot of providers? view [here](https://github.com/moeru-ai/xsai/tree/main/packages-ext/providers-cloud/src/providers).

### Special providers

#### New [🤗 Transformer.js provider](https://github.com/moeru-ai/xsai-transformers)

Have you dreamed about a possible future where you can use `xsAI` completely offline without Ollama and other inference server setup? We mentioned a bit in the previous blog post about our roadmap, here we come.

We now get a new dedicated project called [`xsai-transformers`](https://github.com/moeru-ai/xsai-transformers) on GitHub, where we wrapped the famous library to work with models and inference, [`Transformer.js`](https://huggingface.co/docs/transformers.js/en/index) to help you get started on running embedding, speech, transcription, chat completions models with seamlessly designed API that compatible to xsAI, in both browser, WASM supported or WebGPU supported environments.

If you are interested, [try it on our live demo](https://xsai-transformers.netlify.app/).

```bash
npm i xsai-transformers
```

It feels like this when using it:

```typescript
import { createEmbedProvider } from 'xsai-transformers'
import embedWorkerURL from 'xsai-transformers/embed/worker?worker&url'
import { embed } from 'xsai'

const transformers = createEmbedProvider({ baseURL: `xsai-transformers:///?worker-url=${embedWorkerURL}` })

// [
//   -0.038177140057086945,
//   0.032910916954278946,
//   -0.005459371022880077,
//   // ...
// ]
const { embedding } = await embed({
  ...transformers.embed('Xenova/all-MiniLM-L6-v2'),
  input: 'sunny day at the beach'
})
```

#### unSpeech

While you may notice [we removed unSpeech from `@xsai-ext/providers-local`](https://github.com/moeru-ai/xsai/pull/136) (our written provider to connect speech synthesis services with the style of OpenAI API), this doesn't mean we completely gave up of unSpeech, instead, for the past month, we added support of [Alibaba Cloud Model Studio](https://www.alibabacloud.com/en/product/modelstudio) and [Volcano Engine](https://www.volcengine.com/product/voice-tech) to unSpeech.

Therefore, it's time for [unSpeech to get its own package](https://www.npmjs.com/package/unspeech), you can still use all the previous provided features by installing [`unspeech`](https://www.npmjs.com/package/unspeech):

```bash
npm i unspeech
```

## More Integrations

Did you know? We now have official [Agentic](https://agentic.so/sdks/xsai) and [VoltAgent](https://voltagent.dev/docs/agents/providers/#voltagentxsai-xsai-provider) integrations.

## Join our Community

If you have questions about anything related to xsAI,

you're always welcome to ask our community on [GitHub Discussions](https://github.com/moeru-ai/xsai/discussions).
