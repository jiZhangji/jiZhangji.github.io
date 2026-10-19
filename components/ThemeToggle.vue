<template>
  <button
    type="button"
    class="grid h-9 w-9 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
    :title="t(`theme.${mode}`)"
    :aria-label="t('theme.toggle')"
    @click="cycle"
  >
    <svg v-if="mode === 'light'" xmlns="http://www.w3.org/2000/svg" class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="4" />
      <path stroke-linecap="round" d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
    <svg v-else-if="mode === 'dark'" xmlns="http://www.w3.org/2000/svg" class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path stroke-linecap="round" d="M8 21h8m-4-4v4" />
    </svg>
  </button>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { mode, cycle } = useTheme()
</script>
