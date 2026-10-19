<template>
  <div class="container-page">
    <PageHeader eyebrow="WRITING / TAGS" :title="copy.title" :subtitle="copy.subtitle">
      <NuxtLink :to="url.to('/blog')" class="text-link text-sm">← {{ copy.back }}</NuxtLink>
    </PageHeader>
    <p v-if="status === 'pending'" class="py-12 text-sm text-slate-500" role="status">{{ copy.loading }}</p>
    <div v-else-if="error" class="py-12">
      <p class="text-sm text-slate-500">{{ copy.failed }}</p>
      <button type="button" class="btn-ghost mt-4" @click="refresh()">{{ copy.retry }}</button>
    </div>
    <template v-else-if="tags.length">
      <input v-model="query" type="search" :placeholder="copy.search" :aria-label="copy.search" class="mb-7 h-11 w-full rounded-lg border border-slate-200 bg-transparent px-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 dark:border-slate-700">
      <div class="flex flex-wrap gap-3">
        <NuxtLink v-for="item in filtered" :key="item.name" :to="url.to('/tags/' + encodeURIComponent(item.name))" class="chip !gap-3 !px-3 !py-2 !text-sm">
          <span>{{ item.name }}</span><span class="text-xs tabular-nums text-slate-500">{{ item.count }}</span>
        </NuxtLink>
      </div>
      <p v-if="!filtered.length" class="py-8 text-sm text-slate-500" role="status">{{ copy.noMatch }}</p>
    </template>
    <p v-else class="py-12 text-sm leading-7 text-slate-500">{{ copy.empty }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const url = useLocaleUrl()
const { tags, status, error, refresh } = useBlog()
const site = useAppConfig().site as { title: string }
const query = ref('')
const filtered = computed(() => tags.value.filter(item => item.name.toLowerCase().includes(query.value.trim().toLowerCase())))
const copy = computed(() => locale.value === 'zh' ? {
  title: '关键词索引', subtitle: '以关键词为线索，在研究、代码与实验之间自由探索。', back: '全部文章',
  search: '查找标签…', noMatch: '没有匹配的标签，试试其他关键词。',
  loading: '正在读取标签…', failed: '标签暂时未能加载。', retry: '重新加载', empty: '暂无标签。已公开文章中的关键词会自动汇集在这里。',
} : {
  title: 'Tags', subtitle: 'Explore the connections between research, code and experiments.', back: 'All writing',
  search: 'Find a tag…', noMatch: 'No matching tags. Try a different keyword.',
  loading: 'Loading tags…', failed: 'Tags could not be loaded.', retry: 'Try again', empty: 'No tags yet. Keywords from published articles will appear here.',
})
useSeoMeta({ title: () => copy.value.title + ' · ' + site.title, description: () => copy.value.subtitle })
</script>
