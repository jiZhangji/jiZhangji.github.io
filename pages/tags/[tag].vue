<template>
  <div class="container-page">
    <PageHeader eyebrow="WRITING / TAG" :title="'# ' + name" :subtitle="list.length + ' ' + copy.count">
      <NuxtLink :to="url.to('/tags')" class="text-link text-sm">← {{ copy.back }}</NuxtLink>
    </PageHeader>
    <p v-if="status === 'pending'" class="py-12 text-sm text-slate-500" role="status">{{ copy.loading }}</p>
    <div v-else-if="error" class="py-12">
      <p class="text-sm text-slate-500">{{ copy.failed }}</p>
      <button type="button" class="btn-ghost mt-4" @click="refresh()">{{ copy.retry }}</button>
    </div>
    <div v-else-if="paged.length" class="border-t border-slate-200 dark:border-slate-800">
      <PostCard v-for="post in paged" :key="post.path" :post="post" />
    </div>
    <div v-else class="border-t border-slate-200 py-12 dark:border-slate-800">
      <h2 class="text-base font-medium">{{ copy.empty }}</h2>
      <p class="mt-3 text-sm text-slate-500">{{ copy.emptyHint }}</p>
      <NuxtLink :to="url.to('/blog')" class="btn-ghost mt-5">{{ copy.all }}</NuxtLink>
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
import { usePostPagination } from '~/composables/useContent'
const route = useRoute()
const { locale } = useI18n()
const url = useLocaleUrl()
const { postsByTag, status, error, refresh } = useBlog()
const site = useAppConfig().site as { title: string }
const name = computed(() => String(route.params.tag || ''))
const list = computed(() => postsByTag(name.value))
const { page, totalPages, paged, pageHref, scrollTop } = usePostPagination(list)
const copy = computed(() => locale.value === 'zh' ? {
  back: '关键词索引', count: '篇文章', loading: '正在读取文章…', failed: '文章暂时未能加载。', retry: '重新加载',
  empty: '这个主题暂时还没有公开文章', emptyHint: '可以回到全部文章，看看最近的实验与技术笔记。', all: '浏览全部文章',
  pagination: '文章分页', prev: '上一页', next: '下一页',
} : {
  back: 'All tags', count: 'articles', loading: 'Loading articles…', failed: 'Articles could not be loaded.', retry: 'Try again',
  empty: 'No published articles on this topic yet', emptyHint: 'Browse all writing for recent experiments and technical notes.', all: 'Browse all writing',
  pagination: 'Article pages', prev: 'Previous', next: 'Next',
})
useSeoMeta({
  title: () => '# ' + name.value + ' · ' + site.title,
  description: () => name.value + ' · ' + list.value.length + ' ' + copy.value.count,
})
</script>
