<template>
  <div v-if="post" class="container-wide">
    <ReadingProgress />
    <div class="grid items-start gap-12 lg:grid-cols-[minmax(0,768px)_minmax(0,1fr)] lg:gap-12">
      <article class="mx-auto min-w-0 w-full max-w-[768px]">
        <NuxtLink :to="url.to('/blog')" class="text-link mb-8 inline-flex items-center gap-2 text-sm">← {{ copy.back }}</NuxtLink>

        <header class="mb-9 border-b border-slate-200 pb-8 sm:mb-12 sm:pb-10 dark:border-slate-800">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
            <NuxtLink v-if="post.category" :to="url.to('/categories/' + encodeURIComponent(post.category))" class="font-medium text-brand-700 hover:underline dark:text-brand-400">{{ label(post.category) }}</NuxtLink>
            <span v-if="post.category" aria-hidden="true">/</span>
            <time :datetime="post.date">{{ formatDate(post.date, locale) }}</time>
          </div>
          <h1 class="mt-5 break-words text-[1.85rem] font-semibold leading-[1.35] tracking-tight text-slate-950 sm:text-[2.6rem] dark:text-slate-100">{{ post.title }}</h1>
          <p v-if="post.description" class="mt-5 text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-400">{{ post.description }}</p>
          <div class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
            <span v-if="post.author || site.author">{{ post.author || site.author }}</span>
            <span>{{ copy.about }} {{ readingMinutes(post) }} {{ copy.minutes }}</span>
            <span v-if="post.updated && post.updated !== post.date">{{ copy.updated }} <time :datetime="post.updated">{{ formatDate(post.updated, locale) }}</time></span>
          </div>
          <div v-if="post.tags?.length" class="mt-5 flex flex-wrap gap-2">
            <NuxtLink v-for="tag in post.tags" :key="tag" :to="url.to('/tags/' + encodeURIComponent(tag))" class="chip">{{ tag }}</NuxtLink>
          </div>
        </header>

        <details v-if="tocLinks.length" ref="mobileToc" class="group mb-8 border-y border-slate-200 py-4 lg:hidden dark:border-slate-800">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
            {{ copy.toc }}
            <svg class="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m6 9 6 6 6-6" /></svg>
          </summary>
          <PageToc class="mt-4" :links="tocLinks" :title="copy.toc" :show-title="false" @navigate="closeMobileToc" />
        </details>

        <div id="article-root" class="min-w-0">
          <img v-if="coverUrl" :src="coverUrl" :alt="post.title" class="mb-10 max-h-[30rem] w-full rounded-lg object-cover" fetchpriority="high">
          <ContentRenderer :value="post" class="article-body" />
        </div>

        <footer class="mt-12 border-t border-slate-200 pt-6 sm:mt-16 dark:border-slate-800">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <NuxtLink :to="url.to('/blog')" class="text-link text-sm">← {{ copy.back }}</NuxtLink>
            <button type="button" class="btn-ghost" @click="copyLink">
              <svg class="h-4 w-4" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 1 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 1)" /></svg>
              {{ copied ? copy.copied : copy.share }}
            </button>
          </div>
          <span class="sr-only" role="status">{{ copied ? copy.copied : '' }}</span>
          <div v-if="manualCopy" class="mt-4">
            <label for="share-url" class="mb-2 block text-xs text-slate-500">{{ copy.manual }}</label>
            <input id="share-url" ref="shareInput" :value="shareUrl" readonly class="w-full rounded-md border border-slate-200 bg-transparent p-3 text-xs dark:border-slate-700" @focus="shareInput?.select()">
          </div>
        </footer>

        <nav v-if="prev || next" class="mt-9 grid gap-8 border-t border-slate-200 pt-8 sm:grid-cols-2 dark:border-slate-800" :aria-label="copy.more">
          <NuxtLink v-if="prev" :to="url.to(toRoutePath(prev.path))" class="group min-w-0">
            <span class="text-xs text-slate-500">← {{ copy.newer }}</span>
            <p class="mt-2 text-sm font-medium leading-7 transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-400">{{ prev.title }}</p>
          </NuxtLink>
          <NuxtLink v-if="next" :to="url.to(toRoutePath(next.path))" class="group min-w-0 sm:col-start-2 sm:text-right">
            <span class="text-xs text-slate-500">{{ copy.older }} →</span>
            <p class="mt-2 text-sm font-medium leading-7 transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-400">{{ next.title }}</p>
          </NuxtLink>
        </nav>
      </article>

      <aside class="hidden min-w-0 lg:block">
        <div class="sticky top-28 max-h-[calc(100dvh-9rem)] overflow-y-auto pr-1">
          <PageToc :links="tocLinks" :title="copy.toc" />
          <a href="#" class="text-link mt-8 inline-block text-xs" @click.prevent="backToTop">{{ copy.top }} ↑</a>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BlogPost } from '~/composables/useContent'

