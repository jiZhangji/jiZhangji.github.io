<template>
  <div class="container-wide pb-6 pt-7 sm:pt-12">
    <header class="max-w-3xl"><p class="eyebrow mb-5">PROJECTS / RESEARCH &amp; ENGINEERING</p><h1 class="page-title">{{ isEn ? 'Research with a working side.' : '研究有深度，工程有落点。' }}</h1><p class="lead mt-6">{{ isEn ? 'SAR vision, verification-driven agents, and interactive systems. Explore the problem, implementation, evidence, and boundaries of each project.' : 'SAR 视觉、验证驱动的 Agent 与交互系统。走进每个项目的问题背景、技术实现、现有证据与适用边界。' }}</p></header>
    <div class="section-rule mt-10 flex flex-wrap gap-x-6 gap-y-1" :aria-label="isEn ? 'Project categories' : '项目分类'"><button v-for="filter in filters" :key="filter.id" type="button" class="filter-tab" :aria-pressed="active === filter.id" @click="active = filter.id">{{ filter.label }}<span class="ml-2 font-mono text-[10px]">{{ count(filter.id) }}</span></button></div>
    <form class="mt-6 flex flex-wrap items-end justify-between gap-4" role="search" @submit.prevent>
      <label class="w-full sm:max-w-sm"><span class="muted mb-2 block text-xs">{{ isEn ? 'Find a project or technology' : '查找项目或技术栈' }}</span><input v-model="search" class="field" type="search" :placeholder="isEn ? 'MCP, SAR, TypeScript…' : 'MCP、SAR、TypeScript…'"></label>
      <p class="muted text-xs" role="status" aria-live="polite">{{ isEn ? filtered.length + ' projects' : filtered.length + ' 个项目' }}</p>
    </form>
    <div class="mt-8 grid gap-6 sm:grid-cols-2"><ProjectCard v-for="project in filtered" :key="project.slug" :project="project" /></div>
    <div v-if="!filtered.length" class="empty-panel mt-8"><h2 class="text-lg font-medium">{{ isEn ? 'No matching projects.' : '没有匹配的项目。' }}</h2><p class="muted mt-3 text-sm">{{ isEn ? 'Try another keyword or view the full collection.' : '试试其他关键词，或查看全部项目。' }}</p><button type="button" class="text-link mt-5" @click="reset">{{ isEn ? 'Clear filters' : '清除筛选' }} →</button></div>
    <p class="muted mt-8 text-xs leading-7">{{ isEn ? 'Research covers are original structure illustrations, not experimental images. Unreleased work is labelled In Progress; a working prototype is not a research benchmark.' : '研究封面为原创结构示意图，不是实验图像。尚未完成的研究标注 In Progress，可运行原型不等于科研性能证明。' }}</p>
  </div>
</template>

<script setup lang="ts">
import { projects } from '~/data/projects'
const { locale } = useI18n()
const isEn = computed(() => locale.value === 'en')
const active = ref('all')
const search = ref('')
const filters = computed(() => [{ id: 'all', label: isEn.value ? 'All work' : '全部项目' }, { id: 'research', label: isEn.value ? 'AI Research' : 'AI 研究' }, { id: 'engineering', label: isEn.value ? 'Engineering' : '工程实践' }, { id: 'experiments', label: isEn.value ? 'Experiments' : '交互实验' }])
const filtered = computed(() => projects.filter(project => {
  if (active.value !== 'all' && project.category !== active.value) return false
  const query = search.value.trim().toLocaleLowerCase()
  return !query || [project.title.zh, project.title.en, project.description.zh, project.description.en, ...project.tags].join(' ').toLocaleLowerCase().includes(query)
}))
const count = (filter: string) => projects.filter(project => filter === 'all' || project.category === filter).length
function reset() { active.value = 'all'; search.value = '' }
usePageSeo(() => isEn.value ? 'Projects' : '项目', () => isEn.value ? 'AI research, SAR vision, agent tool systems, and interactive engineering by Zhang Ji.' : 'Zhang Ji 的 AI 研究、SAR 视觉、Agent 工具系统与交互工程项目。')
</script>
