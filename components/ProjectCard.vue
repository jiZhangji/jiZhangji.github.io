<template>
  <article class="portfolio-card">
    <NuxtLink :to="to(`/projects/${project.slug}`)" class="project-preview block" tabindex="-1" aria-hidden="true">
      <img :src="withBase(project.cover)" alt="" width="960" height="600" loading="lazy">
    </NuxtLink>
    <div class="portfolio-card-body">
      <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p class="eyebrow">{{ projectCategoryLabels[project.category][lang] }} / {{ project.year }}</p>
        <ProjectStatus :status="project.status" />
      </div>
      <h3 v-if="compact" class="mt-3 text-xl font-medium tracking-tight"><NuxtLink :to="to(`/projects/${project.slug}`)">{{ project.title[lang] }}</NuxtLink></h3>
      <h2 v-else class="mt-3 text-xl font-medium tracking-tight"><NuxtLink :to="to(`/projects/${project.slug}`)">{{ project.title[lang] }}</NuxtLink></h2>
      <p class="muted mt-3 text-sm leading-7">{{ project.description[lang] }}</p>
      <div class="mt-4 flex flex-wrap gap-2"><span v-for="tag in project.tags" :key="tag" class="chip">{{ tag }}</span></div>
      <div class="portfolio-card-footer">
        <NuxtLink :to="to(`/projects/${project.slug}`)" class="text-link" :aria-label="`${lang === 'en' ? 'Explore' : '查看'} ${project.title[lang]}`">{{ lang === 'en' ? 'Explore project' : '查看项目详情' }}<SiteIcon name="arrow-up-right" class="h-4 w-4" /></NuxtLink>
        <span v-if="project.sourceAvailability === 'restricted'" class="muted text-[10px]">{{ lang === 'en' ? 'Overview only' : '仅展示研究概览' }}</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { projectCategoryLabels, type Project } from '~/data/project-types'
defineProps<{ project: Project; compact?: boolean }>()
const { locale } = useI18n()
const lang = computed<'zh' | 'en'>(() => locale.value === 'en' ? 'en' : 'zh')
const { to } = useLocaleUrl()
const { withBase } = useBaseUrl()
</script>

<style scoped>
.portfolio-card { min-width: 0; display: flex; flex-direction: column; padding: 10px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface); transition: border-color .2s, box-shadow .2s; }
.portfolio-card:hover { border-color: var(--accent); box-shadow: var(--shadow); }
.portfolio-card .project-preview { aspect-ratio: 16 / 9; flex-shrink: 0; }
.portfolio-card .project-preview img { padding: 0; }
.portfolio-card-body { display: flex; flex: 1; flex-direction: column; padding: 20px 14px 12px; }
.portfolio-card-footer { padding-top: 24px; margin-top: auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
@media (max-width: 479px) { .portfolio-card-body { padding: 18px 8px 10px; } }
</style>
