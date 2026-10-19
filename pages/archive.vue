<template>
  <div class="container-page">
    <PageHeader eyebrow="WRITING / ARCHIVE" :title="copy.title" :subtitle="copy.subtitle">
      <div class="flex flex-wrap items-center gap-5 text-sm">
        <NuxtLink :to="url.to('/blog')" class="text-link">← {{ copy.back }}</NuxtLink>
        <span class="text-xs text-slate-500">{{ posts.length }} {{ copy.count }}</span>
      </div>
    </PageHeader>

    <p v-if="status === 'pending'" class="py-12 text-sm text-slate-500" role="status">{{ copy.loading }}</p>
    <div v-else-if="error" class="py-12">
      <p class="text-sm text-slate-500">{{ copy.failed }}</p>
      <button type="button" class="btn-ghost mt-4" @click="refresh()">{{ copy.retry }}</button>
    </div>
    <template v-else-if="groups.length">
      <section v-for="group in groups" :key="group.year" class="mb-14 last:mb-0">
        <h2 class="mb-3 flex items-baseline gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
          <span class="text-2xl font-medium tabular-nums tracking-tight text-slate-900 dark:text-slate-100">{{ group.year }}</span>
          <span class="text-xs font-normal text-slate-500">{{ group.items.length }} {{ copy.count }}</span>
        </h2>
        <ul>
          <li v-for="post in group.items" :key="post.path">
            <NuxtLink :to="url.to(toRoutePath(post.path))" class="group grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-4 py-4 sm:grid-cols-[4rem_minmax(0,1fr)_auto]">
              <time :datetime="post.date" class="text-xs tabular-nums text-slate-500">{{ shortDate(post.date) }}</time>
              <span class="min-w-0 text-sm font-medium leading-7 transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-400">{{ post.title }}</span>
              <span v-if="post.category" class="hidden text-[11px] text-slate-500 sm:block">{{ label(post.category) }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </template>
    <p v-else class="py-12 text-sm leading-7 text-slate-500">{{ copy.empty }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BlogPost } from '~/composables/useContent'
const { locale } = useI18n()
const url = useLocaleUrl()
const { label } = useCategoriesConfig()
const { posts, status, error, refresh } = useBlog()
const site = useAppConfig().site as { title: string }
const copy = computed(() => locale.value === 'zh' ? {
  title: '时间归档', subtitle: '按时间，回看一路记录下来的思考与实验。', back: '全部文章', count: '篇文章',
  loading: '正在读取归档…', failed: '归档暂时未能加载。', retry: '重新加载', empty: '还没有公开文章。新的记录会在整理完成后出现在这里。',
} : {
  title: 'Archive', subtitle: 'A chronological collection of notes, questions and experiments.', back: 'All writing', count: 'articles',
  loading: 'Loading the archive…', failed: 'The archive could not be loaded.', retry: 'Try again', empty: 'No published writing yet. New notes will appear here as they are ready.',
})
const groups = computed(() => {
  const map = new Map<string, BlogPost[]>()
  for (const post of posts.value) {
    const year = (post.date || '').slice(0, 4)
    const list = map.get(year) || []
    list.push(post)
    map.set(year, list)
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([year, items]) => ({ year, items }))
})
function shortDate(date?: string) { return (date || '').slice(5, 10).replace('-', '/') }
useSeoMeta({ title: () => copy.value.title + ' · ' + site.title, description: () => copy.value.subtitle })
</script>
