<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
      :aria-label="t('lang.switch')"
      @click="open = !open"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="9" />
        <path stroke-linecap="round" d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </svg>
      <span class="hidden sm:inline">{{ current?.name ?? locale }}</span>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <ul
        v-if="open"
        class="card absolute right-0 mt-2 w-36 overflow-hidden py-1"
      >
        <li v-for="opt in options" :key="opt.code">
          <NuxtLink
            :to="url.switchTo(opt.code)"
            class="flex items-center justify-between px-3 py-2 text-sm transition-colors"
            :class="opt.code === locale
              ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'"
          >
            {{ opt.name }}
            <svg v-if="opt.code === locale" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
            </svg>
          </NuxtLink>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()
const url = useLocaleUrl()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

const options = LOCALE_OPTIONS
const current = computed(() => options.find((o) => o.code === locale.value))

function onClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

// keep the html lang attribute + i18n state in sync
watch(locale, (l) => {
  if (import.meta.client) {
    document.documentElement.lang = LOCALE_OPTIONS.find((o) => o.code === l)?.htmlLang || l
  }
}, { immediate: true })
</script>
