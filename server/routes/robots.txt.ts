/**
 * robots.txt is generated (instead of a static file) so the `Sitemap:` line can
 * be an absolute URL — which the robots.txt spec requires and which depends on
 * the deployment domain.
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = String((config.public as Record<string, unknown>).siteUrl || '').replace(/\/+$/, '')
  const baseURL = String((config.app as { baseURL?: string }).baseURL || '/').replace(/\/+$/, '')

  // Fall back to the request origin when NUXT_PUBLIC_SITE_URL is not set.
  const origin = siteUrl || `${getRequestURL(event).origin}${baseURL}`

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')

  return `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`
})
