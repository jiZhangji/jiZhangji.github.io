---
title: 'Firecrawl: turning web pages into LLM-ready data'
description: 'An open-source scraping and crawling API that converts any URL into clean Markdown, structured JSON, or screenshots, with SDKs, a CLI, and MCP support.'
date: '2026-10-05'
category: notes
tags: [Web Scraping, Crawler, LLM, Open Source]
author: Zhang Ji
cover: /images/firecrawl.svg
---

[Firecrawl](https://github.com/firecrawl/firecrawl) has been getting a lot of attention in AI circles lately. Its pitch is direct: turn web pages into data an LLM can consume directly — clean Markdown, structured JSON, and screenshots, rather than raw HTML you have to clean yourself.

This note records the problem it solves, what it offers, how to wire it up, and which numbers deserve your own verification.

## Why it is popular

Giving an AI agent access to web data usually means handling three headaches yourself: rendering JavaScript-heavy pages, working around anti-bot measures and rate limits, and cleaning the HTML. Firecrawl bundles these into a single API, claiming to handle proxy rotation, rate limits, and JS-blocked pages with "zero configuration."

The downstream win is token cost: getting body-text Markdown directly is cheaper than feeding whole-page HTML to a model. That is the main reason it keeps appearing in agent workflows.

## Core capabilities

The endpoints group into a few purposes, all behind one API and SDK:

| Capability | What it does | In one line |
| --- | --- | --- |
| Scrape | Fetch a single URL | Markdown / HTML / screenshot / structured JSON |
| Crawl | Crawl a whole site | All pages from one request, polled async |
| Map | Discover every URL on a site | Lists links, no content |
| Search | Search the web | Returns full page content from results |
| Batch Scrape | Scrape many URLs at once | Submit thousands of URLs |
| Agent | Describe what you need | No URLs required upfront |
| Interact | Operate a page before scraping | Click, scroll, type, then extract |

`Agent` and `Interact` are what separate it from a traditional crawler: one replaces "construct a request" with "describe the task," the other lets the crawler interact in a real browser before extracting.

## A minimal example

Python:

```python
from firecrawl import Firecrawl

app = Firecrawl(api_key="fc-YOUR_API_KEY")

# Scrape a single URL → clean Markdown
doc = app.scrape("https://firecrawl.dev", formats=["markdown"])
print(doc.markdown)
```

Node.js:

```js
import { Firecrawl } from 'firecrawl';

const app = new Firecrawl({ apiKey: 'fc-YOUR_API_KEY' });

const doc = await app.scrape('https://firecrawl.dev', { formats: ['markdown'] });
console.log(doc.markdown);
```

Structured output is constrained by a schema, returning an object rather than free text:

```python
from pydantic import BaseModel

class Founder(BaseModel):
    name: str
    role: str | None = None

result = app.agent(prompt="Find the founders of Firecrawl", schema=Founder)
print(result.data)
```

## Ways to connect

Beyond the raw API, the project provides:

- **SDKs**: Python, Node.js, Go, Java, Rust, Ruby, .NET, PHP, Elixir
- **CLI**: `npx -y firecrawl-cli@latest`, one command to scrape or search
- **MCP**: `firecrawl-mcp`, callable from any MCP-compatible client
- **Cloud**: `firecrawl.dev`, sign up and grab a key

For an existing agent workflow, MCP is the least friction; for one-off checks, the Playground or CLI is enough.

## Open source vs. cloud

The core repository is **AGPL-3.0**; the SDKs and some UI components are **MIT**. In practice:

- Deploying it yourself for internal use carries no copyleft propagation obligation;
- offering a modified version as a network service to third parties triggers AGPL's "network copyleft" clause, so you need to confirm your compliance path.

It also runs a paid cloud service (with extra features) and publishes a [self-hosting guide](https://docs.firecrawl.dev/contributing/self-host). These are not the same thing, and worth separating before choosing.

## Where to be careful

The README cites a few figures — 96% web coverage, P95 latency of 3.4s, built-in proxy rotation. These come from the project's own benchmarks; I have not independently reproduced them, so they should be treated as vendor claims, not established facts.

The larger concern is the boundary of scraping itself. The project states that it respects `robots.txt` by default, and places responsibility on the user to respect each site's privacy policy and terms of use. A robots exclusion protocol is not a license, and it cannot replace a judgment about the rights in the scraped content; bulk-scraping public data also has varying compliance requirements across jurisdictions.

## Bottom line

Firecrawl collapses a frequent, messy job — "web page → clean data" — into one interface, lowering the barrier to giving agents web access. It suits rapid prototyping and wiring into existing workflows. But "vendor numbers" and "scraping compliance" are not solved by the tool being easy to use; both still need your own review.
