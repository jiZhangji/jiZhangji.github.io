---
title: '从分散的原型，到可维护的研究主页'
description: '保留已有 Nuxt 基础，把个人资料、研究方向、技术文章和可交互作品整理到一处。'
date: '2026-09-27 21:00'
category: notes
tags: [Nuxt, TypeScript, Personal Website]
author: Zhang Ji
cover: /images/research-notebook.svg
---

一个个人网站可以从很小的地方开始：一段介绍、一篇笔记、一个能实际打开的项目。真正困难的是，随着内容增加，它仍然清晰、可信，也容易维护。

这次整理没有更换框架，而是保留 Nuxt、Vue、TypeScript 和 Markdown 的基础，把原本分散的博客实现与交互实验集中在一个站点里。

## 先整理信息，再讨论视觉

首页负责快速回答三个问题：我关注什么、做过哪些可展示的实践、最近在记录什么。更具体的内容则放到独立页面：

- [研究方向](/research)：陈述正在关注的问题，不把兴趣写成已完成成果。
- [论文](/publications)：只展示经过核验的条目；资料缺失时明确留空。
- [项目](/projects)：连接实际存在的作品与实现说明。
- [博客](/blog)：保留过程、选择与尚未解决的问题。
- [简历](/cv)：统一读取个人资料，并支持打印；下载入口等待真实 PDF。

## 内容与页面分开

经常变化的是资料，而不是布局。个人信息、研究主题、论文和项目分别使用独立的数据文件，页面只负责呈现。

```ts
interface Publication {
  id: string
  title: string
  year: number
  authors: { name: string; isSelf?: boolean }[]
  venue: string
  tags: string[]
}

// 没有已核验条目时，空数组比虚构的演示论文更诚实。
const publications: Publication[] = []
```

文章继续放在 `content/zh/blog/` 与 `content/en/blog/`。一篇新文章只需要 Markdown 和 frontmatter，不需要修改页面代码。

## 阅读体验不是装饰

正文保持适中的宽度。目录、阅读进度、代码复制、数学公式与图片查看应该帮助理解，而不是抢走注意力。

以一个表征学习的记号为例，输入图像 $x$ 经编码器映射为特征：

$$
z = f_{\theta}(x), \qquad z \in \mathbb{R}^{d}.
$$

这个公式只是排版与记号示例，不代表本站已经完成了某项新算法或实验。

```python
def normalize_embedding(z, eps=1e-8):
    return z / (z.norm(dim=-1, keepdim=True) + eps)
```

## 交互作品按需加载

三份 [鹈鹕 3D 原型](/projects/pelican-lab) 的引擎和资源独立保存。浏览文章或首页时不加载 Three.js；只有主动打开演示时才运行 3D 场景。

静态资源本地化后，查看作品不必依赖原来的临时发布地址。原始版本与适配记录分别保留，避免把资源迁移误写成一次新的模型测试。

## 明确没有做的部分

目前没有填写未经核实的教育经历、论文或联系方式，也没有把模板中的第一人称经历当成真实资料。旧示例文章保留为草稿，不进入公开列表、RSS 或搜索。

这份主页的目标不是一次性填满所有区域，而是建立一个可以持续加入真实内容的结构。
