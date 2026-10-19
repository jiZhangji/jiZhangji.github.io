---
title: 'From scattered prototypes to a maintainable research notebook'
description: 'Keeping the Nuxt foundation while bringing personal information, research interests, technical writing, and interactive work together.'
date: '2026-09-27 21:00'
category: notes
tags: [Nuxt, TypeScript, Personal Website]
author: Zhang Ji
cover: /images/research-notebook.svg
---

A personal website can start with a short introduction, one technical note, and a project that actually runs. The harder part is keeping it clear, trustworthy, and maintainable as it grows.

This iteration keeps the existing Nuxt, Vue, TypeScript, and Markdown foundation. It brings two blog implementations and a collection of visual experiments into one site, without a framework migration.

## Organize the information first

The home page answers three questions: what I am interested in, what can be explored, and what I am writing about. Detailed material has its own place:

- [Research](/en/research): questions and interests, not unverified claims of completed work.
- [Publications](/en/publications): verified entries only; an explicit empty state when information is unavailable.
- [Projects](/en/projects): real artifacts with implementation notes.
- [Blog](/en/blog): decisions, observations, and unresolved questions.
- [CV](/en/cv): shared profile data and a print view; a download will appear when a real PDF is supplied.

## Separate content from presentation

Profile information, research topics, publications, and projects live in dedicated data files. Pages render them rather than duplicate them.

```ts
interface Publication {
  id: string
  title: string
  year: number
  authors: { name: string; isSelf?: boolean }[]
  venue: string
  tags: string[]
}

// An empty list is preferable to fabricated example publications.
const publications: Publication[] = []
```

Posts remain ordinary Markdown under `content/zh/blog/` and `content/en/blog/`. Adding an article does not require editing a page component.

## Reading features should help understanding

A restrained text measure, a table of contents, reading progress, code copying, mathematical notation, and image inspection support the content rather than compete with it.

For example, a representation-learning notation maps an input image $x$ to a feature vector:

$$
z = f_{\theta}(x), \qquad z \in \mathbb{R}^{d}.
$$

This is a notation and typesetting example, not a claim of a new method or result.

```python
def normalize_embedding(z, eps=1e-8):
    return z / (z.norm(dim=-1, keepdim=True) + eps)
```

## Load experiments only when requested

The three [Pelican 3D prototypes](/en/projects/pelican-lab) keep their engines and assets separate. Reading the home page or an article does not load Three.js. A scene starts only when its demo is opened.

Local assets also remove the dependency on temporary hosting links. Original files and adaptation records are kept separately, so asset migration is not mistaken for another model test.

## Keep missing information visible

Unverified education, publications, and contact details are not filled in. Reference articles remain drafts rather than appearing in public lists, feeds, or search as personal experiences.

The goal is a structure that can grow with real work, not a layout filled with invented content.
