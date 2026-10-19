<template>
  <div class="flex min-h-screen flex-col">
    <SiteHeader v-if="!isHomepage" />
    <main id="main-content" class="min-w-0 flex-1" :class="isHomepage ? 'academic-main' : 'pb-20 pt-8'" tabindex="-1">
      <slot />
    </main>
    <SiteFooter />

    <!-- Both overlays teleport to <body>; rendering them client-only avoids a
         Teleport hydration-order mismatch with the prerendered HTML. -->
    <ClientOnly>
      <SearchDialog />
      <ImageLightbox />
    </ClientOnly>
    <BackToTop />
  </div>
</template>

<script setup lang="ts">
const { init } = useTheme()
const { locale } = useI18n()
const { bare } = useLocaleUrl()
const isHomepage = computed(() => bare.value === '/')

// Re-apply the theme on the client (the inline head script already did it
// before paint — this keeps Vue state in sync).
onMounted(init)

// Keep <html lang> in sync with the active locale.
useHead({
  htmlAttrs: {
    lang: computed(() => (locale.value === 'zh' ? 'zh-CN' : 'en-US')),
  },
})
</script>
