import { pelicanExperiments } from './experiments.ts'
import { caseStudies } from './case-studies.ts'
import { engineeringProjects } from './engineering-projects.ts'
import type { Project } from './project-types'
export type { Project } from './project-types'

/** Only projects with actual source files are listed. */
export const projects: Project[] = [
  ...caseStudies,
  ...engineeringProjects,
  {
    slug: 'pelican-lab',
    title: { zh: '鹈鹕生成实验', en: 'The Pelican Experiments' },
    description: { zh: '从矢量习作到三份独立 3D 海岸骑行原型，整理生成式编程的作品、差异与验证边界。', en: 'From vector studies to three independent 3D coastal rides: an archive of generative coding, implementation differences, and verification boundaries.' },
    category: 'experiments', year: 2026, status: 'prototype', sourceAvailability: 'local',
    cover: '/experiments/pelican/svg/frontier-pelican-bicycle.svg',
    tags: ['Generative Coding', 'Three.js', 'WebGL', 'SVG'],
  },
  ...pelicanExperiments.map((experiment): Project => ({
    slug: `pelican-${experiment.id}`,
    title: experiment.title,
    description: experiment.description,
    category: 'experiments', year: 2026, status: 'prototype', sourceAvailability: 'local', cover: experiment.cover,
    tags: experiment.tags, demo: experiment.demo,
  })),
  {
    slug: 'research-notebook',
    title: { zh: '一份持续生长的研究笔记', en: 'A Research Notebook' },
    description: { zh: '以 Nuxt 为基础，将研究方向、技术博客与可交互作品连接起来的双语个人主页。', en: 'A bilingual personal website connecting research interests, technical writing, and interactive work, built on Nuxt.' },
    category: 'engineering', year: 2026, status: 'implemented', sourceAvailability: 'local', cover: '/images/research-notebook.svg',
    tags: ['Nuxt', 'TypeScript', 'Markdown', 'KaTeX', 'i18n'],
  },
]
