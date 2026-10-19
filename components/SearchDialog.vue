<template>
  <Teleport to="body">
    <dialog
      ref="dialogRef"
      :aria-labelledby="id + '-title'"
      class="m-auto mt-[10vh] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/50 dark:border-slate-700 dark:bg-[#111a1c] dark:text-slate-100"
      @cancel.prevent="close"
      @close="open = false"
      @click="onBackdrop"
    >
      <div>
        <h2 :id="id + '-title'" class="sr-only">{{ copy.title }}</h2>
        <div class="flex items-center gap-3 border-b border-slate-200 px-4 sm:px-5 dark:border-slate-800">
          <svg class="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" />
          </svg>
          <input
            ref="inputRef"
            v-model="q"
            type="search"
            autocomplete="off"
            autofocus
            :aria-label="copy.placeholder"
            role="combobox"
            aria-autocomplete="list"
            :aria-expanded="open"
            :aria-controls="id + '-results'"
            :aria-activedescendant="results[active] ? id + '-result-' + active : undefined"
            class="h-16 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400 sm:text-sm"
            :placeholder="copy.placeholder"
            @keydown.down.prevent="move(1)"
            @keydown.up.prevent="move(-1)"
            @keydown.enter.prevent="go()"
          >
          <button type="button" class="grid h-9 w-9 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800" :aria-label="copy.close" @click="close">
            <svg class="h-4 w-4" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <div class="max-h-[55dvh] overflow-y-auto overscroll-contain px-2 py-3">
          <p v-if="status === 'pending'" class="px-4 py-10 text-center text-sm text-slate-500" role="status">{{ copy.loading }}</p>
          <div v-else-if="error" class="px-4 py-10 text-center">
            <p class="text-sm text-slate-500">{{ copy.failed }}</p>
            <button type="button" class="text-link mt-4 text-sm" @click="refresh()">{{ copy.retry }}</button>
          </div>
          <template v-else>
            <p v-if="!q.trim() && results.length" class="mb-2 px-3 text-xs text-slate-500">{{ copy.recent }}</p>
            <div :id="id + '-results'" role="listbox" :aria-label="copy.results">
              <button
                v-for="(item, index) in results"
                :id="id + '-result-' + index"
                :key="item.path"
                type="button"
                role="option"
                tabindex="-1"
                :aria-selected="active === index"
                class="block w-full rounded-lg px-3 py-3 text-left transition-colors"
                :class="index === active ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'"
                @mouseenter="active = index"
                @focus="active = index"
                @click="go(item)"
                @keydown.down.prevent="move(1)"
                @keydown.up.prevent="move(-1)"
              >
                <span class="block text-sm font-medium leading-6">{{ item.title }}</span>
                <span v-if="item.description" class="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500 dark:text-slate-400">{{ item.description }}</span>
                <span class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                  <span v-if="item.category">{{ label(item.category) }}</span>
                  <time :datetime="item.date">{{ formatDate(item.date, locale) }}</time>
                </span>
              </button>
            </div>
            <div v-if="!results.length" class="px-4 py-10 text-center" role="status">
              <p class="text-sm font-medium">{{ q.trim() ? copy.noMatch : copy.empty }}</p>
              <p class="mt-2 text-xs leading-6 text-slate-500">{{ q.trim() ? copy.tryAgain : copy.emptyHint }}</p>
            </div>
          </template>
        </div>

        <div class="flex items-center justify-between gap-4 border-t border-slate-200 px-5 py-3 text-[11px] text-slate-500 dark:border-slate-800">
          <span>{{ copy.hint }}</span>
          <span aria-live="polite">{{ matches.length }} {{ copy.results }}</span>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BlogPost } from '~/composables/useContent'

