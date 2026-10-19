<template>
  <div v-if="project.details" class="case-study">
    <aside class="case-disclosure" role="note">
      <ProjectStatus :status="project.status" />
      <p>{{ project.sourceAvailability === 'restricted' ? (isEn ? 'This is a high-level research overview. Unreleased manuscripts, data, checkpoints, and private source code are not distributed here.' : '本页只整理研究方向与代码结构概览，不分发未公开论文、数据、模型权重或私人源码。') : (isEn ? 'Implementation scope and validation limits are listed separately below.' : '下方分别说明已实现的内容和验证边界。') }}</p>
      <span class="font-mono text-[10px]">{{ isEn ? 'Content reviewed' : '内容核对' }} / {{ project.details.reviewed }}</span>
    </aside>

    <nav class="case-navigation" :aria-label="isEn ? 'Case study sections' : '项目详情目录'">
      <a v-for="section in sections" :key="section.id" :href="`#${section.id}`">{{ section.title[lang] }}</a>
    </nav>

    <section id="problem" class="case-section case-columns">
      <div><p class="eyebrow">01 / PROBLEM</p><h2 class="section-heading mt-3">{{ isEn ? 'The problem worth solving.' : '从问题出发。' }}</h2></div>
      <p class="muted text-sm leading-8">{{ project.details.problem[lang] }}</p>
    </section>

    <section id="contributions" class="case-section">
      <p class="eyebrow">02 / CONTRIBUTIONS</p><h2 class="section-heading mt-3">{{ isEn ? 'What the project contains.' : '项目做了什么。' }}</h2>
      <ul class="case-points mt-6"><li v-for="item in project.details.contributions" :key="item.en">{{ item[lang] }}</li></ul>
      <p class="muted mt-5 text-xs leading-7">{{ project.details.contributionNote[lang] }}</p>
    </section>

    <section id="architecture" class="case-section">
      <p class="eyebrow">03 / ARCHITECTURE</p><h2 class="section-heading mb-7 mt-3">{{ isEn ? 'A view of the system.' : '理解技术结构。' }}</h2>
      <ProjectArchitecture :steps="project.details.architecture" :note="project.details.architectureNote" />
    </section>

    <section id="implementation" class="case-section">
      <div class="case-columns">
        <div><p class="eyebrow">04 / IMPLEMENTATION</p><h2 class="section-heading mt-3">{{ isEn ? 'From concept to code.' : '从方法到实现。' }}</h2><div class="mt-5 flex flex-wrap gap-2"><span v-for="tag in project.tags" :key="tag" class="chip">{{ tag }}</span></div></div>
        <ul class="case-points"><li v-for="item in project.details.implementation" :key="item.en">{{ item[lang] }}</li></ul>
      </div>
      <div v-if="project.details.contentBlocks?.implementation?.length" class="case-blocks"><ProjectContentBlock v-for="block in project.details.contentBlocks.implementation" :key="block.id" :block="block" /></div>
    </section>

    <section id="results" class="case-section">
      <p class="eyebrow">05 / RESULTS & LIMITS</p><h2 class="section-heading mt-3">{{ isEn ? 'Evidence, with its boundaries.' : '证据与边界，一起呈现。' }}</h2>
      <div class="case-results mt-7">
        <div><h3>{{ isEn ? 'What can be established' : '可确认的内容' }}</h3><ul class="case-points mt-4"><li v-for="item in project.details.results" :key="item.en">{{ item[lang] }}</li></ul></div>
        <div><h3>{{ isEn ? 'What is not claimed' : '尚不能声称的内容' }}</h3><ul class="case-points mt-4"><li v-for="item in project.details.limitations" :key="item.en">{{ item[lang] }}</li></ul></div>
      </div>
      <div v-if="project.details.contentBlocks?.results?.length" class="case-blocks"><ProjectContentBlock v-for="block in project.details.contentBlocks.results" :key="block.id" :block="block" /></div>
    </section>

    <section id="demo" class="case-section">
      <div class="case-columns">
        <div><p class="eyebrow">06 / DEMO</p><h2 class="section-heading mt-3">{{ isEn ? 'See it in context.' : '查看实际演示。' }}</h2></div>
        <div><NuxtLink v-if="demoLink?.kind === 'route'" :to="demoLink.href" class="btn-primary">{{ isEn ? 'Open interactive demo' : '打开交互演示' }}<SiteIcon name="arrow-up-right" class="h-4 w-4" /></NuxtLink><a v-else-if="demoLink" :href="demoLink.href" class="btn-primary" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">{{ isEn ? 'Open demo' : '打开演示' }} ↗</a><p v-else-if="!project.details.contentBlocks?.demo?.length" class="muted text-sm leading-8">{{ isEn ? 'A public demo is not available yet. The architecture above is a code-structure illustration, not a screenshot or a completed product claim.' : '暂未提供公开 Demo。上方为代码结构示意，不是运行截图，也不代表已经交付完整产品。' }}</p></div>
      </div>
      <div v-if="project.details.contentBlocks?.demo?.length" class="case-blocks"><ProjectContentBlock v-for="block in project.details.contentBlocks.demo" :key="block.id" :block="block" /></div>
    </section>

    <section id="source" class="case-section case-columns">
      <div><p class="eyebrow">07 / SOURCE & DOCUMENTATION</p><h2 class="section-heading mt-3">{{ isEn ? 'Read the implementation.' : '继续了解实现。' }}</h2></div>
      <div class="space-y-4"><a v-if="project.repository" :href="project.repository" class="btn-ghost" target="_blank" rel="noopener noreferrer">GitHub<SiteIcon name="arrow-up-right" class="h-4 w-4" /></a><p v-else class="muted text-sm leading-8">{{ isEn ? 'No verified public source release is linked. Repository access, authorship, and redistribution rights must be confirmed before release.' : '尚未链接经确认的公开源码版本；对外发布前需要确认仓库可见性、贡献归属与再分发许可。' }}</p><NuxtLink v-if="project.article" :to="to(project.article)" class="text-link">{{ isEn ? 'Implementation notes' : '阅读技术文档' }}<SiteIcon name="arrow-right" class="h-4 w-4" /></NuxtLink></div>
    </section>

    <section id="future" class="case-section case-columns">
      <div><p class="eyebrow">08 / NEXT STEPS</p><h2 class="section-heading mt-3">{{ isEn ? 'Still in the making.' : '接下来，继续打磨。' }}</h2></div>
      <ul class="case-points"><li v-for="item in project.details.nextSteps" :key="item.en">{{ item[lang] }}</li></ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '~/data/project-types'
