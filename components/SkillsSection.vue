<template>
  <div>
    <p class="muted mb-6 max-w-2xl text-sm leading-7">{{ isEn ? 'Organized by the work, with links to the projects behind each area. Technologies listed here are present in project source, not proficiency scores.' : '按实际工作组织能力，并连接对应项目。这里列的是源码中可核对的技术，不使用未经证实的熟练度评分。' }}</p>
    <div class="skills-grid">
      <article v-for="(group, index) in skillGroups" :key="group.id">
        <p class="eyebrow">0{{ index + 1 }} / {{ group.id.replaceAll('-', ' ') }}</p>
        <h3 class="mt-3 text-lg font-medium">{{ group.title[lang] }}</h3>
        <p class="muted mt-3 text-sm leading-7">{{ group.description[lang] }}</p>
        <ul class="mt-5 flex flex-wrap gap-2"><li v-for="tool in group.tools" :key="tool" class="chip">{{ tool }}</li></ul>
        <div class="skills-links"><NuxtLink v-for="slug in group.projects" :key="slug" :to="to(`/projects/${slug}`)" class="text-link text-xs">{{ projectName(slug) }}<SiteIcon name="arrow-up-right" class="h-3 w-3" /></NuxtLink></div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { skillGroups } from '~/data/skills'
import { projects } from '~/data/projects'
const { locale } = useI18n()
const lang = computed<'zh' | 'en'>(() => locale.value === 'en' ? 'en' : 'zh')
const isEn = computed(() => lang.value === 'en')
const { to } = useLocaleUrl()
const projectName = (slug: string) => projects.find(project => project.slug === slug)?.title[lang.value] ?? slug
</script>

<style scoped>
.skills-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.skills-grid article { min-width: 0; display: flex; flex-direction: column; padding: 28px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); }
.skills-links { display: flex; flex-wrap: wrap; gap: 12px 20px; margin-top: auto; padding-top: 24px; }
@media (max-width: 639px) { .skills-grid { grid-template-columns: minmax(0, 1fr); } .skills-grid article { padding: 22px; } }
</style>
