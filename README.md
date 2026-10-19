# Zhang Ji · AI Research & Agent Engineering

一个**双语（中 / 英）的个人学术主页与技术博客**：研究方向、论文、项目、博客、简历与联系方式集中在一处，静态生成、零后端、可直接部署。

底层沿用原有技术栈 **Nuxt 3**（不迁移框架），内容就是仓库里的 Markdown 与 `data/` 下的数据文件。

> 设计原则：克制、留白、学术感。**不编造**学校、论文、获奖或经历——缺少的真实信息一律留空并明确提示，方便日后逐项补齐。

## 研究与工程作品集

首页、项目卡片、项目详情和 GitHub 文档复用 `data/` 中的同一份资料。新增 GateMCP、SAR × Mamba、PhyD-MAE 的中英文研究概览，以及可体验的互动算法实验室案例。每个重点案例包含问题、贡献边界、架构、实现、结果与局限、Demo、源码状态和后续事项。

研究项目均明确标注 In Progress；未公开论文、内部指标、数据与权重不随网站分发。GitHub 资料生成器不会修改远程仓库。完整维护与发布步骤见 [维护指南](docs/PORTFOLIO_MAINTENANCE.md)，事实来源与公开边界见 [内容核对](docs/content-audit.md)。

```sh
npm run docs:github      # 从统一数据生成 Profile 与项目 README 草稿
npm run check:github     # 检查草稿与数据是否一致
npm run test:portfolio   # 数据、链接、状态、隐私与文档的一致性
npm run check:data       # 共享内容数据的严格类型检查
npm run check:source     # 语法与 Vue 模板编译，不代替完整构建
```

默认在经盘点、获准使用的服务器独立目录执行测试和构建。不要自动在本机启动服务、占用 4050，或在共享服务器安装软件。没有合适环境时先完成静态检查并说明缺件。

---

## ✨ 功能

### 互动实验室（2026-09-28）

新增 `/lab` 与 `/en/lab`：AI 四子棋 / 同屏双人、可训练的神经网络画布、每日迷宫与 A* 寻路。均在浏览器本地计算，棋局和挑战支持通过链接分享；不包含实时联机房间或外部大模型服务。实现与部署边界见 [互动实验室说明](./docs/interactive-lab.md)。

| 模块 | 说明 |
| --- | --- |
| 首页 | 个人简介、研究方向、精选项目、最新文章、联系方式 |
| 关于 `/about` | 简介、研究兴趣、教育 / 研究经历时间线、实践记录 |
| 研究 `/research` | 每个研究方向作为独立主题（简介、关键词、代表问题） |
| 论文 `/publications` | 年份分组、筛选、BibTeX 复制；数据在 `data/publications.ts`（当前为空，方便逐条补充） |
| 项目 `/projects` | 项目清单 + 详情页，可内嵌可交互的 3D / WebGL 演示（点击后按需加载） |
| 博客 `/blog` | 列表分页、分类、标签、归档、本地全文检索（`Ctrl/⌘ + K` 或 `/`） |
| 文章页 | 目录（TOC）高亮、阅读进度、上一篇 / 下一篇、代码复制、图片灯箱、**KaTeX 数学公式** |
| 简历 `/cv` | 读取共享个人数据、支持打印；配置到真实 PDF 前不显示下载按钮 |
| 联系 `/contact` | GitHub、email、Scholar 等；未填写的字段不展示 |
| 暗色模式 | 三态（浅色 / 深色 / 跟随系统），无闪烁 |
| 双语 | 中文默认无前缀，英文 `/en` 前缀（`prefix_except_default`） |
| SEO | 每页 `title` / `description` / canonical / hreflang / Open Graph / Person JSON-LD |
| RSS / Sitemap | `/feed.xml`、`/en/feed.xml`、`/sitemap.xml`（仅收录公开内容） |
| 静态部署 | 全站预渲染，可托管到任意静态服务 |

### 鹈鹕实验（互动演示）

`public/experiments/pelican/` 下收录了 **3 个独立的 Three.js / WebGL 骑行演示**，外部依赖（Three.js、字体）已全部本地化，离线可跑：

- `/experiments/pelican/frontier/index.html`
- `/experiments/pelican/codex/index.html`
- `/experiments/pelican/workbuddy/index.html`

来源、实现差异与验证边界见 [`docs/pelican-public-notes.md`](./docs/pelican-public-notes.md)。

---

## 🧱 技术栈

