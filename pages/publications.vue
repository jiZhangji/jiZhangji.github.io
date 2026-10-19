<template>
  <div class="container-wide">
    <header class="max-w-3xl">
      <p class="eyebrow">PUBLICATIONS{{ isEnglish ? '' : ' · 学术成果' }}</p>
      <h1 class="page-title">{{ isEnglish ? 'Publications.' : '论文与学术成果。' }}</h1>
      <p class="lead mt-6">{{ isEnglish ? 'A place for verified publications, their code, data, and the ideas behind them.' : '收录已核验的论文，以及相关代码、数据与研究思路。' }}</p>
    </header>

    <template v-if="publications.length">
      <form class="publication-filters mt-10" role="search" @submit.prevent>
        <label class="filter-search">
          <span class="filter-label">{{ isEnglish ? 'Search publications' : '搜索论文' }}</span>
          <input v-model="search" type="search" :placeholder="isEnglish ? 'Title, author, venue…' : '标题、作者、会议 / 期刊…'" class="filter-input">
        </label>
        <label>
          <span class="filter-label">{{ isEnglish ? 'Year' : '年份' }}</span>
          <select v-model="year" class="filter-input">
            <option value="all">{{ isEnglish ? 'All years' : '所有年份' }}</option>
            <option v-for="availableYear in years" :key="availableYear" :value="String(availableYear)">{{ availableYear }}</option>
          </select>
        </label>
        <label>
          <span class="filter-label">{{ isEnglish ? 'Status' : '论文状态' }}</span>
          <select v-model="status" class="filter-input">
            <option value="all">{{ isEnglish ? 'All statuses' : '所有状态' }}</option>
            <option v-for="availableStatus in statuses" :key="availableStatus" :value="availableStatus">{{ publicationStatusLabels[availableStatus][isEnglish ? 'en' : 'zh'] }}</option>
          </select>
        </label>
        <label>
          <span class="filter-label">{{ isEnglish ? 'Topic / venue' : '主题 / 会议' }}</span>
          <select v-model="tag" class="filter-input">
            <option value="all">{{ isEnglish ? 'All tags' : '所有标签' }}</option>
            <option v-for="availableTag in tags" :key="availableTag" :value="availableTag">{{ availableTag }}</option>
          </select>
        </label>
      </form>
      <div class="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 text-sm dark:border-slate-800">
        <p class="text-slate-500 dark:text-slate-400" role="status" aria-live="polite">{{ isEnglish ? `${filtered.length} publication${filtered.length === 1 ? '' : 's'}` : `${filtered.length} 篇论文` }}</p>
        <div class="flex flex-wrap items-center gap-5">
          <label v-if="hasSelected" class="flex cursor-pointer items-center gap-2 text-slate-600 dark:text-slate-400">
            <input v-model="selectedOnly" type="checkbox" class="h-4 w-4 accent-teal-700">
            {{ isEnglish ? 'Selected only' : '仅看精选' }}
          </label>
          <button v-if="hasFilters" type="button" class="text-link" @click="resetFilters">{{ isEnglish ? 'Clear filters' : '清除筛选' }}</button>
        </div>
      </div>

      <section v-for="group in groups" :key="group.year" :aria-labelledby="`year-${group.year}`" class="publication-year">
        <h2 :id="`year-${group.year}`" class="font-mono text-sm text-slate-500 dark:text-slate-400">{{ group.year }}</h2>
        <div class="min-w-0">
          <AcademicPublication v-for="publication in group.items" :key="publication.id" :publication="publication" />
        </div>
      </section>
      <div v-if="!filtered.length" class="py-16 text-center">
        <p class="text-slate-600 dark:text-slate-400">{{ isEnglish ? 'No publications match these filters.' : '没有符合当前筛选条件的论文。' }}</p>
        <button type="button" class="text-link mt-4 text-sm" @click="resetFilters">{{ isEnglish ? 'Show all publications' : '查看全部论文' }} <span aria-hidden="true">→</span></button>
      </div>
    </template>

    <section v-else class="empty-publications section-space" aria-labelledby="empty-heading">
      <div class="empty-symbol" aria-hidden="true">
        <svg viewBox="0 0 48 56" fill="none" class="h-14 w-12"><path d="M8 2h22l10 10v42H8V2Z" stroke="currentColor" stroke-width="1.2"/><path d="M30 2v11h10M16 25h16M16 32h16M16 39h9" stroke="currentColor" stroke-width="1.2"/></svg>
      </div>
      <div class="max-w-lg">
        <p class="eyebrow">{{ isEnglish ? 'OPEN, WHEN VERIFIED' : '以真实内容为准' }}</p>
        <h2 id="empty-heading" class="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{{ isEnglish ? 'No verified publications listed yet.' : '这里暂未列出已核验论文。' }}</h2>
        <p class="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">{{ isEnglish ? 'Publication details have not been provided. This page intentionally contains no sample papers or invented academic results. Research interests and existing visual experiments are available below.' : '目前尚未提供可公开的论文信息，因此这里不放示例论文，也不把研究计划或视觉实验当作学术成果。可以先了解研究方向与已有作品。' }}</p>
        <div class="mt-7 flex flex-wrap gap-3">
          <NuxtLink :to="to('/research')" class="btn-primary">{{ isEnglish ? 'Research interests' : '研究方向' }} <span aria-hidden="true">→</span></NuxtLink>
          <NuxtLink :to="to('/projects')" class="btn-ghost">{{ isEnglish ? 'Explore projects' : '浏览项目' }}</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { publications, publicationStatusLabels, type Publication } from '~/data/publications'

