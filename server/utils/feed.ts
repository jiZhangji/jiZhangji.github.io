import { queryCollection } from '@nuxt/content/server'
import { profile } from '../../data/profile'
import { projects } from '../../data/projects'
import { guideChapters, guideMeta } from '../../data/guide'

/**
 * Server-side helpers for the RSS feeds and the sitemap.
 * Self-contained (no shared/app auto-imports) so Nitro never depends on
 * client-side code.
 */

const LOCALES = ['zh', 'en'] as const
const DEFAULT_LOCALE = 'zh'

export interface ContentRow {
  path: string
  title?: string
  description?: string
  date?: string
  updated?: string
  category?: string
  tags?: string[]
  draft?: boolean
}

export function escapeXml(value = ''): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** `2026-09-08 12:46` → RFC-822 for RSS. */
export function toRfc822(input?: string): string {
  if (!input) return new Date().toUTCString()
  const m = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/)
  if (!m) return new Date(input).toUTCString()
  const [, y, mo, d, hh, mm] = m
  // Content dates are authored in Asia/Shanghai (UTC+8).
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(hh ?? 9) - 8, Number(mm ?? 0))).toUTCString()
}

/** Content path → public route path (keeps or drops the locale prefix). */
export function routePath(contentPath: string, locale: string): string {
  const stripped = contentPath.replace(/^\/(zh|en)(?=\/|$)/, '')
  const clean = stripped === '' ? '/' : stripped.startsWith('/') ? stripped : `/${stripped}`
  if (locale === DEFAULT_LOCALE) return clean
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`
}

export function siteBase(event: any): string {
  const config = useRuntimeConfig(event)
  return String((config.public as Record<string, unknown>).siteUrl || '').replace(/\/+$/, '')
}

/**
 * Site title used by the feeds. Kept in the server bundle (not app.config, which
 * is client-oriented) — change it here and in `app.config.ts` together.
 */
export function siteTitle(_event?: any): string {
  return `${profile.name} · Research & Notes`
}

export async function fetchPosts(event: any, locale: string): Promise<ContentRow[]> {
  const rows = (await queryCollection(event, 'content')
    .where('draft', '=', false)
    .where('path', 'LIKE', `/${locale}/blog/%`)
    .all()) as unknown as ContentRow[]
  return rows.filter((r) => !!r.date && !r.draft).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export async function allContent(event: any): Promise<ContentRow[]> {
  return (await queryCollection(event, 'content').where('draft', '=', false).all()) as unknown as ContentRow[]
}

export async function buildRss(event: any, locale: string): Promise<string> {
  const base = siteBase(event)
  const posts = await fetchPosts(event, locale)

  const home = `${base}${locale === DEFAULT_LOCALE ? '' : `/${locale}`}`
  const self = `${base}${locale === DEFAULT_LOCALE ? '' : `/${locale}`}/feed.xml`
  const title = siteTitle(event)
  const description = locale === 'zh'
    ? '研究与笔记 · 计算机视觉、遥感与技术实践'
    : 'Research & Notes · Computer vision, remote sensing, and technical practice'
  const lastBuild = posts[0]?.date ? toRfc822(posts[0].date) : new Date().toUTCString()

  const items = posts
    .map((post) => {
      const url = `${base}${routePath(post.path, locale)}`
      const tags = (post.tags || []).map((t) => `      <category>${escapeXml(t)}</category>`).join('\n')
      return [
        '    <item>',
        `      <title>${escapeXml(post.title || post.path)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escapeXml(post.description || '')}</description>`,
        `      <pubDate>${toRfc822(post.date)}</pubDate>`,
        tags,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${home}</link>
    <description>${escapeXml(description)}</description>
    <language>${locale === 'zh' ? 'zh-CN' : 'en-US'}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`
}

export async function buildSitemap(event: any): Promise<string> {
  const base = siteBase(event)
  const urls: string[] = []

  const staticPaths = ['/', '/research', '/publications', '/projects', '/lab', '/contact', '/cv', '/blog', '/categories', '/tags', '/archive', '/about', '/links', ...projects.map(project => `/projects/${project.slug}`)]

  // The guide is Chinese-only: publish its hub + chapters once under the default
  // (zh) locale, and keep it out of the per-locale loops below.
  urls.push(`  <url><loc>${escapeXml(base + '/guide')}</loc><lastmod>${guideMeta.syncedDate}</lastmod><changefreq>weekly</changefreq></url>`)
  for (const chapter of guideChapters) {
    urls.push(`  <url><loc>${escapeXml(`${base}/guide/${chapter.slug}`)}</loc><lastmod>${guideMeta.syncedDate}</lastmod><changefreq>weekly</changefreq></url>`)
  }

  for (const locale of LOCALES) {
    for (const p of staticPaths) {
      const clean = p === '/' ? '/' : p
      const route = locale === DEFAULT_LOCALE ? clean : clean === '/' ? `/${locale}` : `/${locale}${clean}`
      urls.push(`  <url><loc>${escapeXml(base + route)}</loc><changefreq>weekly</changefreq></url>`)
    }

    const posts = await fetchPosts(event, locale)
    const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))] as string[]
    const tags = [...new Set(posts.flatMap((p) => p.tags || []))]

    const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`

    for (const c of categories) {
      urls.push(`  <url><loc>${escapeXml(`${base}${prefix}/categories/${c}`)}</loc><changefreq>weekly</changefreq></url>`)
    }
    for (const t of tags) {
      urls.push(
        `  <url><loc>${escapeXml(`${base}${prefix}/tags/${encodeURIComponent(t)}`)}</loc><changefreq>weekly</changefreq></url>`,
      )
    }
    for (const post of posts) {
      const lastmod = (post.updated || post.date || '').slice(0, 10)
      urls.push(
        `  <url><loc>${escapeXml(base + routePath(post.path, locale))}</loc>` +
          (lastmod ? `<lastmod>${lastmod}</lastmod>` : '') +
          `<changefreq>monthly</changefreq></url>`,
      )
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
}
