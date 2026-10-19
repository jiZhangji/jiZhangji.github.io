<template>
  <footer class="site-footer section-rule mt-auto">
    <div class="container-wide flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
      <div><p class="text-xs font-medium">© {{ new Date().getFullYear() }} {{ profile.name }}</p><p class="muted mt-2 font-mono text-[10px] tracking-wide">RESEARCH IS A WORK IN PROGRESS.</p></div>
      <div class="flex flex-wrap gap-x-6 gap-y-3 text-xs">
        <a :href="profile.github" target="_blank" rel="noopener noreferrer" class="muted hover:underline">GitHub ↗</a>
        <NuxtLink :to="url.to('/lab')" class="muted hover:underline">{{ isEn ? 'Interactive Lab' : '互动实验室' }}</NuxtLink>
        <NuxtLink :to="url.to('/cv')" class="muted hover:underline">CV</NuxtLink>
        <a :href="withBase(isEn ? '/en/feed.xml' : '/feed.xml')" class="muted hover:underline">RSS</a>
        <NuxtLink :to="url.to('/contact')" class="muted hover:underline">{{ isEn ? 'Contact' : '联系' }}</NuxtLink>
        <span class="muted font-mono text-[10px]">Nuxt · {{ profile.updated }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { profile } from '~/data/profile'
const { locale } = useI18n()
const isEn = computed(() => locale.value === 'en')
const url = useLocaleUrl()
const { withBase } = useBaseUrl()
</script>
