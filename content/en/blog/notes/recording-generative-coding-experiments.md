---
title: 'How to record a generative coding experiment'
description: 'Separate the prompt, artifact, runtime checks, and impressions so a visual experiment can be reopened and inspected.'
date: '2026-09-27 20:50'
category: notes
tags: [Generative Coding, Reproducibility, WebGL]
author: Zhang Ji
---

The same brief can produce very different artifacts. Before comparing them, it helps to establish exactly what is being compared.

The [Pelican experiments](/en/blog/experiments/pelican-2026-09-27) left three independent 3D scenes and several SVG studies. Organizing them revealed four layers that should stay distinct.

## Four layers of evidence

| Layer | What to retain | What it does not establish |
| --- | --- | --- |
| Task | Prompt, constraints, inputs, and tool environment | Matching titles do not establish identical conditions |
| Artifact | Source, dependency versions, assets, and content hashes | Larger files are not inherently better |
| Verification | Syntax, page loading, interaction checks, and errors | Syntax success does not prove every game mechanic works |
| Observation | Visual impressions and unresolved questions | A single subjective session is not a statistically supported ranking |

## Do not count copies as new experiments

A page, its ZIP archive, and a screenshot may all come from one implementation. Counting files is not enough; compare structure, assets, and content hashes.

```bash
# Compare content, not filenames or modification times.
sha256sum index.html
```

The three 3D scenes have distinct source structures. One ZIP contains the same HTML as its original page, so it remains one test rather than two.

## Make the artifact reopenable

Temporary domains and CDNs can change. Preserving dependencies with the static assets is more reliable than retaining only a hosted link. Record local path changes without presenting the adapted copy as another generation result.

## Record what remains unknown

One stack-illustration generation record has no recovered local image. It should remain a missing-artifact entry rather than being filled with a fabricated image or silently dropped.

Likewise, a model name recorded in a log should be described as a recorded label. Clear limitations make future inspection easier.
