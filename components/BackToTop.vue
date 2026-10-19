<template><button v-show="visible" class="back-to-top icon-button fixed bottom-6 right-6 z-30 border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#17221b]" type="button" :aria-label="locale === 'en' ? 'Back to top' : '返回顶部'" @click="toTop"><SiteIcon name="arrow-up" class="h-[18px] w-[18px]" /></button></template>
<script setup lang="ts">
const { locale } = useI18n()
const visible = ref(false)
function update() { visible.value = window.scrollY > 600 }
function toTop() { window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) }
onMounted(() => { update(); window.addEventListener('scroll', update, { passive: true }) })
onBeforeUnmount(() => window.removeEventListener('scroll', update))
</script>
