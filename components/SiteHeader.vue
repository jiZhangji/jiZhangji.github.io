<template>
  <a href="#main-content" class="skip-link">{{ isEn ? 'Skip to content' : '跳到正文' }}</a>
  <header class="site-header sticky top-0 z-40">
    <div class="container-wide flex h-[80px] items-center justify-between gap-3">
      <NuxtLink :to="url.to('/')" class="flex shrink-0 items-center gap-3" aria-label="Zhang Ji · Home">
        <span class="brand-mark">{{ profile.initials }}</span>
        <span class="text-[13px] font-semibold tracking-[.08em]">ZHANG JI<span class="muted mt-0.5 hidden font-mono text-[8px] font-normal tracking-[.13em] sm:block">RESEARCH & NOTES</span></span>
      </NuxtLink>
      <nav class="hidden items-center gap-[22px] lg:flex" :aria-label="isEn ? 'Main navigation' : '主导航'">
        <NuxtLink v-for="item in navigation" :key="item.path" :to="url.to(item.path)" class="nav-link" :aria-current="isActive(item.path) ? 'page' : undefined">{{ isEn ? item.en : item.zh }}</NuxtLink>
      </nav>
      <div class="flex shrink-0 items-center gap-0.5">
        <a :href="profile.github" class="icon-button hidden xl:inline-flex" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><SiteIcon name="github" class="h-4 w-4" /></a>
        <a v-if="profile.scholar" :href="profile.scholar" class="icon-button hidden sm:inline-flex" target="_blank" rel="noopener noreferrer" aria-label="Google Scholar"><SiteIcon name="book" class="h-[18px] w-[18px]" /></a>
        <a v-if="profile.email" :href="`mailto:${profile.email}`" class="icon-button hidden sm:inline-flex" :aria-label="isEn ? 'Email' : '发送邮件'"><SiteIcon name="mail" class="h-[18px] w-[18px]" /></a>
        <button class="icon-button" type="button" :aria-label="isEn ? 'Search articles' : '搜索文章'" title="Ctrl / ⌘ + K" @click="searchOpen = true"><SiteIcon name="search" class="h-[18px] w-[18px]" /></button>
        <NuxtLink :to="url.switchTo(isEn ? 'zh' : 'en')" class="icon-button font-mono text-[11px]" :aria-label="isEn ? '切换到中文' : 'Switch to English'" :hreflang="isEn ? 'zh-CN' : 'en'">{{ isEn ? '中' : 'EN' }}</NuxtLink>
        <button class="icon-button" type="button" :aria-label="themeLabel" :title="themeLabel" @click="cycle"><SiteIcon :name="mode === 'system' ? 'monitor' : mode === 'dark' ? 'moon' : 'sun'" class="h-[18px] w-[18px]" /></button>
        <button ref="menuButton" class="icon-button lg:hidden" type="button" :aria-label="open ? (isEn ? 'Close menu' : '关闭菜单') : (isEn ? 'Open menu' : '打开菜单')" aria-controls="mobile-navigation" :aria-expanded="open" @click="open = !open"><SiteIcon :name="open ? 'close' : 'menu'" class="h-5 w-5" /></button>
      </div>
    </div>
    <nav v-if="open" id="mobile-navigation" class="container-wide section-rule grid grid-cols-2 gap-x-5 gap-y-1 pb-5 pt-4 lg:hidden" :aria-label="isEn ? 'Mobile navigation' : '移动导航'" @keydown.esc="closeMenu">
      <NuxtLink v-for="item in navigation" :key="item.path" :to="url.to(item.path)" class="py-3 text-sm" :class="isActive(item.path) ? 'text-brand-700 dark:text-brand-300' : 'muted'" :aria-current="isActive(item.path) ? 'page' : undefined" @click="open = false">{{ isEn ? item.en : item.zh }}</NuxtLink>
      <NuxtLink :to="url.to('/cv')" class="muted py-3 text-sm" @click="open = false">{{ isEn ? 'CV / Résumé' : '简历 / CV' }}</NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { profile } from '~/data/profile'
const { locale } = useI18n()
const isEn = computed(() => locale.value === 'en')
const url = useLocaleUrl()
const route = useRoute()
const { mode, cycle } = useTheme()
const open = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)
const searchOpen = useState('search-open', () => false)
const navigation = [
  { path: '/', en: 'Home', zh: '首页' }, { path: '/about', en: 'About', zh: '关于' },
  { path: '/research', en: 'Research', zh: '研究' }, { path: '/publications', en: 'Publications', zh: '论文' },
  { path: '/projects', en: 'Projects', zh: '项目' }, { path: '/blog', en: 'Blog', zh: '博客' },
  { path: '/guide', en: 'Guide', zh: '指南' },
  { path: '/lab', en: 'Lab', zh: '互动' }, { path: '/contact', en: 'Contact', zh: '联系' },
]
const themeLabel = computed(() => isEn.value ? `Theme: ${mode.value}. Switch theme` : `当前主题：${mode.value === 'dark' ? '深色' : mode.value === 'light' ? '浅色' : '跟随系统'}，点击切换`)
function isActive(path: string) { return path === '/' ? url.bare.value === '/' : url.bare.value === path || url.bare.value.startsWith(`${path}/`) }
function closeMenu() { open.value = false; menuButton.value?.focus() }
watch(() => route.fullPath, () => { open.value = false })
</script>