const props = defineProps<{ project: Project }>()
const { locale } = useI18n()
const lang = computed<'zh' | 'en'>(() => locale.value === 'en' ? 'en' : 'zh')
const isEn = computed(() => lang.value === 'en')
const { to } = useLocaleUrl()
const { withBase } = useBaseUrl()
const demoLink = computed(() => {
  const path = props.project.demo?.trim()
  if (!path) return null
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path)
      if (url.username || url.password) return null
      return { kind: 'external', href: url.href }
    } catch { return null }
  }
  // Route helpers must never receive external URLs or protocol-relative paths.
  if (!path.startsWith('/') || path.startsWith('//') || /[\u0000-\u0020\u007f\\]/.test(path)) return null
  const pathname = path.split(/[?#]/)[0] || ''
  let decodedPath: string
  try { decodedPath = decodeURIComponent(pathname) } catch { return null }
  if (decodedPath.startsWith('//') || /[\u0000-\u0020\u007f\\]/.test(decodedPath) || decodedPath.split('/').some(part => part === '.' || part === '..')) return null
  return /\.[a-z\d]+$/i.test(pathname)
    ? { kind: 'file', href: withBase(path) }
    : { kind: 'route', href: to(path) }
})
const sections = [
  { id: 'problem', title: { zh: '问题', en: 'Problem' } },
  { id: 'contributions', title: { zh: '贡献', en: 'Contributions' } },
  { id: 'architecture', title: { zh: '架构', en: 'Architecture' } },
  { id: 'implementation', title: { zh: '实现', en: 'Implementation' } },
  { id: 'results', title: { zh: '结果', en: 'Results' } },
  { id: 'demo', title: { zh: '演示', en: 'Demo' } },
  { id: 'source', title: { zh: '源码', en: 'Source' } },
  { id: 'future', title: { zh: '下一步', en: 'Next' } },
]
</script>

<style scoped>
.case-study { margin-top: 36px; }
.case-disclosure { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 24px; padding: 22px 24px; border: 1px solid var(--line); border-radius: 8px; background: var(--soft); }
.case-disclosure p { flex: 1 1 400px; color: var(--muted); font-size: 12px; line-height: 1.9; }
.case-disclosure > span:last-child { color: var(--muted); }
.case-navigation { display: flex; flex-wrap: wrap; gap: 4px 26px; padding: 22px 0; margin-top: 20px; }
.case-navigation a { font-size: 12px; padding-block: 8px; color: var(--accent); }
.case-navigation a:hover { text-decoration: underline; text-underline-offset: 4px; }
.case-section { border-top: 1px solid var(--line); padding: 44px 0; scroll-margin-top: 100px; }
.case-columns { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.65fr); gap: 48px; }
.case-blocks { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; margin-top: 28px; }
.case-points { display: grid; gap: 16px; color: var(--muted); font-size: 14px; line-height: 1.9; }
.case-points li { position: relative; padding-left: 18px; }
.case-points li::before { content: ''; position: absolute; top: 12px; left: 0; width: 4px; height: 4px; background: var(--accent); border-radius: 50%; }
.case-results { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.case-results > div { background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 28px; }
.case-results h3 { font-size: 15px; font-weight: 500; }
@media (max-width: 767px) { .case-columns, .case-results { grid-template-columns: minmax(0, 1fr); gap: 24px; } .case-section { padding-block: 32px; } .case-results > div { padding: 22px; } }
</style>
