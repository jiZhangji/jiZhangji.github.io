import type { LocalizedText } from './profile'

export type ProjectStatus = 'in-progress' | 'implemented' | 'prototype'
export type ProjectCategory = 'experiments' | 'engineering' | 'research'

interface ProjectContentBase {
  /** Stable within a project's content blocks. */
  id: string
  title: LocalizedText
  caption?: LocalizedText
}

export interface ProjectCodeBlock extends ProjectContentBase {
  kind: 'code'
  language: string
  /** Displayed as escaped text, never executed. */
  code: string
}

export interface ProjectTableBlock extends ProjectContentBase {
  kind: 'table'
  /** The first column contains row headings; every row must match this width. */
  columns: [LocalizedText, ...LocalizedText[]]
  rows: [LocalizedText, ...LocalizedText[]][]
}

export interface ProjectMathBlock extends ProjectContentBase {
  kind: 'math'
  /** Repository-authored LaTeX only, never route/query input or raw HTML. */
  latex: string
  explanation: LocalizedText
}

export interface ProjectVideoBlock extends ProjectContentBase {
  kind: 'video'
  source: {
    kind: 'local'
    /** Root-relative public/ assets only; no remote media or player embeds. */
    src: string
    mimeType: 'video/mp4' | 'video/webm' | 'video/ogg'
    poster?: string
    /** Supply caption tracks for spoken audio; tracks must also be local. */
    captions?: { src: string; language: 'zh' | 'en'; label: LocalizedText }[]
  } | {
    kind: 'verified-external'
    /** A checked public HTTPS page, opened as a link without a third-party player. */
    href: string
    verifiedOn: string
  }
  /** A readable alternative for the visual sequence and any spoken information. */
  transcript: LocalizedText
}

export type ProjectContentBlock = ProjectCodeBlock | ProjectTableBlock | ProjectMathBlock | ProjectVideoBlock
export type ProjectContentSection = 'implementation' | 'results' | 'demo'

export interface ProjectDetails {
  problem: LocalizedText
  contributions: LocalizedText[]
  contributionNote: LocalizedText
  architecture: { title: LocalizedText; description: LocalizedText }[]
  architectureNote: LocalizedText
  implementation: LocalizedText[]
  results: LocalizedText[]
  limitations: LocalizedText[]
  nextSteps: LocalizedText[]
  reviewed: string
  /** Omit sections without actual, public-safe material. */
  contentBlocks?: Partial<Record<ProjectContentSection, ProjectContentBlock[]>>
}

export interface Project {
  slug: string
  title: LocalizedText
  description: LocalizedText
  category: ProjectCategory
  year: number
  cover: string
  tags: string[]
  featured?: boolean
  status: ProjectStatus
  /** No inferred or private repository URLs. */
  repository?: string
  sourceAvailability: 'public' | 'local' | 'restricted'
  demo?: string
  article?: string
  details?: ProjectDetails
}

export const projectStatusLabels: Record<ProjectStatus, LocalizedText> = {
  'in-progress': { zh: '研究中 · In Progress', en: 'Research · In Progress' },
  implemented: { zh: '已实现 · 持续维护', en: 'Implemented · Evolving' },
  prototype: { zh: '交互原型', en: 'Interactive Prototype' },
}

export const projectCategoryLabels: Record<ProjectCategory, LocalizedText> = {
  research: { zh: 'AI 研究', en: 'AI Research' },
  engineering: { zh: '系统与工程', en: 'Systems & Engineering' },
  experiments: { zh: '交互实验', en: 'Interactive Experiments' },
}
