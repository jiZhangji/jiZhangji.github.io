/**
 * Locale-aware URL helpers. Thin wrapper over utils/locales.ts so components can
 * just call `url.to('/blog')` / `url.switch('en')`.
 */
export function useLocaleUrl() {
  const { locale } = useI18n()
  const route = useRoute()

  /** Build a URL for the current locale. */
  const to = (path: string): string => withLocale(path, locale.value)

  /** The current page's path without any locale prefix. */
  const bare = computed(() => stripLocale(route.path))

  /** Same page, different locale. */
  const switchTo = (target: string): string => withLocale(bare.value, target)

  return { to, bare, switchTo, locale }
}
