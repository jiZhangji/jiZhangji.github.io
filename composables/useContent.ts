import type { MarkdownRoot } from '@nuxt/content'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Ref } from 'vue'

export interface BlogPost {
  path: string
  title: string
  description?: string
  date?: string
  updated?: string
  category?: string
  tags?: string[]
  author?: string
  cover?: string
  draft?: boolean
  body?: MarkdownRoot
  navigation?: unknown
}

export interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

export interface CategoryInfo {
  slug: string
  count: number
}

export interface TagInfo {
  name: string
  count: number
}

/** Never send unpublished documents to a public page's Nuxt payload. */
export function useAllContent() {
  return useAsyncData<BlogPost[]>(
    'content-published',
    async () => {
      const rows = await queryCollection('content').where('draft', '=', false).all()
      return (rows as unknown as BlogPost[]) ?? []
    },
    { default: () => [] },
  )
}

/** Supports Content v3's minimark tuples and older Markdown ASTs. */
export function countContentWords(node: unknown): number {
  if (typeof node === 'string') {
    const cjk = node.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu) || []
    const other = node
      .replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu, ' ')
      .match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || []
    return cjk.length + other.length
  }
  if (Array.isArray(node)) {
    // ['p', { class: '...' }, 'Text', ['strong', {}, 'more text']]
    // Only the children are prose; tag names and attributes are not words.
    const tuple = typeof node[0] === 'string' && node[1] !== null
      && typeof node[1] === 'object' && !Array.isArray(node[1])
    if (tuple && ['script', 'style'].includes(node[0])) return 0
    const children = tuple ? node.slice(2) : node
    return children.reduce<number>((sum, child) => sum + countContentWords(child), 0)
  }
  if (!node || typeof node !== 'object') return 0
  const n = node as { type?: string; value?: unknown; children?: unknown[] }
  if (n.type === 'minimark' || n.type === 'minimal') return countContentWords(n.value)
  if (Array.isArray(n.children)) {
    return n.children.reduce<number>((sum, child) => sum + countContentWords(child), 0)
  }
  return typeof n.value === 'string' ? countContentWords(n.value) : 0
}

export function readingMinutes(post: BlogPost): number {
  return Math.max(1, Math.ceil(countContentWords(post.body) / 300))
}

const LOCALE_PREFIX = /^\/(zh|en)(?=\/|$)/

/** Strip the locale segment from a content path → a route path usable with localePath(). */
export function toRoutePath(contentPath: string): string {
  const p = contentPath.replace(LOCALE_PREFIX, '')
  return p.startsWith('/') ? p : `/${p}`
}

export function useBlog() {
  const { locale } = useI18n()
  const { data: all, status, error, refresh } = useAllContent()

  const isPostPath = (p?: string) => !!p && p.includes('/blog/')

  /** All published posts for the active locale, newest first. */
  const posts = computed<BlogPost[]>(() => {
    const l = locale.value
    return (all.value || [])
      .filter((p) => p.path?.startsWith(`/${l}/blog/`) && p.date && p.draft !== true)
      .sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.path.localeCompare(b.path))
  })

  const categories = computed<CategoryInfo[]>(() => {
    const map = new Map<string, number>()
    for (const p of posts.value) {
      if (!p.category) continue
      map.set(p.category, (map.get(p.category) || 0) + 1)
    }
    return [...map.entries()]
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug))
  })

  const tags = computed<TagInfo[]>(() => {
    const map = new Map<string, number>()
    for (const p of posts.value) {
      for (const t of new Set(p.tags || [])) map.set(t, (map.get(t) || 0) + 1)
    }
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  })

  const postsByCategory = (slug: string) => posts.value.filter((p) => p.category === slug)
  const postsByTag = (name: string) => posts.value.filter((p) => (p.tags || []).includes(name))

  /** Previous / next post within the locale, based on the sorted list. */
  function surround(path: string) {
    const list = posts.value
    const i = list.findIndex((p) => p.path === path)
    if (i === -1) return { prev: null as BlogPost | null, next: null as BlogPost | null }
    return {
      prev: i > 0 ? list[i - 1]! : null,
      next: i < list.length - 1 ? list[i + 1]! : null,
    }
  }

  return {
    posts,
    categories,
    tags,
    postsByCategory,
    postsByTag,
    surround,
    isPostPath,
    status,
    error,
    refresh,
  }
}

/** Categories declared in app.config, with translated labels. */
export function useCategoriesConfig() {
  const { t, locale } = useI18n()
  const app = useAppConfig()
  const list = (app.categories as { slug: string; name: Record<string, string> }[]) || []
  const label = (slug: string) => {
    const found = list.find((c) => c.slug === slug)
    return found ? found.name[locale.value] || found.name.zh || slug : slug
  }
  return { list, label, t }
}

/** Shared, query-based pagination for category and tag views. */
export function usePostPagination(items: Readonly<Ref<BlogPost[]>>, perPage = 8) {
  const route = useRoute()
  const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / perPage)))
  const page = computed(() => {
    const value = Number(route.query.page)
    return Math.min(totalPages.value, Number.isFinite(value) && value > 0 ? Math.floor(value) : 1)
  })
  const paged = computed(() => items.value.slice((page.value - 1) * perPage, page.value * perPage))
  function pageHref(target: number) {
    const clamped = Math.min(Math.max(1, target), totalPages.value)
    const query = { ...route.query }
    if (clamped === 1) delete query.page
    else query.page = String(clamped)
    return { path: route.path, query }
  }
  function scrollTop() {
    if (import.meta.client) {
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    }
  }
  return { page, totalPages, paged, pageHref, scrollTop }
}
