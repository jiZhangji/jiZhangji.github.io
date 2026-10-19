/** Locale-aware date formatting. Accepts `YYYY-MM-DD` or `YYYY-MM-DD HH:mm`. */
export function formatDate(input?: string, locale = 'zh'): string {
  if (!input) return ''
  const m = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/)
  if (!m) return input

  const [, y, mo, d, hh, mm] = m
  const date = new Date(Number(y), Number(mo) - 1, Number(d), Number(hh ?? 0), Number(mm ?? 0))
  if (Number.isNaN(date.getTime())) return input

  const dateStr = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: locale === 'zh' ? 'long' : 'long',
    day: 'numeric',
  }).format(date)

  if (hh === undefined) return dateStr

  const timeStr = `${hh}:${mm}`
  return locale === 'zh' ? `${dateStr} ${timeStr}` : `${dateStr} ${timeStr}`
}

/** RFC-822 date for RSS feeds. */
export function toRfc822(input?: string): string {
  if (!input) return new Date().toUTCString()
  const m = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/)
  if (!m) return new Date(input).toUTCString()
  const [, y, mo, d, hh, mm] = m
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(hh ?? 9), Number(mm ?? 0))).toUTCString()
}

/** First N characters of a string, safe for CJK. */
export function truncate(s: string, n = 160): string {
  return s.length > n ? `${s.slice(0, n)}…` : s
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
