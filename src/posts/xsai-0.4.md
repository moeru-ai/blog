---
title: 'Announcing xsAI 0.4 "AIAIAI"'
date: 2025-12-25
author: 藍+85CD
tags:
  - Announcements
metas:
  description: extra-small AI SDK.
  image: https://npm.chart.dev/__og-image__/image/@xsai/shared/og.png
  # image: https://bundlephobia.com/api/stats-image?name=xsai&version=0.4.0-beta.10&wide=true
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

### Metadata

> TODO

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

> TODO

## Telemetry

> TODO

## Standard JSON Schema

xsSchema now prioritizes [Standard JSON Schema](https://standardschema.dev/json-schema), though this change is not currently reflected at the user level.

In the next version, I will attempt to fully migrate and make xsSchema optional.

## Join our Community

If you have questions about anything related to xsAI,

you're always welcome to ask our community on [GitHub Discussions](https://github.com/moeru-ai/xsai/discussions).
