<template>
  <header
    class="sticky top-0 z-40 border-b transition-colors duration-300"
    :class="scrolled
      ? 'border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-[#0b0f17]/80'
      : 'border-transparent bg-transparent'"
  >
    <div class="container-wide flex h-16 items-center justify-between gap-4">
      <NuxtLink :to="url.to('/')" class="group flex shrink-0 items-center gap-2">
        <span class="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white shadow-sm">
          Z
        </span>
        <span class="hidden text-sm font-semibold tracking-[0.25em] text-slate-700 sm:block dark:text-slate-200">
          zhangji
        </span>
      </NuxtLink>

      <!-- desktop nav -->
      <nav class="hidden items-center gap-1 md:flex">
        <NuxtLink
          v-for="item in nav"
          :key="item.key"
          :to="item.to"
          class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="isActive(item) 
            ? 'text-brand-600 dark:text-brand-400' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'"
        >
          {{ t(`nav.${item.key}`) }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="grid h-9 w-9 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
          :aria-label="t('search.open')"
          :title="`${t('search.shortcut')} · Ctrl/⌘ + K`"
          @click="searchOpen = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7" />
            <path stroke-linecap="round" d="m20 20-3.5-3.5" />
          </svg>
        </button>
        <LangSwitch />
        <ThemeToggle />
        <button
          type="button"
          class="grid h-9 w-9 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800/60"
          :aria-label="'menu'"
          @click="open = !open"
        >
          <svg v-if="!open" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- mobile nav -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <nav
        v-if="open"
        class="container-wide grid gap-1 border-t border-slate-200/70 py-3 md:hidden dark:border-slate-800"
      >
        <NuxtLink
          v-for="item in nav"
          :key="item.key"
          :to="item.to"
          class="rounded-lg px-3 py-2.5 text-sm font-medium"
          :class="isActive(item)
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'"
          @click="open = false"
        >
          {{ t(`nav.${item.key}`) }}
        </NuxtLink>
      </nav>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const url = useLocaleUrl()
const route = useRoute()
const open = ref(false)
const scrolled = ref(false)
const searchOpen = useState('search-open', () => false)

const nav = computed(() => [
  { key: 'home', path: '/', to: url.to('/') },
  { key: 'blog', path: '/blog', to: url.to('/blog') },
  { key: 'categories', path: '/categories', to: url.to('/categories') },
  { key: 'tags', path: '/tags', to: url.to('/tags') },
  { key: 'archive', path: '/archive', to: url.to('/archive') },
  { key: 'about', path: '/about', to: url.to('/about') },
  { key: 'links', path: '/links', to: url.to('/links') },
])

function isActive(item: { path: string; to: string }) {
  const current = stripLocale(route.path)
  if (item.path === '/') return current === '/'
  return current === item.path || current.startsWith(`${item.path}/`)
}

function onScroll() {
  scrolled.value = window.scrollY > 8
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

// close the mobile menu on navigation / locale change
watch(() => [route.fullPath, locale.value], () => (open.value = false))
</script>
