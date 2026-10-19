<template>
  <article class="publication-item" :class="{ 'has-thumbnail': publication.thumbnail }">
    <img
      v-if="publication.thumbnail"
      :src="assetUrl(publication.thumbnail.src)"
      :alt="localize(publication.thumbnail.alt)"
      width="256"
      height="176"
      loading="lazy"
      class="publication-thumbnail"
    >
    <div class="min-w-0">
      <div class="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span class="font-medium text-teal-700 dark:text-teal-400">{{ publication.venue }}</span>
        <span class="text-slate-500 dark:text-slate-400">{{ publication.year }}</span>
        <span class="chip">{{ localize(publicationStatusLabels[publication.status]) }}</span>
        <span v-if="publication.selected" class="selected-label">{{ isEnglish ? 'Selected' : '精选' }}</span>
      </div>
      <h3 class="text-lg font-semibold leading-7 tracking-tight text-slate-950 dark:text-slate-50">
        <a v-if="publication.links?.paper" :href="linkUrl(publication.links.paper)" class="hover:text-teal-700 dark:hover:text-teal-400" target="_blank" rel="noopener noreferrer">
          {{ publication.title }}
        </a>
        <template v-else>{{ publication.title }}</template>
      </h3>
      <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        <template v-for="(author, index) in publication.authors" :key="`${author.name}-${index}`">
          <span v-if="index">, </span>
          <a v-if="author.url" :href="author.url" :class="{ 'font-semibold text-slate-900 dark:text-slate-200': author.isSelf }" class="underline decoration-slate-300 underline-offset-4 hover:text-teal-700 dark:decoration-slate-600 dark:hover:text-teal-400" target="_blank" rel="noopener noreferrer">{{ author.name }}</a>
          <span v-else :class="{ 'font-semibold text-slate-900 dark:text-slate-200': author.isSelf }">{{ author.name }}</span>
        </template>
      </p>
      <p v-if="publication.summary" class="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{{ localize(publication.summary) }}</p>
      <ul v-if="publication.tags.length" class="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400" :aria-label="isEnglish ? 'Topics' : '主题'">
        <li v-for="tag in publication.tags" :key="tag">{{ tag }}</li>
      </ul>
      <div class="mt-4 flex flex-wrap gap-2">
        <a v-for="link in availableLinks" :key="link.label" :href="linkUrl(link.href)" target="_blank" rel="noopener noreferrer" class="publication-link">{{ link.label }} <span aria-hidden="true">↗</span></a>
        <button v-if="publication.bibtex" type="button" class="publication-link" :aria-expanded="showCitation" @click="showCitation = !showCitation">BibTeX <span aria-hidden="true">{{ showCitation ? '−' : '+' }}</span></button>
      </div>
      <div v-if="showCitation && publication.bibtex" class="mt-4 overflow-hidden border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
        <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2 dark:border-slate-700">
          <span class="font-mono text-xs text-slate-500 dark:text-slate-400">BibTeX</span>
          <button type="button" class="text-xs font-medium text-teal-700 hover:underline dark:text-teal-400" @click="copyCitation">{{ copyState === 'copied' ? (isEnglish ? 'Copied' : '已复制') : (isEnglish ? 'Copy citation' : '复制引用') }}</button>
        </div>
        <pre class="overflow-x-auto whitespace-pre p-4 text-xs leading-6 text-slate-700 dark:text-slate-300" tabindex="0" :aria-label="isEnglish ? 'BibTeX citation' : 'BibTeX 引用'"><code>{{ publication.bibtex }}</code></pre>
        <p class="px-4 pb-2 text-xs text-slate-500 dark:text-slate-400" role="status" aria-live="polite">{{ copyMessage }}</p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { publicationStatusLabels, type Publication } from '~/data/publications'
import type { LocalizedText } from '~/data/profile'

const props = defineProps<{ publication: Publication }>()
const { locale } = useI18n()
const { withBase } = useBaseUrl()
const { to } = useLocaleUrl()
const isEnglish = computed(() => locale.value === 'en')
const localize = (value: LocalizedText) => value[isEnglish.value ? 'en' : 'zh']
const assetUrl = (path: string) => /^https?:\/\//i.test(path) ? path : withBase(path)
const linkUrl = (path: string) => /^https?:\/\//i.test(path) ? path : /\.[a-z\d]+(?:[?#]|$)/i.test(path) ? withBase(path) : withBase(to(path))
const showCitation = ref(false)
const copyState = ref<'idle' | 'copied' | 'failed'>('idle')
const copyMessage = computed(() => {
  if (copyState.value === 'copied') return isEnglish.value ? 'Citation copied to clipboard.' : '引用已复制到剪贴板。'
  if (copyState.value === 'failed') return isEnglish.value ? 'Clipboard is unavailable. Select and copy the citation above.' : '暂时无法使用剪贴板，请选中上方引用手动复制。'
  return ''
})

const availableLinks = computed(() => {
  const links = props.publication.links ?? {}
  return [
    { label: 'Paper', href: links.paper },
    { label: 'PDF', href: links.pdf },
    { label: 'Code', href: links.code },
    { label: 'Project', href: links.project },
    { label: 'Dataset', href: links.dataset },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href))
})

async function copyCitation() {
  if (!props.publication.bibtex) return
  try {
    await navigator.clipboard.writeText(props.publication.bibtex)
    copyState.value = 'copied'
  } catch {
    copyState.value = 'failed'
  }
}
</script>

<style scoped>
.publication-item { padding: 2rem 0; }
.publication-item + .publication-item { border-top: 1px solid rgb(148 163 184 / 0.2); }
.publication-item.has-thumbnail { display: grid; grid-template-columns: 11rem minmax(0, 1fr); gap: 1.5rem; }
.publication-thumbnail { width: 100%; aspect-ratio: 16 / 11; object-fit: contain; background: rgb(148 163 184 / 0.08); border: 1px solid rgb(148 163 184 / 0.2); }
.selected-label { border: 1px solid rgb(13 148 136 / 0.25); padding: 0.1rem 0.4rem; color: #0f766e; }
.publication-link { display: inline-flex; align-items: center; gap: 0.5rem; border: 1px solid rgb(148 163 184 / 0.35); padding: 0.3rem 0.6rem; font-size: 0.75rem; line-height: 1.5; transition: border-color 150ms, color 150ms; }
.publication-link:hover { color: #0f766e; border-color: #0d9488; }
.dark .selected-label { color: #5eead4; }
.dark .publication-link:hover { color: #5eead4; }
@media (max-width: 640px) {
  .publication-item.has-thumbnail { grid-template-columns: 1fr; }
  .publication-thumbnail { max-width: 16rem; }
}
</style>