const { locale } = useI18n()
const { to } = useLocaleUrl()
const isEnglish = computed(() => locale.value === 'en')
const search = ref('')
const year = ref('all')
const status = ref<Publication['status'] | 'all'>('all')
const tag = ref('all')
const selectedOnly = ref(false)
const years = [...new Set(publications.map(publication => publication.year))].sort((a, b) => b - a)
const statuses = (Object.keys(publicationStatusLabels) as Publication['status'][]).filter(value => publications.some(publication => publication.status === value))
const tags = [...new Set(publications.flatMap(publication => publication.tags))].sort((a, b) => a.localeCompare(b))
const hasSelected = publications.some(publication => publication.selected)
const hasFilters = computed(() => Boolean(search.value.trim()) || year.value !== 'all' || status.value !== 'all' || tag.value !== 'all' || selectedOnly.value)

const filtered = computed<Publication[]>(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return publications.filter((publication) => {
    if (year.value !== 'all' && String(publication.year) !== year.value) return false
    if (status.value !== 'all' && publication.status !== status.value) return false
    if (tag.value !== 'all' && !publication.tags.includes(tag.value)) return false
    if (selectedOnly.value && !publication.selected) return false
    if (!query) return true
    return [publication.title, publication.venue, ...publication.authors.map(author => author.name), ...publication.tags].join(' ').toLocaleLowerCase().includes(query)
  }).sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))
})

const groups = computed(() => years
  .map(groupYear => ({
    year: groupYear,
    items: filtered.value.filter(publication => publication.year === groupYear),
  }))
  .filter(group => group.items.length > 0))

function resetFilters() {
  search.value = ''
  year.value = 'all'
  status.value = 'all'
  tag.value = 'all'
  selectedOnly.value = false
}

usePageSeo(
  () => isEnglish.value ? 'Publications' : '论文与学术成果',
  () => isEnglish.value ? 'Verified publication details, with year, status, and topic filters, paper and code links, and BibTeX citations.' : '已核验论文信息，支持年份、状态与标签筛选、论文与代码链接、BibTeX 引用。',
)
</script>

<style scoped>
.publication-filters { display: grid; grid-template-columns: minmax(0, 1fr) 7rem 9rem 11rem; gap: 1rem; }
.filter-label { display: block; margin-bottom: 0.5rem; font-size: 0.75rem; color: #64748b; }
.filter-input { width: 100%; min-height: 2.75rem; border: 1px solid rgb(148 163 184 / 0.4); border-radius: 0.25rem; background: transparent; padding: 0.5rem 0.75rem; font-size: 0.875rem; }
.filter-input:focus-visible { outline: 2px solid #0d9488; outline-offset: 2px; }
.publication-year { display: grid; grid-template-columns: 5rem minmax(0, 1fr); gap: 2rem; }
.publication-year > h2 { padding-top: 2.25rem; }
.publication-year + .publication-year { border-top: 1px solid rgb(148 163 184 / 0.3); }
.empty-publications { display: flex; align-items: flex-start; gap: 3rem; border-top: 1px solid rgb(148 163 184 / 0.3); border-bottom: 1px solid rgb(148 163 184 / 0.3); padding: 3.5rem 0; }
.empty-symbol { display: grid; place-items: center; width: 7rem; height: 7rem; flex-shrink: 0; background: rgb(148 163 184 / 0.05); color: #0f766e; }
.dark .filter-label { color: #94a3b8; }
.dark .filter-input option { background: #0f172a; color: #e2e8f0; }
.dark .empty-symbol { color: #5eead4; }
@media (max-width: 767px) {
  .publication-filters { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .filter-search { grid-column: 1 / -1; }
  .publication-year { grid-template-columns: 1fr; gap: 0; }
  .publication-year > h2 { padding-top: 1.5rem; }
  .empty-publications { flex-direction: column; gap: 1.75rem; padding: 2.5rem 0; }
  .empty-symbol { width: 4.5rem; height: 4.5rem; }
  .empty-symbol svg { width: 2rem; height: 2.5rem; }
}
</style>
