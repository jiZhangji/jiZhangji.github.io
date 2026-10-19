import type { Project } from './project-types'

/** Public-safe summaries only. Private provenance lives in docs/content-audit.md. */
export const caseStudies: Project[] = [
  {
    slug: 'gatemcp',
    title: { zh: 'GateMCP · 验证驱动的工具编排', en: 'GateMCP · Verification-driven Tool Orchestration' },
    description: { zh: '围绕“何时调用工具、何时停止”构建可检查的 Agent 工作流，将任务验证、分阶段辅助与预算控制分开实现。', en: 'An inspectable agent workflow for deciding when to use a tool and when to stop, separating task verification, staged assistance, and budget control.' },
    category: 'research', year: 2026, featured: true, status: 'in-progress', sourceAvailability: 'restricted',
    cover: '/images/projects/gatemcp.svg', tags: ['Python', 'MCP', 'FastMCP', 'Verification', 'Tool Calling'],
    details: {
      problem: { zh: '工具调用并不天然意味着答案可靠。研究关注在可验证任务中，如何让候选答案先经过任务检查，再决定是否需要进一步辅助，同时记录每次调用的成本与终止原因。', en: 'Tool use does not automatically make an answer reliable. This project studies how task-specific checks can guide additional assistance while making call costs and stopping decisions explicit.' },
      contributions: [
        { zh: '将控制器、任务适配器、工具网关与评估指标分层，便于分别检查策略与工具实现。', en: 'Separates the controller, task adapters, tool gateway, and metrics so policy and tool implementations can be inspected independently.' },
        { zh: '提供本地任务网关与 FastMCP 标准输入输出接口，复用任务验证逻辑。', en: 'Provides a local task gateway and a FastMCP stdio interface around shared task-verification logic.' },
        { zh: '维护协议配置、运行入口、方法映射、测试与结果汇总工具。', en: 'Includes protocol configuration, run entry points, method mappings, tests, and result aggregation tools.' },
      ],
      contributionNote: { zh: '以上是现有项目模块的核对结果，不据此推定所有模块均为个人独立原创；具体个人贡献与共同作者信息待确认。', en: 'These are verified project capabilities, not a claim of sole authorship. Individual contributions and collaborators still need to be confirmed.' },
      architecture: [
        { title: { zh: '任务输入', en: 'Task input' }, description: { zh: '任务适配器与输入约束', en: 'Task adapters and input constraints' } },
        { title: { zh: '候选与验证', en: 'Candidate + check' }, description: { zh: '候选答案与任务验证器', en: 'Candidate answers and task-specific verification' } },
        { title: { zh: '工具辅助', en: 'Tool assistance' }, description: { zh: '本地 / MCP 网关与受控调用', en: 'Local / MCP gateway and controlled calls' } },
        { title: { zh: '记录与终止', en: 'Trace + stop' }, description: { zh: '预算、结果与停止条件', en: 'Budgets, outcomes, and stopping conditions' } },
      ],
      architectureNote: { zh: '按当前控制器、网关和适配器职责绘制的高层结构图；实际策略可能再次验证或继续辅助，不代表开放域通用 Agent。', en: 'A high-level view of controller, gateway, and adapter responsibilities. Policies may verify again or request further assistance; this is not a general open-world agent.' },
      implementation: [
        { zh: 'Python 控制器提供多种策略入口；网关将模型决策与具体任务工具连接起来。', en: 'Python controller entry points connect model decisions to task tools through a gateway.' },
        { zh: '任务侧包含数学文字题、Game24 与积木规划适配器；验证能力受任务定义限制。', en: 'Task adapters cover math word problems, Game24, and block-world planning. Verification is bounded by each task definition.' },
        { zh: '代码快照区分协议、模型路径示例、数据要求和运行结果；冻结数据未随 GitHub 代码包分发。', en: 'The code snapshot separates protocols, model-path examples, data requirements, and outputs. Frozen datasets are excluded from the GitHub-targeted bundle.' },
      ],
      results: [
        { zh: '已核对控制器、MCP 服务、任务网关及标准库测试文件的存在与职责。', en: 'Controller, MCP server, task gateway, and standard-library test files have been inspected.' },
        { zh: '本页展示工程结构与研究问题，不将历史模拟轨迹或局部对比写成通用性能指标。', en: 'This page presents engineering structure and the research question, without promoting simulated traces or narrow comparisons to general performance claims.' },
      ],
      limitations: [
        { zh: '尚未确认可对外链接的开源发行版；项目代码包未指定许可证。', en: 'A public source release has not been verified; the project bundle does not specify a license.' },
        { zh: '未在本站公开论文、原始实验记录、模型文件或数据，也未将研究稿标成已接收或已发表。', en: 'Manuscripts, raw experiment records, models, and data are not published here. A research draft is not labelled accepted or published.' },
      ],
      nextSteps: [
        { zh: '确认代码权属与许可证，整理不携带私人配置的可复现实例。', en: 'Confirm ownership and licensing, then prepare a reproducible example without private configuration.' },
        { zh: '在公开范围获确认后补充真实运行截图、完整协议和可核查的结果链接。', en: 'Add real execution screenshots, full protocols, and verifiable result links once the release scope is approved.' },
      ],
      reviewed: '2026-10-11',
    },
  },
  {
    slug: 'sar-mamba',
    title: { zh: 'SAR × Mamba · 状态空间视觉建模', en: 'SAR × Mamba · State-space Vision' },
    description: { zh: '研究 SAR 成像特点与状态空间视觉模型的衔接，围绕特征处理、状态更新和目标检测开展实现与受控比较。', en: 'Exploring how SAR imaging characteristics meet state-space vision models through feature processing, state updates, and controlled detection studies.' },
    category: 'research', year: 2026, featured: true, status: 'in-progress', sourceAvailability: 'restricted',
    cover: '/images/projects/sar-mamba.svg', tags: ['Python', 'PyTorch', 'Mamba', 'SAR', 'Object Detection'],
    details: {
      problem: { zh: 'SAR 的散斑、杂波与弱目标给视觉表征带来不同于自然图像的挑战。研究关注状态空间模块在这种数据上的适用条件，以及结构改动是否能在受控评估中产生可重复的收益。', en: 'Speckle, clutter, and weak targets make SAR different from natural imagery. This work investigates when state-space modules are useful and whether architectural changes yield reproducible benefits under controlled evaluation.' },
      contributions: [
        { zh: '在现有 Mamba-YOLO 工作区中实现 SAR 相关特征处理与状态空间模块。', en: 'Implements SAR-oriented feature processing and state-space modules in an existing Mamba-YOLO workspace.' },
        { zh: '将模块配置、检测训练和评价分开组织，保留不同变体与实验协议。', en: 'Organizes module configuration, detection training, and evaluation separately, retaining variants and protocols.' },
        { zh: '用消融与跨任务核对研究适用边界，不把模型名称或示意图作为效果证据。', en: 'Uses ablations and cross-task checks to study limitations rather than treating model names or diagrams as evidence of effectiveness.' },
      ],
      contributionNote: { zh: '基于现有开源检测框架开展研究；上游实现与个人修改必须区分，具体贡献清单待确认。', en: 'Built on an existing open-source detection framework. Upstream work and individual changes must remain distinct; a contribution statement is pending.' },
      architecture: [
        { title: { zh: 'SAR 图像', en: 'SAR image' }, description: { zh: '成像条件与数据划分', en: 'Imaging conditions and dataset splits' } },
        { title: { zh: '视觉特征', en: 'Visual features' }, description: { zh: '局部结构与特征处理', en: 'Local structure and feature processing' } },
        { title: { zh: '状态空间块', en: 'State-space block' }, description: { zh: '选择性扫描与状态更新', en: 'Selective scan and state updates' } },
        { title: { zh: '检测与评估', en: 'Detect + evaluate' }, description: { zh: '检测头、消融与协议核对', en: 'Detection heads, ablations, and protocol checks' } },
      ],
      architectureNote: { zh: '展示研究管线的高层组成，并非未公开模块的精确论文架构；检测示例不自动代表其他任务的实现。', en: 'A high-level pipeline, not the exact architecture of an unreleased manuscript. The detection example does not establish how other tasks are implemented.' },
      implementation: [
        { zh: 'PyTorch 模块与检测配置位于独立源码区；训练脚本与结果记录保留各自版本。', en: 'PyTorch modules and detection configurations live in a source area, with versioned training scripts and result records.' },
        { zh: '比较必须绑定数据划分、初始化、训练预算与评价协议，不能把不同设置的成绩拼成排行榜。', en: 'Comparisons must fix splits, initialization, training budgets, and evaluation protocols; scores from different settings are not combined into a leaderboard.' },
      ],
      results: [
        { zh: '已核对项目源码中的 PyTorch 检测结构与状态空间研究模块。', en: 'The PyTorch detection structure and state-space research modules have been inspected in the workspace.' },
        { zh: '研究仍在进行；当前不提供尚未确认公开范围的实验数值。', en: 'Research is ongoing. Experimental numbers are withheld until their public release scope is confirmed.' },
      ],
      limitations: [
        { zh: '不能声称跨数据集普遍提升、首次将 Mamba 用于 SAR 或已达到 SOTA。', en: 'No claim is made of universal cross-dataset improvement, the first use of Mamba for SAR, or state-of-the-art performance.' },
        { zh: '源码包含上游 AGPL-3.0 许可；不把该项目重新标成 MIT，也不自动公开数据与权重。', en: 'The source includes upstream AGPL-3.0 licensing. It is not relabelled MIT, and data or weights are not automatically released.' },
      ],
      nextSteps: [
        { zh: '完成贡献与许可核对后，整理最小模块示例和可复现的环境说明。', en: 'After checking contributions and licensing, prepare a minimal module example and reproducible environment documentation.' },
        { zh: '对外结果需带版本、协议、负结果与局限说明，并与论文状态同步。', en: 'Public results should include versions, protocols, negative results, limitations, and the corresponding paper status.' },
      ],
      reviewed: '2026-10-11',
    },
  },
  {
    slug: 'phyd-mae',
    title: { zh: 'PhyD-MAE · SAR 自监督表征', en: 'PhyD-MAE · Self-supervised SAR Representations' },
    description: { zh: '面向 SAR 目标识别的掩码预测研究，探索结构化监督目标与共享视觉编码器之间的关系。', en: 'Masked-prediction research for SAR target recognition, exploring structured supervision targets and a shared visual encoder.' },
    category: 'research', year: 2026, featured: true, status: 'in-progress', sourceAvailability: 'restricted',
    cover: '/images/projects/phyd-mae.svg', tags: ['Python', 'PyTorch', 'Masked Modeling', 'Self-supervised Learning', 'SAR'],
    details: {
      problem: { zh: 'SAR 标注有限，而像素重建目标不一定与识别所需的表征一致。研究关注如何设计自监督目标，让掩码预测服务于下游表征学习。', en: 'SAR annotations are limited, and pixel reconstruction need not align with recognition. This work studies supervision targets that connect masked prediction to downstream representation learning.' },
      contributions: [
        { zh: '实现共享编码器与确定性结构目标的掩码预训练流程。', en: 'Implements masked pretraining with a shared encoder and deterministic structural targets.' },
        { zh: '维护预训练入口、环境说明和下游识别相关代码。', en: 'Maintains pretraining entry points, environment documentation, and downstream recognition code.' },
        { zh: '将预训练目标、表征评价和论文证据分开管理。', en: 'Separates pretraining objectives, representation evaluation, and paper evidence.' },
      ],
      contributionNote: { zh: '只概括可核对的项目结构；不据此补造论文作者顺序、学校、合作关系或个人独立贡献。', en: 'Only verifiable project structure is summarized. Author order, affiliations, collaborations, and sole authorship are not inferred.' },
      architecture: [
        { title: { zh: 'SAR 输入', en: 'SAR input' }, description: { zh: '单通道图像与掩码采样', en: 'Single-channel imagery and masking' } },
        { title: { zh: '共享编码器', en: 'Shared encoder' }, description: { zh: '学习可迁移的视觉表征', en: 'Learning transferable visual features' } },
        { title: { zh: '结构目标', en: 'Structural targets' }, description: { zh: '确定性目标与掩码预测', en: 'Deterministic targets and masked prediction' } },
        { title: { zh: '下游识别', en: 'Recognition' }, description: { zh: '表征评估与协议核对', en: 'Representation evaluation and protocol checks' } },
      ],
      architectureNote: { zh: '仅为预训练到下游评价的概念级结构示意。本项目是表征学习研究，不作为去噪产品展示。', en: 'A conceptual view from pretraining to downstream evaluation. This is representation-learning research, not a denoising product.' },
      implementation: [
        { zh: '以 Python / PyTorch 实现模型与训练流程，代码中可以核对结构目标模块和图像输入约束。', en: 'Models and training are implemented in Python / PyTorch, with structural-target modules and explicit image-input constraints.' },
        { zh: '环境说明区分运行依赖、数据准备和冒烟示例；示例图像不代替正式研究数据。', en: 'Environment documentation separates dependencies, data preparation, and smoke examples; example images do not replace research datasets.' },
      ],
      results: [
        { zh: '已核对预训练源码、结构目标类与运行文档，足以支撑项目概览。', en: 'Pretraining source, structural-target classes, and run documentation support this project overview.' },
        { zh: '本次网站整理没有重新训练、推理或复算论文结果。', en: 'This website update does not retrain models, run inference, or recompute paper results.' },
      ],
      limitations: [
        { zh: '已有研究稿与提交记录不等于论文已接收或已发表；完整论文条目待公开元数据核验。', en: 'A manuscript or submission record is not evidence of acceptance or publication. A paper entry awaits verification of public metadata.' },
        { zh: '未在本站分发原始 SAR 数据、冻结稿件、模型权重或内部实验表。', en: 'Raw SAR data, frozen manuscripts, model weights, and internal experiment tables are not distributed here.' },
      ],
      nextSteps: [
        { zh: '核验公开源码版本与第三方许可，再补充可复现的最小示例。', en: 'Verify a public source version and third-party licenses before adding a reproducible minimal example.' },
        { zh: '在作者、论文状态与公开链接确认后，与论文页同步维护。', en: 'Synchronize the publications page after authorship, paper status, and public links are confirmed.' },
      ],
      reviewed: '2026-10-11',
    },
  },
]
