# 公开内容核对与发布边界

日期：2026-10-11。范围：个人网站现有源码、三个研究项目的正式状态与定向源码/文档检查。没有重跑科研实验，也没有读取凭据、投稿账户或原始个人聊天。

## 展示分类

| 项目 | 这次可展示 | 公开前仍需处理 |
| --- | --- | --- |
| GateMCP | 控制器、任务适配器、MCP 网关、预算与验证的高层概览 | 项目代码权属、许可证、公共发行地址、数据再分发权限、真实 Demo |
| SAR × Mamba | SAR 与状态空间视觉建模方向、检测管线概览 | 上游 AGPL-3.0 义务、个人贡献、公开代码版本、统一协议下可公开的结果 |
| PhyD-MAE | 掩码预训练、结构目标与下游表征评价概览 | 公共书目信息、作者/状态、源码版本、数据与权重权限 |
| 互动算法实验室 | 现有站内三个交互和独立算法模块 | 本轮运行结果以验证报告为准；实体触屏与辅助技术仍需更多检查 |
| 研究笔记网站与鹈鹕实验 | 原有页面、原创示意图与已有演示入口 | 保留现有来源/第三方资源说明；不将辅助生成代码描述为算法原创 |

前三项标注研究中，不展示内部指标，不提供私人文件下载。网站没有因此把私人仓库改为公开，也没有把研究稿标成接收或发表。

## 定向来源（项目内相对路径）

| 内容 | 来源 |
| --- | --- |
| GateMCP 当前入口与代码范围 | `GateMCP/PAPER_CODE_ENTRY.md`；`output/packages/GateMCP_github_code_only_20261009/README_CN.md` |
| 控制器 / 任务验证 / MCP | `qwen3_framework/general_mcp/controller.py`、`gateway.py`、`mcp_server.py`、`adapters/`；`tests/test_paper_package.py` |
| SAR/Mamba 模块与许可 | `Mamba/source_code/work_train_single/ultralytics/nn/modules/mamba_yolo.py`；同源码根 `LICENSE` |
| PhyD 结构目标与环境说明 | `PhyD/项目代码-phyd-mae/Pretraining/models_lomar.py`、`README.md`；正式项目状态中的冻结边界 |
| 互动算法实现 | 本仓库 `lib/lab/{connectFour,neural,maze}.ts`、`workers/connect-four.ts`、`components/lab/`、`scripts/lab.test.mjs` |
| 网站与图形技术 | 本仓库 `package.json`、`pages/`、`data/`、`public/experiments/` 与既有来源文档 |

这里用项目键定位来源，不向公开页面或 README 注入本机盘符、服务器地址和内部目录。详细的机器级验证回执保留在本地忽略目录，不进入静态产物。

## 不采用的主张

- 旧 README 或历史快照中的单次成绩不直接升级为当前主结果。
- 不把模拟、训练集拟合率、构造题通过率当成通用 Agent 或 SAR 性能。
- 不推断学校、职位、个人贡献比例、合作机构、作者顺序、邮箱和 Scholar ID。
- 不将代码快照、投稿包或编译通过等同“开源”“发表”或“上线”。
- 不将 Mamba 上游 AGPL 代码改标 MIT，不替 GateMCP 指定许可证。

GitHub 公开 API 本轮未完成在线核验，因此没有填写 Star、Fork 或新仓库链接。现有个人 GitHub 入口沿用已有身份数据；公开论文数组仍为空。
