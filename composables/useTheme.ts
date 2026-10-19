export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * Theme handling with `class` strategy on <html>.
 * The initial value is applied by an inline script in nuxt.config (no FOUC).
 */
export function useTheme() {
  const mode = useState<ThemeMode>('theme-mode', () => 'system')
  const isDark = useState<boolean>('theme-dark', () => false)

  const apply = (m: ThemeMode) => {
    if (import.meta.server) return
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = m === 'dark' || (m === 'system' && prefers)
    const el = document.documentElement
    el.classList.toggle('dark', dark)
    el.style.colorScheme = dark ? 'dark' : 'light'
    isDark.value = dark
  }

  const setMode = (m: ThemeMode) => {
    mode.value = m
    try {
      localStorage.setItem('theme', m)
    } catch {
      /* ignore private-mode errors */
    }
    apply(m)
  }

  const cycle = () => {
    const order: ThemeMode[] = ['light', 'dark', 'system']
    setMode(order[(order.indexOf(mode.value) + 1) % order.length]!)
  }

  const init = () => {
    let m: ThemeMode = 'system'
    try {
      m = (localStorage.getItem('theme') as ThemeMode | null) || 'system'
    } catch {
      /* ignore */
    }
    mode.value = m
    apply(m)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', () => {
      if (mode.value === 'system') apply('system')
    })
  }

  return { mode, isDark, setMode, cycle, init }
}
