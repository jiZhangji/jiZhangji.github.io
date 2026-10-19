<template>
  <div class="container-page">
    <PageHeader :title="t('links.title')" :subtitle="t('links.subtitle')" />

    <!-- application notice -->
    <div class="card p-5">
      <h2 class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9" />
          <path stroke-linecap="round" d="M12 8h.01M11 12h1v4h1" />
        </svg>
        {{ t('links.notice') }}
      </h2>
      <ul class="mt-3 space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
        <li>· {{ t('links.rule1') }}</li>
        <li>· {{ t('links.rule2') }}</li>
      </ul>
      <p v-if="site.email" class="mt-3 text-sm text-slate-500 dark:text-slate-400">
        {{ t('comments.email') }}:
        <a :href="`mailto:${site.email}`" class="link-underline">{{ site.email }}</a>
      </p>
    </div>

    <!-- link cards -->
    <div v-if="links.length" class="mt-6 grid gap-3 sm:grid-cols-2">
      <a
        v-for="item in links"
        :key="item.url"
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
        class="card group flex items-start gap-3 p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:hover:border-brand-800"
      >
        <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-lg font-bold text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
          {{ item.avatar || item.name.slice(0, 1) }}
        </span>
        <span class="min-w-0">
          <span class="block text-sm font-semibold text-slate-800 transition-colors group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400">
            {{ item.name }}
          </span>
          <span class="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
            {{ item.desc?.[locale] || item.desc?.zh }}
          </span>
        </span>
      </a>
    </div>

    <p v-else class="py-12 text-center text-sm text-slate-400 dark:text-slate-500">
      {{ t('links.empty') }}
    </p>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const app = useAppConfig()

const site = app.site as { email?: string }
const links = (app.links as {
  name: string
  url: string
  desc?: Record<string, string>
  avatar?: string
}[]) || []

usePageSeo(() => t('links.title'), () => t('links.subtitle'))
</script>
