<template>
  <div class="container-page">
    <PageHeader eyebrow="WRITING / CATEGORIES" :title="copy.title" :subtitle="copy.subtitle">
      <NuxtLink :to="url.to('/blog')" class="text-link text-sm">← {{ copy.back }}</NuxtLink>
    </PageHeader>
    <p v-if="status === 'pending'" class="py-12 text-sm text-slate-500" role="status">{{ copy.loading }}</p>
    <div v-else-if="error" class="py-12">
      <p class="text-sm text-slate-500">{{ copy.failed }}</p>
      <button type="button" class="btn-ghost mt-4" @click="refresh()">{{ copy.retry }}</button>
    </div>
    <div v-else-if="categories.length" class="border-t border-slate-200 dark:border-slate-800">
      <NuxtLink v-for="item in categories" :key="item.slug" :to="url.to('/categories/' + encodeURIComponent(item.slug))" class="group flex items-center justify-between gap-5 border-b border-slate-200 py-7 dark:border-slate-800">
        <span class="text-lg font-medium tracking-tight transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-400">{{ label(item.slug) }}</span>
        <span class="flex items-center gap-5 text-xs text-slate-500">{{ item.count }} {{ copy.count }} <span aria-hidden="true" class="text-lg">↗</span></span>
      </NuxtLink>
    </div>
    <p v-else class="py-12 text-sm leading-7 text-slate-500">{{ copy.empty }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const url = useLocaleUrl()
const { categories, status, error, refresh } = useBlog()
const { label } = useCategoriesConfig()
const site = useAppConfig().site as { title: string }
const copy = computed(() => locale.value === 'zh' ? {
  title: '文章分类', subtitle: '按主题浏览，找到感兴趣的问题。', back: '全部文章', count: '篇文章',
  loading: '正在读取分类…', failed: '分类暂时未能加载。', retry: '重新加载', empty: '暂无公开分类。文章发布后会自动归入对应的主题。',
} : {
  title: 'Categories', subtitle: 'Follow a topic. Find a question worth exploring.', back: 'All writing', count: 'articles',
  loading: 'Loading categories…', failed: 'Categories could not be loaded.', retry: 'Try again', empty: 'No categories yet. They will appear automatically as articles are published.',
})
useSeoMeta({ title: () => copy.value.title + ' · ' + site.title, description: () => copy.value.subtitle })
</script>
