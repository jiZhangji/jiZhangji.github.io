import type { LocalizedText } from './profile'

export interface ResearchTopic {
  id: string
  title: LocalizedText
  summary: LocalizedText
  questions: LocalizedText[]
  keywords: string[]
  relatedProjects?: string[]
}

/** Research interests, not claims of published results or affiliations. */
export const researchTopics: ResearchTopic[] = [
  {
    id: 'sar-representation',
    relatedProjects: ['phyd-mae'],
    title: {
      zh: '可靠的 SAR 表征学习',
      en: 'Reliable SAR Representation Learning',
    },
    summary: {
      zh: '关注散斑噪声、观测角度与数据分布变化下的 SAR 图像理解，探索结构信息与自监督学习如何共同支持稳定的视觉表征。',
      en: 'Investigating SAR image understanding under speckle noise, viewpoint changes, and distribution shifts, with an interest in structure-aware, self-supervised representations.',
    },
    questions: [
      {
        zh: '如何区分目标结构与成像噪声，保留有用的物理信息？',
        en: 'How can representations separate target structure from imaging noise while retaining useful physical information?',
      },
      {
        zh: '有限标注下，自监督预训练与少样本识别如何有效衔接？',
        en: 'How can self-supervised pretraining support recognition with limited labeled data?',
      },
    ],
    keywords: ['SAR ATR', 'Self-supervised Learning', 'Structure Learning', 'Robustness'],
  },
  {
    id: 'remote-sensing-detection',
    relatedProjects: ['sar-mamba'],
    title: {
      zh: '遥感目标检测',
      en: 'Remote Sensing Object Detection',
    },
    summary: {
      zh: '关注复杂背景中的小目标与多尺度目标检测，以及开放词汇、少样本场景下的泛化能力。也关注模型精度、效率与实际部署条件之间的平衡。',
      en: 'Exploring small-object and multi-scale detection in complex remote sensing scenes, alongside open-vocabulary generalization and the trade-offs between accuracy, efficiency, and deployment.',
    },
    questions: [
      {
        zh: '怎样让小目标信息在多尺度特征提取中得到充分保留？',
        en: 'How can multi-scale features preserve the evidence needed to detect small objects?',
      },
      {
        zh: '如何评估未见类别与跨场景迁移中的真实泛化能力？',
        en: 'How should generalization to unseen classes and new scenes be evaluated?',
      },
    ],
    keywords: ['Object Detection', 'Open Vocabulary', 'Few-shot Learning', 'State Space Models'],
  },
  {
    id: 'multimodal-perception',
    title: {
      zh: '多模态遥感感知',
      en: 'Multimodal Remote Sensing',
    },
    summary: {
      zh: '探索 SAR、光学图像与语言之间的互补关系，关注跨模态对齐、视觉语言模型与知识迁移，同时保留不同传感器的成像特性。',
      en: 'Exploring complementary information across SAR, optical imagery, and language through cross-modal alignment, vision-language models, and knowledge transfer.',
    },
    questions: [
      {
        zh: '跨模态对齐时，如何兼顾共同语义与模态独有的信息？',
        en: 'How can alignment balance shared semantics with modality-specific information?',
      },
      {
        zh: '自然图像中的视觉语言知识如何可靠地迁移到遥感场景？',
        en: 'How can vision-language knowledge transfer reliably from natural images to remote sensing?',
      },
    ],
    keywords: ['SAR + Optical', 'Vision-Language Models', 'CLIP', 'Cross-modal Transfer'],
  },
  {
    id: 'generative-remote-sensing',
    title: {
      zh: '生成式遥感',
      en: 'Generative Remote Sensing',
    },
    summary: {
      zh: '关注 SAR 图像生成、光学到 SAR 的转换与可控目标合成。把生成质量、成像一致性和下游任务效用作为需要分别检验的问题。',
      en: 'Interested in SAR image generation, optical-to-SAR translation, and controllable target synthesis, treating visual quality, imaging consistency, and downstream utility as separate questions.',
    },
    questions: [
      {
        zh: '怎样在可控生成中保留几何结构与合理的成像特征？',
        en: 'How can controllable generation preserve geometry and plausible imaging characteristics?',
      },
      {
        zh: '合成数据何时真正帮助下游识别，而不只是视觉上逼真？',
        en: 'When does synthetic data improve recognition rather than merely look convincing?',
      },
    ],
    keywords: ['Generative Models', 'Optical-to-SAR', 'Controllable Synthesis', 'Synthetic Data'],
  },
  {
    id: 'state-space-models',
    title: { zh: '状态空间模型与 Mamba', en: 'State Space Models & Mamba' },
    summary: { zh: '研究选择性状态更新与视觉表征之间的关系，关注 SAR 场景中的目标结构、背景扰动与效率边界。', en: 'Studying selective state updates for visual representations, with an interest in target structure, background variation, and efficiency in SAR.' },
    questions: [
      { zh: '状态更新如何影响目标信息与背景信息的保留？', en: 'How do state updates affect the retention of target and background information?' },
      { zh: '结构改动的作用能否在相同协议下通过消融独立验证？', en: 'Can the effect of an architectural change be isolated by ablations under the same protocol?' },
    ],
    keywords: ['Mamba', 'State Space Models', 'PyTorch', 'Controlled Ablations'],
    relatedProjects: ['sar-mamba'],
  },
  {
    id: 'llm-agents',
    title: { zh: 'LLM Agent 与多智能体系统', en: 'LLM Agents & Multi-Agent Systems' },
    summary: { zh: '关注可验证的工具使用、分阶段辅助和执行记录，也研究多角色协作何时有用、何时增加不必要的复杂度。', en: 'Interested in verifiable tool use, staged assistance, and execution traces, including when multi-role collaboration helps and when it adds unnecessary complexity.' },
    questions: [
      { zh: '如何区分“调用成功”和“任务真正完成”？', en: 'How can systems distinguish a successful tool call from actual task completion?' },
      { zh: '多角色流程是否优于同预算的简单控制器？', en: 'Does a multi-role workflow outperform a simpler controller under the same budget?' },
    ],
    keywords: ['LLM Agents', 'Verification', 'Tool Calling', 'Multi-Agent Systems'],
    relatedProjects: ['gatemcp'],
  },
  {
    id: 'ai-systems',
    title: { zh: 'AI 系统与工具集成', en: 'AI Systems & Tool Integration' },
    summary: { zh: '把研究代码连接为可检查、可维护的工具系统，关注接口、协议、预算、可复现性与面向用户的交互。', en: 'Connecting research code into inspectable, maintainable systems through interfaces, protocols, budgets, reproducibility, and user-facing interaction.' },
    questions: [
      { zh: '怎样让工具的输入、输出和失败状态都有明确契约？', en: 'How can tools give inputs, outputs, and failure states explicit contracts?' },
      { zh: '怎样让技术文档、演示与实际代码保持一致？', en: 'How can documentation and demonstrations stay aligned with the implementation?' },
    ],
    keywords: ['MCP', 'APIs', 'Reproducibility', 'Interactive Systems'],
    relatedProjects: ['gatemcp', 'interactive-lab'],
  },
]
