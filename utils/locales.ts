/**
 * Locale definitions — kept in sync with the `i18n` block in `nuxt.config.ts`.
 * Routing helpers are implemented here explicitly (instead of relying on module
 * auto-imports) so the URLs stay predictable: default locale has no prefix.
 */
export const DEFAULT_LOCALE = 'zh'
export const LOCALE_CODES = ['zh', 'en'] as const
export type LocaleCode = (typeof LOCALE_CODES)[number]

export const LOCALE_OPTIONS: { code: LocaleCode; name: string; htmlLang: string }[] = [
  { code: 'zh', name: '中文', htmlLang: 'zh-CN' },
  { code: 'en', name: 'English', htmlLang: 'en-US' },
]

/** `/blog/x` + `en` → `/en/blog/x` (and unchanged for the default locale). */
export function withLocale(path: string, locale: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (locale === DEFAULT_LOCALE) return clean
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`
}

/** `/en/blog/x` → `/blog/x` */
export function stripLocale(path: string): string {
  const m = path.match(/^\/([a-zA-Z-]{2,5})(?=\/|$)/)
  if (m && (LOCALE_CODES as readonly string[]).includes(m[1]!)) {
    const rest = path.slice(m[0].length)
    return rest === '' ? '/' : rest
  }
  return path
}

export function isLocale(value: string): value is LocaleCode {
  return (LOCALE_CODES as readonly string[]).includes(value)
}
