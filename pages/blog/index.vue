<template>
  <div class="container-page notebook-page">
    <PageHeader :eyebrow="copy.eyebrow" :title="copy.title" :subtitle="copy.subtitle">
      <nav class="notebook-navigation" :aria-label="copy.browse">
        <NuxtLink :to="url.to('/archive')" class="text-link">{{ copy.archive }}</NuxtLink>
        <NuxtLink :to="url.to('/categories')" class="text-link">{{ copy.categories }}</NuxtLink>
        <NuxtLink :to="url.to('/tags')" class="text-link">{{ copy.tags }}</NuxtLink>
      </nav>
    </PageHeader>

    <section class="notebook-filters" :aria-label="copy.filter">
      <div class="flex flex-col gap-3 sm:flex-row">
        <div class="relative min-w-0 flex-1">
          <svg class="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>
          <input v-model="search" type="search" :aria-label="copy.search" :placeholder="copy.search" class="field pl-10">
        </div>
        <select v-model="category" :aria-label="copy.categories" class="field sm:max-w-[13rem]">
          <option value="">{{ copy.allCategories }}</option>
          <option v-for="item in categories" :key="item.slug" :value="item.slug">{{ label(item.slug) }} ({{ item.count }})</option>
        </select>
      </div>
      <div v-if="tags.length" class="mt-4 flex flex-wrap gap-2" :aria-label="copy.tags">
        <button
          v-for="item in tags.slice(0, 10)"
          :key="item.name"
          type="button"
          class="chip"
          :class="tag === item.name ? '!border-brand-500 !text-brand-700 dark:!text-brand-400' : ''"
          :aria-pressed="tag === item.name"
          @click="tag = tag === item.name ? '' : item.name"
        >{{ item.name }}</button>
        <NuxtLink v-if="tags.length > 10" :to="url.to('/tags')" class="text-link self-center text-xs">{{ copy.moreTags }}</NuxtLink>
      </div>
      <div class="muted mt-5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span aria-live="polite">{{ filtered.length }} {{ copy.count }}<span v-if="tag"> · #{{ tag }}</span></span>
        <button v-if="hasFilters" type="button" class="text-link" @click="clearFilters">{{ copy.clear }}</button>
      </div>
    </section>

    <div v-if="status === 'pending'" class="py-16 text-center text-sm text-slate-500" role="status">{{ copy.loading }}</div>
    <div v-else-if="error" class="py-16 text-center">
      <p class="text-sm text-slate-500">{{ copy.failed }}</p>
      <button type="button" class="btn-ghost mt-5" @click="refresh()">{{ copy.retry }}</button>
    </div>
    <div v-else-if="paged.length">
      <PostCard v-for="(post, index) in paged" :key="post.path" :post="post" :featured="index === 0 && page === 1 && !hasFilters" />
    </div>
    <div v-else class="py-16 text-center" role="status">
      <h2 class="text-base font-medium">{{ hasFilters ? copy.noMatch : copy.empty }}</h2>
      <p class="mt-3 text-sm text-slate-500">{{ hasFilters ? copy.noMatchHint : copy.emptyHint }}</p>
      <button v-if="hasFilters" type="button" class="btn-ghost mt-5" @click="clearFilters">{{ copy.clear }}</button>
    </div>

    <nav v-if="totalPages > 1" class="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm dark:border-slate-800" :aria-label="copy.pagination">
      <NuxtLink v-if="page > 1" :to="pageHref(page - 1)" class="text-link" @click="scrollTop">← {{ copy.prev }}</NuxtLink>
      <span v-else class="text-slate-400" aria-disabled="true">← {{ copy.prev }}</span>
      <span class="text-xs tabular-nums text-slate-500">{{ page }} / {{ totalPages }}</span>
      <NuxtLink v-if="page < totalPages" :to="pageHref(page + 1)" class="text-link" @click="scrollTop">{{ copy.next }} →</NuxtLink>
      <span v-else class="text-slate-400" aria-disabled="true">{{ copy.next }} →</span>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const url = useLocaleUrl()
