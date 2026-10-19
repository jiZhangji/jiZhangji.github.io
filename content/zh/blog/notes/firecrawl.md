---
title: 'Firecrawl：把网页变成 LLM 可读的数据'
description: '一个开源的网页抓取与爬虫 API：把任意网址转成干净的 Markdown、结构化 JSON 或截图，并提供多语言 SDK、CLI 与 MCP 接入。'
date: '2026-10-05'
category: notes
tags: [Web Scraping, Crawler, LLM, Open Source]
author: Zhang Ji
cover: /images/firecrawl.svg
---

最近 [Firecrawl](https://github.com/firecrawl/firecrawl) 在 AI 圈子里讨论很多。它的定位很直接：**把网页变成 LLM 能直接消费的数据**——干净的 Markdown、结构化 JSON、截图，而不是一坨需要自己清洗的原始 HTML。

这篇记录它解决什么问题、提供哪些能力、怎么接入，以及哪些数字需要自己核对。

## 它为什么受欢迎

给 AI Agent 接上网页数据这件事，通常要自己处理三堆麻烦：渲染 JavaScript 页面、绕过反爬与限流、把 HTML 洗干净。Firecrawl 把这些打包成一个 API，宣称「零配置」地处理代理轮换、限流和 JS 阻塞的页面。

对下游的意义在于 token 成本：直接拿到正文 Markdown，比把整页 HTML 塞给模型更省。这是它被频繁接进 Agent 工作流的主要原因。

## 核心能力

接口按用途分成几组，都走同一个 API 和 SDK：

| 能力 | 做什么 | 一句话 |
| --- | --- | --- |
| Scrape | 抓单个 URL | 转成 Markdown / HTML / 截图 / 结构化 JSON |
| Crawl | 爬整个站点 | 一次请求抓回所有页面，异步轮询 |
| Map | 发现站点所有 URL | 只列链接，不下内容 |
| Search | 搜索网页 | 返回结果页的完整内容 |
| Batch Scrape | 批量抓取 | 一次提交成千上万个 URL |
| Agent | 描述需求自动找数据 | 不用先知道 URL |
| Interact | 抓取前先操作页面 | 点击、滚动、输入后再提取 |

其中 `Agent` 和 `Interact` 是它区别于传统爬虫的地方：一个让「描述需求」代替「构造请求」，一个让爬虫能在真实浏览器里先交互再提取。

## 一个最小示例

Python：

```python
from firecrawl import Firecrawl

app = Firecrawl(api_key="fc-YOUR_API_KEY")

# 抓单个 URL → 干净的 Markdown
doc = app.scrape("https://firecrawl.dev", formats=["markdown"])
print(doc.markdown)
```

Node.js：

```js
import { Firecrawl } from 'firecrawl';

const app = new Firecrawl({ apiKey: 'fc-YOUR_API_KEY' });

const doc = await app.scrape('https://firecrawl.dev', { formats: ['markdown'] });
console.log(doc.markdown);
```

结构化输出用 schema 约束，返回值是一个对象而不是自由文本：

```python
from pydantic import BaseModel

class Founder(BaseModel):
    name: str
    role: str | None = None

result = app.agent(prompt="Find the founders of Firecrawl", schema=Founder)
print(result.data)
```

## 接入方式

除了直接调 API，官方提供：

- **SDK**：Python、Node.js、Go、Java、Rust、Ruby、.NET、PHP、Elixir
- **CLI**：`npx -y firecrawl-cli@latest`，一条命令抓取或搜索
- **MCP**：`firecrawl-mcp`，任何兼容 MCP 的客户端都能直接调用
- **云服务**：`firecrawl.dev`，注册拿 key 即可

对已有 Agent 工作流的场景，MCP 接入最省事；对一次性验证，Playground 和 CLI 足够。

## 开源与云端

核心仓库采用 **AGPL-3.0**，SDK 和部分 UI 组件是 **MIT**。这意味着：

- 自己部署、只在内网用，没有 copyleft 传播义务；
- 把改动后的服务作为网络服务提供给第三方时，AGPL 的「网络 copyleft」条款就会起作用，需要确认自己的合规方式。

它同时提供官方云服务（含额外功能），并给出 [自托管指南](https://docs.firecrawl.dev/contributing/self-host)。两者不是同一件事，选型前值得分清。

## 需要谨慎的地方

官方 README 里有几个数字：96% 的网页覆盖率、P95 延迟 3.4 秒、内置代理轮换。这些来自项目自己的基准测试，**我没有独立复核**，应作为厂商声明而不是已证实的事实对待。

更需要注意的是抓取行为的边界。官方声明默认遵守 `robots.txt`，同时把责任明确放在使用者身上：抓取前要尊重目标网站的隐私政策与使用条款。机器人排除协议不是授权，也不能替代对被抓内容权利的判断；批量抓取公开数据在各地还有不同的合规要求。

## 小结

Firecrawl 把「网页 → 干净数据」这件高频脏活收敛成一个接口，降低了给 Agent 接网页数据的门槛。它适合快速原型和已有工作流的接入；但「厂商数字」和「抓取合规」这两件事，不因为工具好用就自动解决，仍然要自己核对。
