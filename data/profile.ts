import { skillGroups } from './skills.ts'

/** All public personal information lives here. Leave unverified fields null. */
export interface LocalizedText {
  zh: string
  en: string
}

export interface ProfileEntry {
  id: string
  period: LocalizedText
  title: LocalizedText
  organization?: LocalizedText
  description?: LocalizedText
}

export interface Profile {
  name: string
  initials: string
  role: LocalizedText
  bio: LocalizedText
  github: string
  email: string | null
  scholar: string | null
  orcid: string | null
  linkedin: string | null
  researchGate: string | null
  avatar: string | null
  /** A verified PDF in public/, for example /cv/zhang-ji.pdf. */
  cvPdf: string | null
  interests: LocalizedText[]
  education: ProfileEntry[]
  experience: ProfileEntry[]
  milestones: ProfileEntry[]
  awards: ProfileEntry[]
  academicServices: ProfileEntry[]
  skills: string[]
  updated: string
}

export const profile: Profile = {
  name: 'Zhang Ji',
  initials: 'ZJ',
  role: {
    zh: 'AI 研究 · 计算机视觉 · Agent 工程',
    en: 'AI Research · Computer Vision · Agent Engineering',
  },
  bio: {
    zh: '研究 SAR 图像理解、自监督表征与状态空间视觉模型，也探索验证驱动的 Agent 与工具系统。把研究问题落到代码，让实现过程、证据与边界都清晰可见。',
    en: 'Exploring SAR image understanding, self-supervised representations, and state-space vision, alongside verification-driven agents and tool systems. Turning research questions into code, with clear evidence and honest boundaries.',
  },
  github: 'https://github.com/jiZhangji',
  email: null,
  scholar: null,
  orcid: null,
  linkedin: null,
  researchGate: null,
  avatar: null,
  cvPdf: null,
  interests: [
    { zh: '计算机视觉', en: 'Computer Vision' },
    { zh: 'SAR 图像理解', en: 'SAR Image Understanding' },
    { zh: '遥感', en: 'Remote Sensing' },
    { zh: '自监督学习', en: 'Self-supervised Learning' },
    { zh: '多模态学习', en: 'Multimodal Learning' },
    { zh: '视觉语言模型', en: 'Vision-Language Models' },
    { zh: '状态空间模型', en: 'State Space Models' },
    { zh: '目标检测', en: 'Object Detection' },
    { zh: '少样本学习', en: 'Few-shot Learning' },
    { zh: '生成模型', en: 'Generative Models' },
    { zh: 'LLM Agent 与多智能体系统', en: 'LLM Agents & Multi-Agent Systems' },
    { zh: '工具调用与验证', en: 'Tool Use & Verification' },
  ],
  // Populate only with confirmed, public information; no example credentials.
  education: [],
  experience: [],
  // Confirmed in the 2026-09-27 source inventory, not academic credentials.
  milestones: [
    {
      id: 'pelican-20260927',
      period: { zh: '2026.09.27', en: '2026.09.27' },
      title: { zh: '鹈鹕视觉与交互实验', en: 'Pelican visual & interactive experiments' },
      description: {
        zh: '三份独立的 Three.js / WebGL 骑行场景，以及 SVG 骑行与叠罗汉延伸题。记录实现差异、来源与验证边界。',
        en: 'Three independent Three.js / WebGL cycling scenes, plus SVG cycling and balancing-stack studies. Documenting implementation differences, sources, and verification limits.',
      },
    },
  ],
  awards: [],
  academicServices: [],
  // Derive the CV list from the same evidence-linked groups as the site / README.
  skills: [...new Set(skillGroups.flatMap(group => group.tools))],
  updated: '2026-10-11',
}
