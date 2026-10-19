/** Strip only the configured deployment prefix, never a similarly named path. */
export function normalizeBase(value = '/') {
  return `/${value.split('/').filter(Boolean).join('/')}${value.split('/').filter(Boolean).length ? '/' : ''}`
}

export function stripBase(pathname, base = '/') {
  const prefix = normalizeBase(base)
  if (prefix === '/') return pathname
  if (pathname === prefix.slice(0, -1)) return '/'
  if (!pathname.startsWith(prefix)) return null
  return `/${pathname.slice(prefix.length)}`
}
