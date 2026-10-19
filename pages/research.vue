<template>
  <div class="container-wide">
    <header class="max-w-3xl">
      <p class="eyebrow">RESEARCH{{ isEnglish ? '' : ' · 研究' }}</p>
      <h1 class="page-title">{{ isEnglish ? 'Questions worth exploring.' : '从值得追问的问题开始。' }}</h1>
      <p class="lead mt-6">{{ isEnglish ? 'Computer vision, remote sensing, state-space models, and tool-using agents. Connected questions about reliable representations and inspectable AI systems.' : '从计算机视觉、遥感与状态空间模型，延伸到工具增强 Agent。关注可靠的表征，也关注可检查的 AI 系统。' }}</p>
      <p class="mt-5 text-xs leading-6 text-slate-500 dark:text-slate-400">{{ isEnglish ? 'These are research interests and open questions, not claims of published findings.' : '以下为研究兴趣与开放问题，不代表已经发表的成果或实验结论。' }}</p>
    </header>

    <nav class="mt-10 flex flex-wrap gap-x-5 gap-y-3 border-y border-slate-200 py-5 dark:border-slate-800" :aria-label="isEnglish ? 'Research topics' : '研究方向导航'">
      <a v-for="(topic, index) in researchTopics" :key="topic.id" :href="`#${topic.id}`" class="text-sm text-slate-600 transition hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400">
        <span class="mr-2 font-mono text-xs text-slate-400 dark:text-slate-500">0{{ index + 1 }}</span>{{ localize(topic.title) }}
      </a>
    </nav>

    <div>
      <section v-for="(topic, index) in researchTopics" :key="topic.id" :aria-labelledby="topic.id" class="research-topic">
        <div>
          <span class="font-mono text-xs text-teal-700 dark:text-teal-400">/ 0{{ index + 1 }}</span>
          <h2 :id="topic.id" class="mt-4 max-w-sm text-2xl font-semibold leading-snug tracking-tight text-slate-950 dark:text-slate-50">{{ localize(topic.title) }}</h2>
          <ul class="mt-6 flex max-w-sm flex-wrap gap-x-3 gap-y-2 text-xs leading-5 text-slate-500 dark:text-slate-400" :aria-label="isEnglish ? 'Keywords' : '关键词'">
            <li v-for="keyword in topic.keywords" :key="keyword">{{ keyword }}</li>
          </ul>
          <div v-if="topic.relatedProjects?.length" class="mt-7 flex flex-wrap gap-4"><NuxtLink v-for="slug in topic.relatedProjects" :key="slug" :to="to(`/projects/${slug}`)" class="text-link text-xs">{{ projectTitle(slug) }} <span aria-hidden="true">↗</span></NuxtLink></div>
        </div>
        <div class="min-w-0">
          <p class="text-base leading-8 text-slate-600 dark:text-slate-300">{{ localize(topic.summary) }}</p>
          <h3 class="mt-7 text-xs font-medium tracking-wider text-slate-500 dark:text-slate-400">{{ isEnglish ? 'QUESTIONS I CARE ABOUT' : '正在关注的问题' }}</h3>
          <ul class="mt-4 space-y-4">
            <li v-for="question in topic.questions" :key="question.en" class="flex gap-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
              <span aria-hidden="true" class="mt-3 h-1 w-1 shrink-0 bg-teal-600 dark:bg-teal-400"></span>
              <span>{{ localize(question) }}</span>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <section class="flex flex-col justify-between gap-6 border-t border-slate-200 pt-10 sm:flex-row sm:items-center dark:border-slate-800">
      <div>
        <h2 class="text-lg font-medium text-slate-950 dark:text-slate-100">{{ isEnglish ? 'Ideas become clearer through practice.' : '让想法在实践中变得清晰。' }}</h2>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ isEnglish ? 'Follow the notes, browse the experiments, or start a conversation.' : '阅读笔记、浏览实验，或就一个具体问题展开交流。' }}</p>
      </div>
      <div class="flex shrink-0 flex-wrap gap-3">
        <NuxtLink :to="to('/blog')" class="btn-ghost">{{ isEnglish ? 'Read the blog' : '阅读博客' }}</NuxtLink>
        <NuxtLink :to="to('/contact')" class="btn-primary">{{ isEnglish ? 'Get in touch' : '联系我' }} <span aria-hidden="true">↗</span></NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { researchTopics } from '~/data/research'
import { projects } from '~/data/projects'
import type { LocalizedText } from '~/data/profile'

const { locale } = useI18n()
const { to } = useLocaleUrl()
const isEnglish = computed(() => locale.value === 'en')
const localize = (value: LocalizedText) => value[isEnglish.value ? 'en' : 'zh']
const projectTitle = (slug: string) => { const project = projects.find(item => item.slug === slug); return project ? localize(project.title) : slug }

usePageSeo(
  () => isEnglish.value ? 'Research' : '研究方向',
  () => isEnglish.value ? 'Research interests in SAR, computer vision, Mamba, LLM agents, verification, and AI tool systems.' : '研究兴趣：SAR、计算机视觉、Mamba、LLM Agent、验证与 AI 工具系统。',
)
</script>

<style scoped>
.research-topic { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.25fr); gap: 4.5rem; padding: 3.5rem 0; }
.research-topic + .research-topic { border-top: 1px solid rgb(148 163 184 / 0.2); }
@media (max-width: 768px) {
  .research-topic { grid-template-columns: 1fr; gap: 1.75rem; padding: 2.5rem 0; }
}
</style>