- **Nuxt 3** (`3.21.x`) + **@nuxt/content** (`3.16.x`，内置 Shiki 代码高亮)
- **@nuxtjs/i18n** (`10.x`) 双语路由
- **Tailwind CSS** (`3.4.x`) + `@tailwindcss/typography`
- **KaTeX**（`remark-math` + `rehype-katex`）
- 无数据库、无后端；内容即为仓库中的文件

---

## ⚠️ 环境要求

**Node.js ≥ 22.13.0**（或 23.4.0+ / 24+）。

本项目使用 Node 内置的 `node:sqlite`（`content.experimental.sqliteConnector: 'native'`），**不需要**原生编译 `better-sqlite3`，Windows 上无需 Visual Studio Build Tools。

```bash
node -v   # 需要 >= 22.13.0
```

---

## 🚀 运行方式（本机仅在明确获准后）

项目保留在 **D 盘**，辅助脚本把临时缓存与 npm 缓存放入 `.local/`；Nuxt 中间产物为 `.nuxt/`，静态输出为 `.output/public/`。以下本机脚本保留给明确选择本机运行时使用，平时遵守服务器优先规则。

### 方式一：一键脚本（推荐）

```bat
:: 双击 start-local.cmd，或：
powershell -ExecutionPolicy Bypass -File scripts\start-local.ps1
```

它会设置 D 盘缓存、按需构建，并在 **http://127.0.0.1:4178** 启动静态 HTTP 预览服务。

常用变体：

```powershell
# 重新构建后再预览 + 运行静态自检
.\scripts\start-local.ps1 -Rebuild -Check

# 开发模式（内容热更新），同样监听 4178
.\scripts\dev-local.ps1 -Action dev

# 完整校验：typecheck → build → generate → check:static
.\scripts\dev-local.ps1 -Action verify
```

`scripts/dev-local.ps1` 会对 `TEMP` / `npm_config_cache` / `XDG_CACHE_HOME` 统一指向 `.local/`，并在运行时注入本地站点地址与 `NUXT_APP_BASE_URL=/`。

### 方式二：直接用 npm

```bash
npm install
npm run dev        # 开发服务器
npm run build      # SSR 构建 + 预渲染
npm run generate   # 生成纯静态站点 → .output/public
npm run preview    # 本地静态预览（127.0.0.1:4178）
npm run check:static  # 校验链接、路由、SEO 标记、内容是否泄漏
npm run typecheck
```

> 静态产物在 **`.output/public/`**；根目录的 `dist/` 只是指向它的**目录联接（junction）**，部署时请填 `.output/public`。

---

## 📁 目录结构

```text
zhangji-blog/
├── data/
│   ├── profile.ts          # ⭐ 个人信息（姓名、简介、社交、技能、时间线…）
│   ├── research.ts         # 研究方向（Research Topic）
│   ├── publications.ts     # 论文（当前为空，附完整 schema）
│   ├── projects.ts         # 完整项目目录
│   ├── case-studies.ts     # 三个研究项目的公开安全概览
│   ├── engineering-projects.ts # 真实工程案例
│   ├── project-types.ts    # 类型与状态契约
│   ├── skills.ts           # 关联项目证据的能力分组
│   └── experiments.ts      # 鹈鹕实验数据
├── content/
│   ├── zh/blog/<分类>/<slug>.md   →  /blog/<分类>/<slug>
│   └── en/blog/<分类>/<slug>.md   →  /en/blog/<分类>/<slug>
├── pages/                  # 首页、about、research、publications、projects、cv、contact、blog…
├── components/             # SiteHeader/SiteFooter、AcademicTimeline、PostCard、PageToc、SearchDialog…
├── layouts/default.vue
├── i18n/locales/{zh,en}.json   # 界面文案
├── server/routes/          # feed.xml、en/feed.xml、sitemap.xml、robots.txt、search.json
├── public/experiments/pelican/ # 本地化的 3D 演示
├── scripts/                # start-local.ps1、dev-local.ps1、serve-static.mjs、check-static.mjs
└── docs/pelican-public-notes.md # 鹈鹕实验与第三方资源说明
```

**改内容时优先只改 `data/` 和 `content/`，无需动页面代码。**

---

## ✍️ 日常维护

### 改个人信息

编辑 `data/profile.ts`：

- `name` / `initials` / `role` / `bio` / `interests`
- `github`；`email`、`scholar`、`orcid`、`linkedin`、`researchGate`、`avatar`、`cvPdf` **默认为 `null`**，填入真实值后才会出现在界面
- `education`、`experience`、`awards`、`academicServices` 目前为空数组，按 `ProfileEntry` 结构逐条添加
- `milestones`、`skills`、`updated`