const route = useRoute()
const router = useRouter()
const { posts, categories, tags, status, error, refresh } = useBlog()
const { label } = useCategoriesConfig()
const site = useAppConfig().site as { title: string }
const PER_PAGE = 8
const copy = computed(() => locale.value === 'zh' ? {
  eyebrow: 'WRITING / NOTES', title: '技术随记', subtitle: '研究与工程的工作笔记。保留实验过程、来源和结论边界。',
  browse: '浏览文章', archive: '时间归档', categories: '分类', tags: '标签', filter: '筛选文章',
  search: '搜索标题、摘要或关键词…', allCategories: '全部分类', moreTags: '更多标签 →',
  count: '篇文章', clear: '清除筛选', loading: '正在读取文章…', failed: '文章暂时未能加载。', retry: '重新加载',
  noMatch: '没有找到匹配的文章', noMatchHint: '换个关键词，或清除筛选查看全部文章。',
  empty: '新的记录正在整理', emptyHint: '真实的实验与技术笔记会陆续收录在这里。',
  pagination: '文章分页', prev: '上一页', next: '下一页',
} : {
  eyebrow: 'WRITING / NOTES', title: 'Writing', subtitle: 'Notes from research and engineering. Documenting the process, evidence and limits of each conclusion.',
  browse: 'Browse writing', archive: 'Archive', categories: 'Categories', tags: 'Tags', filter: 'Filter articles',
  search: 'Search titles, summaries or keywords…', allCategories: 'All categories', moreTags: 'More tags →',
  count: 'articles', clear: 'Clear filters', loading: 'Loading articles…', failed: 'Articles could not be loaded.', retry: 'Try again',
  noMatch: 'No matching articles', noMatchHint: 'Try another keyword or clear the filters.',
  empty: 'More notes are taking shape', emptyHint: 'Research notes and hands-on experiments will appear here.',
  pagination: 'Article pages', prev: 'Previous', next: 'Next',
})

function queryValue(key: string) {
  const value = route.query[key]
  return typeof value === 'string' ? value : ''
}
function updateFilter(key: string, value: string) {
  const query = { ...route.query }
  delete query.page
  if (value) query[key] = value
  else delete query[key]
  router.replace({ path: route.path, query })
}
const search = computed({ get: () => queryValue('q'), set: (value: string) => updateFilter('q', value) })
const category = computed({ get: () => queryValue('category'), set: (value: string) => updateFilter('category', value) })
const tag = computed({ get: () => queryValue('tag'), set: (value: string) => updateFilter('tag', value) })
const hasFilters = computed(() => Boolean(search.value || category.value || tag.value))
const filtered = computed(() => {
  const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean)
  return posts.value.filter(post => {
    if (category.value && post.category !== category.value) return false
    if (tag.value && !post.tags?.includes(tag.value)) return false
    const text = [post.title, post.description || '', (post.tags || []).join(' '), post.category || '', label(post.category || '')].join(' ').toLowerCase()
    return terms.every(term => text.includes(term))
  })
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)))
const page = computed(() => {
  const value = Number(route.query.page)
  return Math.min(totalPages.value, Number.isFinite(value) && value > 0 ? Math.floor(value) : 1)
})
const paged = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))
function clearFilters() { router.replace({ path: url.to('/blog'), query: {} }) }
function pageHref(target: number) {
  const clamped = Math.min(Math.max(1, target), totalPages.value)
  const query = { ...route.query }
  if (clamped === 1) delete query.page
  else query.page = String(clamped)
  return { path: url.to('/blog'), query }
}
function scrollTop() {
  if (import.meta.client) window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
useSeoMeta({
  title: () => copy.value.title + ' · ' + site.title,
  description: () => copy.value.subtitle,
})
</script>