definePageMeta({ key: route => route.path })
const route = useRoute()
const { locale } = useI18n()
const url = useLocaleUrl()
const { withBase } = useBaseUrl()
const { label } = useCategoriesConfig()
const { surround } = useBlog()
const runtime = useRuntimeConfig()
const site = useAppConfig().site as { title: string; author?: string }
const mobileToc = ref<HTMLDetailsElement | null>(null)
const path = computed(() => '/' + locale.value + '/blog/' + route.params.category + '/' + route.params.slug)

const { data: post, error } = await useAsyncData<BlogPost | null>(
  () => 'post:' + path.value,
  () => queryCollection('content').where('draft', '=', false).path(path.value).first() as Promise<BlogPost | null>,
)
if (error.value) throw createError({ statusCode: 500, statusMessage: 'Article could not be loaded', fatal: true })
if (!post.value) throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })

const copy = computed(() => locale.value === 'zh' ? {
  back: '全部文章', about: '约', minutes: '分钟阅读', updated: '更新于', toc: '本文目录',
  share: '复制分享链接', copied: '链接已复制', manual: '浏览器未开放剪贴板，请复制以下链接：',
  more: '继续阅读', newer: '上一篇 · 较新', older: '下一篇 · 较早', top: '返回顶部',
} : {
  back: 'All writing', about: 'About', minutes: 'min read', updated: 'Updated', toc: 'On this page',
  share: 'Copy article link', copied: 'Link copied', manual: 'Clipboard is unavailable. Copy this link:',
  more: 'Continue reading', newer: 'Previous · Newer', older: 'Next · Older', top: 'Back to top',
})
const tocLinks = computed(() => post.value?.body?.toc?.links || [])
const surroundings = computed(() => surround(post.value?.path || ''))
const prev = computed(() => surroundings.value.prev)
const next = computed(() => surroundings.value.next)
const coverUrl = computed(() => {
  const cover = post.value?.cover
  if (!cover) return ''
  return /^https?:\/\//.test(cover) ? cover : withBase(cover)
})
const canonical = computed(() => String(runtime.public.siteUrl || '').replace(/\/+$/, '') + url.to(toRoutePath(post.value?.path || path.value)))

function closeMobileToc() { if (mobileToc.value) mobileToc.value.open = false }
function backToTop() {
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
const copied = ref(false)
const manualCopy = ref(false)
const shareUrl = ref('')
const shareInput = ref<HTMLInputElement | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | undefined
async function copyLink() {
  shareUrl.value = window.location.origin + window.location.pathname
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    manualCopy.value = false
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => { copied.value = false }, 2500)
  } catch {
    manualCopy.value = true
    await nextTick()
    shareInput.value?.focus()
    shareInput.value?.select()
  }
}
onBeforeUnmount(() => clearTimeout(copyTimer))

useSeoMeta({
  title: () => (post.value?.title || copy.value.back) + ' · ' + site.title,
  description: () => post.value?.description || '',
  ogTitle: () => post.value?.title || site.title,
  ogDescription: () => post.value?.description || '',
  ogType: 'article',
  ogUrl: () => canonical.value,
  ogImage: () => coverUrl.value ? new URL(coverUrl.value, String(runtime.public.siteUrl)).href : undefined,
  twitterCard: () => coverUrl.value ? 'summary_large_image' : 'summary',
  articlePublishedTime: () => post.value?.date,
  articleModifiedTime: () => post.value?.updated || post.value?.date,
  articleAuthor: () => {
    const author = post.value?.author || site.author
    return author ? [author] : []
  },
  articleTag: () => post.value?.tags || [],
})
useHead(() => ({ link: [{ rel: 'canonical', href: canonical.value }] }))
</script>