### 加一篇博客

在 `content/zh/blog/<分类>/hello.md` 新建（同时写一份 `content/en/blog/<分类>/hello.md`，`date` 保持一致以便对齐排序）：

````markdown
---
title: 你好，世界
description: 会出现在列表页与 RSS 中的摘要。
date: 2026-09-27 21:00
category: notes
tags: [Nuxt, 教程]
author: Zhang Ji
---

正文……支持 `行内代码`、表格、引用、Shiki 代码块与 KaTeX 行内公式 $z = f_\theta(x)$。

```ts
export default defineNuxtConfig({ devtools: { enabled: true } })
```
````

Frontmatter：`title`（必填）、`description`、`date`、`category`、`tags`、`updated`、`author`、`cover`、`draft`。

> `draft: true` 的文章不会出现在任何公开页面、RSS、sitemap 或站点搜索里。

### 加论文

在 `data/publications.ts` 的 `publications` 数组中按 `Publication` 结构追加（title / authors / venue / year / status / verifiedOn / tags / links / bibtex …）。投稿、预印本、接收和发表必须准确区分；只添加允许公开的信息。页面支持年份分组、筛选与 BibTeX 复制。

### 加项目

在对应项目数据文件追加一条 `Project`，并通过 `data/projects.ts` 导出。必须填写双语文本、`status` 与 `sourceAvailability`。精选条目提供完整 `details`，页面、站点地图和 GitHub README 自动复用；详细规则见维护指南。

### 换头像 / 换 CV

- 头像：把图片放进 `public/`（如 `public/images/avatar.jpg`），在 `data/profile.ts` 里设 `avatar: '/images/avatar.jpg'`。
- CV：把真实 PDF 放进 `public/cv/`，再设 `cvPdf: '/cv/your-file.pdf'`。CV 页面会先校验该 PDF 可访问，成功后才显示下载按钮。

---

## ☁️ 部署

全站为预渲染静态资源。部署前用 `NUXT_PUBLIC_SITE_URL` 指定正式域名（影响 canonical / RSS / sitemap）。

### GitHub Pages

正式主页：<https://jizhangji.github.io/>，源码仓库：<https://github.com/jiZhangji/jiZhangji.github.io>。

首页参考 Jiang Yunhang 个人主页的左侧档案与右侧章节布局，内容来自本站既有共享数据。桌面侧栏固定，手机上转为顶部档案和横向章节导航；中英文、主题、文章搜索与所有原有子页面保留。

推送 `main` 会运行类型检查、回归测试、静态生成和链接检查，通过后部署。工作流自动区分用户主页根路径与项目仓库子路径。Pages 设置使用 **GitHub Actions**。

维护仍在本项目目录进行。运行 `scripts/export-public.ps1 -Destination <新目录>` 可导出公开快照；它保留网站源码、文章、指南、Demo 与第三方许可，排除缓存、旧 Git 历史和内部来源记录。公开快照单独初始化 Git 后推送，不会带入原仓库的旧模板文章历史。

### Vercel

已附带 `vercel.json`（`npm run generate` → `.output/public`）。导入仓库即可，或手动设置 Build Command 为 `npm run generate`、Output Directory 为 `.output/public`。

### 任意静态托管

```bash
npm run generate
# 把 .output/public 部署到你的静态服务
```

若站点不在域名根路径，设置 `NUXT_APP_BASE_URL`（如 `/my-site/`）后重新构建。

---

## ❓ 常见问题

- **构建报错找不到 sqlite？** 确认 Node ≥ 22.13.0，并保留 `content.experimental.sqliteConnector: 'native'`。
- **新文章没出现？** 检查 Frontmatter 是否为合法 YAML（含 `: `、`[`、`#` 的标题请加引号），`date` 是否存在，路径是否为 `content/<语言>/blog/`。
- **3D 演示打不开？** 它们必须通过 HTTP 打开（用上面的本地预览），不要双击 `file://`。依赖已本地化，无需联网。
- **带点号的标签页 404？** 链接爬虫会跳过形如 `Three.js` 的路径，需把该标签显式加入 `nuxt.config.ts` 的 `prerender.routes`。

## 📄 License

当前网站根目录未提供已确认的项目许可证，不再将其描述为 MIT。发布前请由权利人确认授权，并保留第三方资源的原始许可与署名；其他研究项目的代码、论文、数据与权重分别受其来源条款约束。
