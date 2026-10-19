<template>
  <div class="container-wide">
    <div class="cv-toolbar mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
      <div>
        <p class="eyebrow">CURRICULUM VITAE</p>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ isEnglish ? 'Public profile · details to be completed' : '公开简历 · 个人资料待补充' }}</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <a v-if="pdfAvailable && cvHref" :href="cvHref" download class="btn-primary">{{ isEnglish ? 'Download CV' : '下载 CV' }} <span aria-hidden="true">↓</span></a>
        <button type="button" :class="pdfAvailable ? 'btn-ghost' : 'btn-primary'" @click="printCv">{{ isEnglish ? 'Print / Save PDF' : '打印 / 保存 PDF' }}</button>
      </div>
    </div>

    <article class="cv-document">
      <header class="cv-heading">
        <h1 class="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-slate-50">{{ profile.name }}</h1>
        <p class="mt-4 text-base text-slate-600 dark:text-slate-400">{{ localize(profile.role) }}</p>
        <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">{{ localize(profile.bio) }}</p>
        <div class="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a :href="profile.github" target="_blank" rel="noopener noreferrer" class="text-link">{{ profile.github.replace(/^https?:\/\//, '') }}</a>
          <a v-if="profile.email" :href="`mailto:${profile.email}`" class="text-link">{{ profile.email }}</a>
          <a v-if="profile.scholar" :href="profile.scholar" target="_blank" rel="noopener noreferrer" class="text-link">Google Scholar</a>
          <a v-if="profile.orcid" :href="profile.orcid" target="_blank" rel="noopener noreferrer" class="text-link">ORCID</a>
        </div>
      </header>

      <section class="cv-row" aria-labelledby="cv-interests">
        <h2 id="cv-interests" class="cv-section-title">{{ isEnglish ? 'Research interests' : '研究兴趣' }}</h2>
        <p class="text-sm leading-8 text-slate-600 dark:text-slate-300">{{ profile.interests.map(localize).join(' · ') }}</p>
      </section>

      <section class="cv-row" aria-labelledby="cv-education">
        <h2 id="cv-education" class="cv-section-title">{{ isEnglish ? 'Education' : '教育经历' }}</h2>
        <AcademicTimeline :entries="profile.education" :empty-text="isEnglish ? 'To be added. No unverified affiliations or degrees are listed.' : '待补充。暂不展示未经确认的学校与学位信息。'" />
      </section>

      <section class="cv-row" aria-labelledby="cv-experience">
        <h2 id="cv-experience" class="cv-section-title">{{ isEnglish ? 'Research experience' : '研究经历' }}</h2>
        <AcademicTimeline :entries="profile.experience" :empty-text="isEnglish ? 'Verified research experience has not been added yet.' : '已核验的研究经历待补充。'" />
      </section>

      <section class="cv-row" aria-labelledby="cv-publications">
        <h2 id="cv-publications" class="cv-section-title">{{ isEnglish ? 'Publications' : '论文与成果' }}</h2>
        <div v-if="sortedPublications.length" class="space-y-5">
          <article v-for="publication in sortedPublications" :key="publication.id">
            <h3 class="text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">{{ publication.title }}</h3>
            <p class="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">{{ publication.authors.map(author => author.name).join(', ') }} · {{ publication.venue }}, {{ publication.year }}</p>
          </article>
          <NuxtLink :to="to('/publications')" class="text-link inline-block text-sm">{{ isEnglish ? 'Full publication list' : '完整论文列表' }} <span aria-hidden="true">→</span></NuxtLink>
        </div>
        <p v-else class="text-sm leading-7 text-slate-500 dark:text-slate-400">{{ isEnglish ? 'No verified publications have been provided yet.' : '尚未提供可公开的已核验论文。' }}</p>
      </section>

      <section class="cv-row" aria-labelledby="cv-projects">
        <h2 id="cv-projects" class="cv-section-title">{{ isEnglish ? 'Projects & experiments' : '项目与实验' }}</h2>
        <div class="space-y-6">
          <article v-for="project in cvProjects" :key="project.slug">
            <div class="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
              <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ localize(project.title) }}</h3>
              <span class="font-mono text-xs text-slate-500 dark:text-slate-400">{{ project.year }}</span>
            </div>
            <p class="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">{{ localize(project.description) }}</p>
            <NuxtLink :to="to(`/projects/${project.slug}`)" class="text-link mt-3 inline-block text-sm">{{ isEnglish ? 'Project details' : '项目详情' }} <span aria-hidden="true">→</span></NuxtLink>
          </article>
          <p v-if="!cvProjects.length" class="text-sm leading-7 text-slate-500 dark:text-slate-400">{{ isEnglish ? 'Project details have not been added.' : '项目资料待补充。' }}</p>
        </div>
      </section>

      <section class="cv-row" aria-labelledby="cv-awards">
        <h2 id="cv-awards" class="cv-section-title">{{ isEnglish ? 'Awards' : '荣誉与奖励' }}</h2>
        <AcademicTimeline :entries="profile.awards" :empty-text="isEnglish ? 'No award information has been added.' : '尚未添加已核验的荣誉与奖励。'" />
      </section>

      <section class="cv-row" aria-labelledby="cv-services">
        <h2 id="cv-services" class="cv-section-title">{{ isEnglish ? 'Academic services' : '学术服务' }}</h2>
        <AcademicTimeline :entries="profile.academicServices" :empty-text="isEnglish ? 'Academic service details have not been added.' : '学术服务信息待补充。'" />
      </section>

      <section class="cv-row" aria-labelledby="cv-tools">
        <h2 id="cv-tools" class="cv-section-title">{{ isEnglish ? 'Tools used here' : '本站实践技术' }}</h2>
        <p class="text-sm leading-7 text-slate-600 dark:text-slate-300">{{ profile.skills.join(' · ') }}</p>
      </section>

      <footer class="mt-10 border-t border-slate-200 pt-5 text-xs leading-6 text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <p>{{ isEnglish ? 'Last updated' : '最后更新' }}: {{ profile.updated }}</p>
        <p v-if="!pdfAvailable" class="cv-toolbar mt-1">{{ isEnglish ? 'A downloadable PDF has not been added. You can print this page or save it as a PDF.' : '尚未添加可下载的 CV 文件，可先打印此页或保存为 PDF。' }}</p>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { profile, type LocalizedText } from '~/data/profile'
