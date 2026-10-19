/**
 * `app.baseURL` is applied automatically to Nuxt *routes*, but NOT to real files
 * served from `public/` (e.g. `/feed.xml`, `/sitemap.xml`, `/search.json`).
 *
 * Under GitHub Pages the site lives at `/<repo>/`, so a plain `/feed.xml` would
 * hit the domain root and 404. Always route those through `withBase()`.
 */
export function useBaseUrl() {
  const runtime = useRuntimeConfig()

  const base = computed(() => String(runtime.app.baseURL || '/').replace(/\/+$/, ''))

  /** `withBase('/feed.xml')` → `/my-repo/feed.xml` (or `/feed.xml` at the root). */
  function withBase(path: string): string {
    const clean = path.startsWith('/') ? path : `/${path}`
    return `${base.value}${clean}`
  }

  return { base, withBase }
}
