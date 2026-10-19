# 个人网站与 GitHub 展示维护

本次改版沿用 Nuxt 3，不创建第二个网站工程。博客、指南、鹈鹕作品与互动实验室保留；首页增加研究与工程项目、证据关联技能和论文状态入口。

## 内容只维护一份

| 数据 | 维护入口 | 使用位置 |
| --- | --- | --- |
| 身份与联系方式 | `data/profile.ts` | 首页、关于、CV、联系、GitHub Profile |
| 研究项目 | `data/case-studies.ts` | 首页精选、项目列表、详情、GitHub 项目文档 |
| 工程案例 | `data/engineering-projects.ts` | 同上；演示入口指向真实站内页面 |
| 完整项目目录 | `data/projects.ts` | 卡片、详情路由、站点地图、README 生成器 |
| 能力分组 | `data/skills.ts` | 首页、关于、CV 技术列表、GitHub Profile |
| 研究兴趣 | `data/research.ts` | 研究页、首页、GitHub Profile |
| 论文 | `data/publications.ts` | 论文页、首页、GitHub Profile |

不要把未公开论文、内部实验表或本机绝对路径放入这些前端数据文件：它们会进入静态网页或客户端资源。证据口径见 `docs/content-audit.md`。

## 新增一个项目

1. 在对应数据文件加入 `Project`：稳定英文 slug、中英标题与描述、类别、年份、技术栈、封面、`status` 和 `sourceAvailability`。
2. 精选项目设 `featured: true`，并完整填写 `details` 的问题、贡献、架构、实现、结果、局限、后续事项和核对日期。
3. 架构由四个高层步骤构成；移动端自动改为纵向。封面放入 `public/images/projects/`，明确标注示意图或真实截图，不混用。
4. 只有经确认公开的仓库才能填写 `repository`；本地源码不是已开源。项目 Demo 需真实存在，未提供时页面显示说明。
5. 新项目被目录导出后，中英文详情路由和站点地图自动枚举，不用修改页面组件。

### 公式、代码、表格与视频

`details.contentBlocks` 可在 `implementation`、`results`、`demo` 三个区域添加类型化内容块。每块有稳定 `id`、双语 `title` 和可选双语 `caption`；没有真实材料时省略该块。

| kind | 内容字段 | 约束 |
| --- | --- | --- |
| `code` | `language`、`code` | 作为转义文本展示，不执行；注明是摘录还是可独立运行示例 |
| `math` | `latex`、双语 `explanation` | 仅仓库内可公开公式，KaTeX 禁用可信 HTML / URL 命令 |
| `table` | 双语 `columns`、`rows` | 行宽与列数一致，首列作行标题；指标必须附条件与来源 |
| `video` | `source`、双语 `transcript` | 本地文件可播放；外部视频只提供经核对的 HTTPS 链接，不嵌入追踪播放器 |

本地视频放在 `public/` 下，使用根相对路径；字幕与海报同样只引用本站文件。有语音时提供字幕，并保留可阅读的文字说明。不要通过 URL 参数传入公式或原始 HTML。所有内容块也会进入生成的项目 README。

## 新增论文

必须核实标题、完整作者顺序、年份、会议或期刊、链接和状态。`status` 只能取：

- `preprint`：预印本；不是正式发表。
- `submitted`：投稿中；不是已接收。
- `accepted`：已接收；应有可信接收证据。
- `published`：已发表；应有正式公开书目信息。

`verifiedOn` 记录公开信息核对日期。当前数组保持为空，不推断已有研究稿已发表。私人投稿记录不应直接添加到前端数据中。

## 同步 GitHub README

在已获准的服务器测试目录使用 Node.js ≥ 22.13：

```sh
node --experimental-strip-types scripts/sync-github.mjs
node --experimental-strip-types scripts/sync-github.mjs --check
```

产物是 `github/PROFILE_README.md` 与 `github/projects/<slug>/README.md`。它们复用数据文件里的项目介绍、状态、技能和技术结构；`--check` 会发现资料漂移。不要直接维护生成文件。

确定正式公网域名后，显式传入真实地址再生成：

```sh
node --experimental-strip-types scripts/sync-github.mjs --site-url=https://your-confirmed-domain.example
```

上面的地址只是命令格式示例。默认不会把既有配置中的 GitHub Pages 地址冒充已上线网站，也不会把临时预览地址写入个人 Profile。

若采用域名参数，CI 的 `check:github` 也必须使用同一个参数。发布 Profile 时把生成内容放入账号同名仓库的 README；此操作须由用户确认。研究项目文档是发布准备稿，不是源码发行包；缺许可证、数据权限和可复现环境时不声称“一键可跑”。

## 验证顺序与执行位置

遵守共享项目的服务器优先规则：先盘点当前登记服务器，复查负载、磁盘和已有任务，使用独立目录。没有合适环境时不要自动在本机跑测试或启动服务。软件安装、修改现有服务或公开部署需当前授权。

```sh
npm run test:portfolio  # 数据结构、关联链接、状态、隐私边界、README 一致性
npm run test:components # Vue 组件 SSR 夹具，不等于 Nuxt 集成或浏览器验收
npm run test:lab        # 原有算法回归
npm run check:data      # 共享内容数据的严格 TypeScript 检查，不依赖 Nuxt 生成目录
npm run check:source    # Vue 模板编译与 TS/JS 语法；不等于类型检查/完整构建
npm run check:github   # 生成文档与数据一致
npm run typecheck
npm run generate
npm run check:static
```

`check:source` 使用项目已经锁定的 Vue / TypeScript 编译依赖。完整构建需要目标平台的 Nuxt 依赖，不能拿 Windows 的 esbuild / Rollup 原生包直接在 Linux 上使用。

新 CI `portfolio-checks.yml` 只做检查，覆盖根路径与子路径，不发布网站。原有 `deploy-pages.yml` 仍会在 main 推送时部署；**不要为测试随意推送 main**。

## 发布前检查

- 确认域名、发布目标、项目公开范围、第三方版权和许可证。
- 将 `NUXT_PUBLIC_SITE_URL` 设置为真实公开地址；GitHub Pages 项目站另设 `NUXT_APP_BASE_URL=/<repo>/`。
- `npm run generate` 后仅发布 `.output/public`，不能发布仓库根目录、`.local`、`.env` 或研究源目录。
- 在同样的 base 环境下运行 `npm run check:static`，检查中英文详情、博客、RSS、站点地图。
- 浏览器检查桌面与手机、明暗主题、语言切换、筛选与空状态、键盘导航；一次视觉检查不等于所有设备验收。
- 不默认添加分析追踪、访客记录、外部统计图片或账号系统。

已有 Vercel 配置使用 `npm run generate` 和 `.output/public`。Cloudflare Pages 可使用相同构建与输出目录；GitHub Pages 使用既有工作流。购买域名、部署到公网或修改线上内容需另行确认。
