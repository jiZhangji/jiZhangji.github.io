<template>
  <Teleport to="body">
    <dialog
      ref="dialogRef"
      :aria-label="alt || copy.title"
      class="m-auto max-h-[96dvh] w-[96vw] max-w-[1600px] border-0 bg-transparent p-0 text-white backdrop:bg-slate-950/90"
      @cancel.prevent="close"
      @close="reset"
      @click="close"
    >
      <div v-if="src" class="relative flex min-h-32 flex-col items-center px-4 pb-4 pt-14">
        <button
          ref="closeRef"
          type="button"
          class="absolute right-2 top-1 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          :aria-label="copy.close"
          @click.stop="close"
        >
          <svg class="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
        <img :src="src" :alt="alt" class="max-h-[76dvh] max-w-full object-contain" @click.stop>
        <p v-if="alt" class="mt-4 max-w-3xl text-center text-xs leading-6 text-white/75" @click.stop>{{ alt }}</p>
      </div>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const copy = computed(() => locale.value === 'zh'
  ? { title: '图片预览', close: '关闭图片预览', zoom: '放大图片' }
  : { title: 'Image preview', close: 'Close image preview', zoom: 'Enlarge image' })
const src = ref('')
const alt = ref('')
const dialogRef = ref<HTMLDialogElement | null>(null)
const closeRef = ref<HTMLButtonElement | null>(null)
const nuxtApp = useNuxtApp()
let previousOverflow = ''
let locked = false
let observer: MutationObserver | undefined

function reset() {
  src.value = ''
  alt.value = ''
  if (locked) document.body.style.overflow = previousOverflow
  locked = false
}
function close() {
  dialogRef.value?.close()
  reset()
}

function canZoom(target: unknown): target is HTMLImageElement {
  return target instanceof HTMLImageElement
    && Boolean(target.closest('#article-root'))
    && target.dataset.noZoom !== 'true'
    && !target.closest('a, button')
}

async function show(target: HTMLImageElement) {
  if (document.querySelector('dialog[open]')) return
  src.value = target.currentSrc || target.src
  alt.value = target.alt
  target.focus({ preventScroll: true })
  await nextTick()
  dialogRef.value?.showModal()
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  locked = true
  closeRef.value?.focus()
}

function decorateImages() {
  document.querySelectorAll('#article-root img').forEach(target => {
    if (!canZoom(target)) return
    target.tabIndex = 0
    target.setAttribute('role', 'button')
    target.setAttribute('aria-haspopup', 'dialog')
    target.setAttribute('aria-label', copy.value.zoom + (target.alt ? ': ' + target.alt : ''))
  })
}

function attach() {
  observer?.disconnect()
  decorateImages()
  const root = document.getElementById('article-root')
  if (root) {
    observer = new MutationObserver(decorateImages)
    observer.observe(root, { childList: true, subtree: true })
  }
}

function onDocumentClick(event: MouseEvent) {
  if (!canZoom(event.target) || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
  event.preventDefault()
  show(event.target)
}
function onKeydown(event: KeyboardEvent) {
  if (!canZoom(event.target) || !['Enter', ' '].includes(event.key)) return
  event.preventDefault()
  show(event.target)
}

const removePageHook = nuxtApp.hook('page:finish', () => nextTick(attach))
onMounted(() => {
  attach()
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})
watch(locale, () => { if (import.meta.client) decorateImages() })
onBeforeUnmount(() => {
  removePageHook()
  observer?.disconnect()
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
  close()
})
</script>