const { locale } = useI18n()
const { label } = useCategoriesConfig()
const { posts, status, error, refresh } = useBlog()
const url = useLocaleUrl()
const router = useRouter()
const id = useId()
const open = useState('search-open', () => false)
const q = ref('')
const active = ref(0)
const dialogRef = ref<HTMLDialogElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const copy = computed(() => locale.value === 'zh' ? {
  title: '搜索文章', placeholder: '搜索标题、摘要、标签或分类…', close: '关闭搜索',
  loading: '正在读取文章…', failed: '暂时无法读取文章。', retry: '重新加载',
  recent: '最近的文章', noMatch: '没有找到匹配的文章', tryAgain: '试试“鹈鹕”、3D 或其他关键词。',
  empty: '这里还没有公开文章', emptyHint: '内容整理完成后，会出现在这里。',
  hint: '↑ ↓ 选择 · Enter 打开 · Esc 关闭', results: '篇结果',
} : {
  title: 'Search articles', placeholder: 'Search titles, summaries, tags or categories…', close: 'Close search',
  loading: 'Loading articles…', failed: 'Articles could not be loaded.', retry: 'Try again',
  recent: 'Recent writing', noMatch: 'No matching articles', tryAgain: 'Try “pelican”, 3D or a different keyword.',
  empty: 'No published articles yet', emptyHint: 'Published notes will appear here.',
  hint: '↑ ↓ Select · Enter Open · Esc Close', results: 'results',
})

const matches = computed(() => {
  const terms = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return posts.value
  return posts.value.map(item => {
    const title = item.title.toLowerCase()
    const description = (item.description || '').toLowerCase()
    const tags = (item.tags || []).join(' ').toLowerCase()
    const category = ((item.category || '') + ' ' + label(item.category || '')).toLowerCase()
    const haystack = [title, description, tags, category].join(' ')
    if (!terms.every(term => haystack.includes(term))) return { item, score: 0 }
    const score = terms.reduce((total, term) => total + (title.includes(term) ? 6 : 0)
      + (tags.includes(term) ? 3 : 0) + (description.includes(term) ? 2 : 0) + 1, 0)
    return { item, score }
  }).filter(result => result.score > 0).sort((a, b) => b.score - a.score).map(result => result.item)
})
const results = computed(() => matches.value.slice(0, q.value.trim() ? 12 : 8))
watch([q, locale, posts], () => { active.value = 0 })

function move(delta: number) {
  if (!results.value.length) return
  active.value = (active.value + delta + results.value.length) % results.value.length
  inputRef.value?.focus({ preventScroll: true })
  nextTick(() => document.getElementById(id + '-result-' + active.value)?.scrollIntoView({ block: 'nearest' }))
}

function go(item?: BlogPost) {
  const target = item || results.value[active.value]
  if (!target) return
  close()
  router.push(url.to(toRoutePath(target.path)))
}

function close() { open.value = false }
function onBackdrop(event: MouseEvent) {
  if (event.target === dialogRef.value) close()
}

let previousOverflow = ''
let locked = false
function unlock() {
  if (locked) document.body.style.overflow = previousOverflow
  locked = false
}

watch(open, async (value) => {
  if (!import.meta.client) return
  await nextTick()
  const dialog = dialogRef.value
  if (!dialog) return
  if (value && open.value) {
    if (!dialog.open) dialog.showModal()
    if (!locked) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      locked = true
    }
    inputRef.value?.focus()
  } else {
    dialog.close()
    unlock()
    q.value = ''
    active.value = 0
  }
})

function onKeydown(event: KeyboardEvent) {
  if (event.isComposing || event.repeat) return
  const target = event.target as HTMLElement | null
  const editable = target?.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]')
  const shortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'
  const slash = event.key === '/' && !editable && !event.ctrlKey && !event.metaKey && !event.altKey
  if ((shortcut || slash) && (open.value || !document.querySelector('dialog[open]'))) {
    event.preventDefault()
    open.value = shortcut ? !open.value : true
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  dialogRef.value?.close()
  unlock()
})
defineExpose({ toggle: () => { open.value = !open.value } })
</script>
