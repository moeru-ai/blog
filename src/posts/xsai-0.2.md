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
- Reasoning utils
- (experimental) Tool returns schema
- More schema library supported
- More providers

## Generate Image

GPT 4o Image Generation is very popular these days, isn't it?

Now you can also use it via API and xsAI:

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

## Join our Community

If you have questions about anything related to xsAI,

you're always welcome to ask our community on [GitHub Discussions](https://github.com/moeru-ai/xsai/discussions).
