<template>
  <ul v-if="items.length" class="flex flex-wrap items-center gap-3" :class="center ? 'justify-center' : ''">
    <li v-for="item in items" :key="item.key">
      <a
        :href="item.href"
        target="_blank"
        rel="noopener noreferrer"
        class="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition
               hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600 hover:shadow-sm
               dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-700 dark:hover:text-brand-400"
        :title="item.label"
      >
        <component :is="item.icon" class="h-[18px] w-[18px]" />
      </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { h, type FunctionalComponent } from 'vue'

defineProps<{ center?: boolean }>()

const app = useAppConfig()
const { withBase } = useBaseUrl()
const { locale } = useI18n()

const site = app.site as { email?: string; github?: string; qq?: string }

const svg = (path: string, fill = false): FunctionalComponent =>
  h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    ...(fill
      ? { fill: 'currentColor' }
      : { fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    innerHTML: path,
  }) as unknown as FunctionalComponent

const IconMail = svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>')
const IconGithub = svg(
  '<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"',
  true,
)
const IconChat = svg('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8Z"/>')
const IconRss = svg('<path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.6"/>')

/** Any entry that has not been configured is simply left out. */
const items = computed(() => {
  const list = [
    site.qq ? { key: 'qq', href: site.qq, label: 'QQ Group', icon: IconChat } : null,
    site.email ? { key: 'mail', href: `mailto:${site.email}`, label: site.email, icon: IconMail } : null,
    site.github ? { key: 'github', href: site.github, label: 'GitHub', icon: IconGithub } : null,
    {
      key: 'rss',
      href: withBase(locale.value === 'zh' ? '/feed.xml' : '/en/feed.xml'),
      label: 'RSS',
      icon: IconRss,
    },
  ]
  return list.filter(Boolean) as { key: string; href: string; label: string; icon: FunctionalComponent }[]
})
</script>
