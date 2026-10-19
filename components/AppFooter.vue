<template>
  <footer class="mt-auto border-t border-slate-200/80 py-10 dark:border-slate-800">
    <div class="container-wide flex flex-col items-center gap-4 text-sm text-slate-500 sm:flex-row sm:justify-between dark:text-slate-500">
      <p>© {{ year }} {{ site.author }} · {{ t('footer.rights') }}</p>
      <div class="flex items-center gap-4">
        <span class="hidden sm:inline">{{ t('footer.poweredBy') }}</span>
        <NuxtLink :to="url.to('/archive')" class="transition-colors hover:text-brand-600 dark:hover:text-brand-400">
          {{ t('archive.title') }}
        </NuxtLink>
        <a :href="withBase('/sitemap.xml')" class="transition-colors hover:text-brand-600 dark:hover:text-brand-400">
          sitemap.xml
        </a>
        <a :href="withBase(feedPath)" class="transition-colors hover:text-brand-600 dark:hover:text-brand-400">
          RSS
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const url = useLocaleUrl()
const { withBase } = useBaseUrl()
const appConfig = useAppConfig()

const site = appConfig.site as { author: string }
const year = new Date().getFullYear()

const feedPath = computed(() => withBase(locale.value === 'zh' ? '/feed.xml' : '/en/feed.xml'))
</script>