import { publications } from '~/data/publications'
import { projects } from '~/data/projects'

const { locale } = useI18n()
const { to } = useLocaleUrl()
const { withBase } = useBaseUrl()
const isEnglish = computed(() => locale.value === 'en')
const localize = (value: LocalizedText) => value[isEnglish.value ? 'en' : 'zh']
const cvHref = computed(() => profile.cvPdf ? withBase(profile.cvPdf) : null)
const pdfAvailable = ref(false)
const sortedPublications = [...publications].sort((a, b) => b.year - a.year)
const cvProjects = projects.filter(project => ['pelican-lab', 'research-notebook'].includes(project.slug))
const pdfController = new AbortController()
let pdfTimer: ReturnType<typeof setTimeout> | undefined

onMounted(async () => {
  if (!cvHref.value) return
  pdfTimer = setTimeout(() => pdfController.abort(), 5000)
  try {
    const response = await fetch(cvHref.value, { method: 'HEAD', signal: pdfController.signal })
    // Reject SPA fallback HTML or nonexistent assets; never show a broken download.
    pdfAvailable.value = response.ok && Boolean(response.headers.get('content-type')?.toLowerCase().includes('application/pdf'))
  } catch {
    pdfAvailable.value = false
  } finally {
    if (pdfTimer) clearTimeout(pdfTimer)
  }
})

onBeforeUnmount(() => {
  pdfController.abort()
  if (pdfTimer) clearTimeout(pdfTimer)
})

function printCv() {
  window.print()
}

useSeoMeta({
  title: () => `CV · ${profile.name}`,
  description: () => isEnglish.value ? `Public profile and curriculum vitae for ${profile.name}.` : `${profile.name} 的公开简历、研究兴趣与项目记录。`,
})
</script>

<style scoped>
.cv-document { border: 1px solid rgb(148 163 184 / 0.3); padding: 3rem; }
.cv-heading { padding-bottom: 2.75rem; }
.cv-row { display: grid; grid-template-columns: 11rem minmax(0, 1fr); gap: 2rem; border-top: 1px solid rgb(148 163 184 / 0.2); padding: 1.75rem 0; }
.cv-section-title { font-size: 0.875rem; line-height: 1.75rem; font-weight: 500; color: #0f172a; }
.dark .cv-section-title { color: #f1f5f9; }
@media (max-width: 768px) {
  .cv-document { border-left: 0; border-right: 0; padding: 2rem 0; }
  .cv-row { grid-template-columns: 1fr; gap: 0.75rem; }
}
@media print {
  .cv-toolbar { display: none !important; }
  .cv-document { border: 0; padding: 0; font-size: 12px; }
  .cv-document, .cv-document * { color: #111827 !important; background: transparent !important; box-shadow: none !important; }
  .cv-heading { padding-bottom: 1.5rem; }
  .cv-heading h1 { font-size: 28px; }
  .cv-row { grid-template-columns: 9rem minmax(0, 1fr); gap: 1.25rem; padding: 1rem 0; break-inside: avoid; }
  .cv-document :deep(.timeline-entry) { grid-template-columns: 6rem minmax(0, 1fr); gap: 1rem; }
  .cv-document a { text-decoration: none; }
}
</style>
