import { nextTick } from 'vue'

/** Adds accessible clipboard controls to rendered Markdown, including SPA updates. */
const ICON_COPY = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
const ICON_CHECK = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>'
const ICON_ERROR = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 3v1"/></svg>'

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch { /* Older browsers and non-secure previews can use the fallback. */ }

  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.readOnly = true
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.style.pointerEvents = 'none'
  document.body.appendChild(textarea)
  try {
    textarea.select()
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea.remove()
    active?.focus({ preventScroll: true })
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  let observer: MutationObserver | undefined
  let frame = 0
  const timers = new Map<HTMLButtonElement, number>()

  function messages() {
    const i18n = nuxtApp.$i18n as { locale?: string | { value: string } } | undefined
    const locale = typeof i18n?.locale === 'string' ? i18n.locale : i18n?.locale?.value
    return (locale || document.documentElement.lang).startsWith('zh')
      ? { copy: '复制代码', copied: '代码已复制', failed: '未能复制，请手动选择代码复制' }
      : { copy: 'Copy code', copied: 'Code copied', failed: 'Copy failed. Select and copy the code manually.' }
  }

  function decorate() {
    frame = 0
    const root = document.getElementById('article-root')
    if (!root) return
    root.querySelectorAll('pre').forEach(pre => {
      if (pre.dataset.copyReady === '1') return
      pre.dataset.copyReady = '1'
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'code-copy'
      button.setAttribute('aria-label', messages().copy)
      button.title = messages().copy
      button.innerHTML = ICON_COPY
      const status = document.createElement('span')
      status.className = 'sr-only'
      status.setAttribute('role', 'status')
      status.setAttribute('aria-live', 'polite')
      button.appendChild(status)

      button.addEventListener('click', async event => {
        event.preventDefault()
        event.stopPropagation()
        const code = pre.querySelector('code')
        const text = code ? (code.textContent || '') : [...pre.childNodes]
          .filter(node => node !== button).map(node => node.textContent || '').join('')
        const success = await writeClipboard(text.replace(/\n+$/, ''))
        const message = success ? messages().copied : messages().failed
        button.innerHTML = success ? ICON_CHECK : ICON_ERROR
        status.textContent = message
        button.appendChild(status)
        button.title = message
        button.setAttribute('aria-label', message)
        button.classList.toggle('copied', success)
        window.clearTimeout(timers.get(button))
        timers.set(button, window.setTimeout(() => {
          button.innerHTML = ICON_COPY
          status.textContent = ''
          button.appendChild(status)
          button.title = messages().copy
          button.setAttribute('aria-label', messages().copy)
          button.classList.remove('copied')
          timers.delete(button)
        }, 2500))
      })
      pre.appendChild(button)
    })
  }

  function scheduleDecorate() {
    if (!frame) frame = window.requestAnimationFrame(decorate)
  }
  async function attach() {
    await nextTick()
    observer?.disconnect()
    decorate()
    const root = document.getElementById('article-root')
    if (root) {
      observer = new MutationObserver(scheduleDecorate)
      observer.observe(root, { childList: true, subtree: true })
    }
  }
  const removePageHook = nuxtApp.hook('page:finish', attach)
  const removeMountedHook = nuxtApp.hook('app:mounted', attach)

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      removePageHook()
      removeMountedHook()
      observer?.disconnect()
      window.cancelAnimationFrame(frame)
      timers.forEach(timer => window.clearTimeout(timer))
      timers.clear()
    })
  }
})
