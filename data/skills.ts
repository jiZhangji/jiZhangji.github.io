import type { LocalizedText } from './profile'

export interface SkillGroup {
  id: string
  title: LocalizedText
  description: LocalizedText
  tools: string[]
  projects: string[]
}

/** Observed in project source; not self-assigned proficiency ratings. */
export const skillGroups: SkillGroup[] = [
  {
    id: 'ai-research', title: { zh: 'AI 与视觉研究', en: 'AI & Vision Research' },
    description: { zh: '从自监督目标到状态空间视觉模块，结合协议与消融理解方法的适用边界。', en: 'From self-supervised objectives to state-space vision modules, with protocols and ablations that clarify where methods apply.' },
    tools: ['Python', 'PyTorch', 'Masked Modeling', 'Mamba'], projects: ['phyd-mae', 'sar-mamba'],
  },
  {
    id: 'agent-engineering', title: { zh: 'Agent 与工具工程', en: 'Agents & Tool Engineering' },
    description: { zh: '将任务验证、工具接口、策略控制与成本记录拆分为可检查的模块。', en: 'Separating task verification, tool interfaces, policy control, and cost accounting into inspectable modules.' },
    tools: ['MCP', 'FastMCP', 'Tool Calling', 'Python unittest'], projects: ['gatemcp'],
  },
  {
    id: 'web-engineering', title: { zh: 'Web 与产品实现', en: 'Web & Product Engineering' },
    description: { zh: '以类型化数据组织内容，交付双语页面、静态站点与浏览器交互。', en: 'Typed content powering bilingual pages, static delivery, and browser interactions.' },
    tools: ['TypeScript', 'Vue / Nuxt', 'Tailwind CSS', 'Markdown'], projects: ['research-notebook'],
  },
  {
    id: 'interactive-systems', title: { zh: '交互与可视化', en: 'Interaction & Visualization' },
    description: { zh: '用可运行的小型系统解释算法与交互，区分演示效果和研究成绩。', en: 'Small working systems for exploring algorithms and interaction, without conflating demos with research results.' },
    tools: ['Three.js', 'WebGL', 'SVG', 'Web Workers'], projects: ['pelican-lab', 'interactive-lab'],
  },
]
