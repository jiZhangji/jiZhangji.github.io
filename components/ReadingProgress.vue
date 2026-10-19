<template>
  <div class="pointer-events-none fixed inset-x-0 top-0 z-[80] h-0.5" aria-hidden="true">
    <div class="h-full origin-left bg-brand-600 dark:bg-brand-400" :style="{ transform: 'scaleX(' + progress / 100 + ')' }" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
const props = withDefaults(defineProps<{ target?: string }>(), { target: '#article-root' })
const progress = ref(0)
let frame = 0
let observer: ResizeObserver | undefined

function update() {
  frame = 0
  const article = document.querySelector(props.target)
  if (!article) {
    progress.value = 0
    return
  }
  const rect = article.getBoundingClientRect()
  const start = Math.max(0, window.scrollY + rect.top - 128)
  const end = Math.max(start + 1, window.scrollY + rect.bottom - window.innerHeight + 96)
  progress.value = Math.min(100, Math.max(0, ((window.scrollY - start) / (end - start)) * 100))
}

function scheduleUpdate() {
  if (!frame) frame = window.requestAnimationFrame(update)
}

onMounted(async () => {
  await nextTick()
  update()
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate)
  const article = document.querySelector(props.target)
  if (article && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(scheduleUpdate)
    observer.observe(article)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleUpdate)
  window.removeEventListener('resize', scheduleUpdate)
  window.cancelAnimationFrame(frame)
  observer?.disconnect()
})
</script>
