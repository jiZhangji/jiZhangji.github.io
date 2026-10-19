<template>
  <nav v-if="flatLinks.length" :aria-label="heading" class="text-sm">
    <p v-if="showTitle" class="mb-4 text-xs font-medium tracking-wide text-slate-600 dark:text-slate-300">{{ heading }}</p>
    <ul class="border-l border-slate-200 dark:border-slate-800">
      <li v-for="link in flatLinks" :key="link.id">
        <a
          :href="'#' + encodeURIComponent(link.id)"
          class="-ml-px block border-l-2 py-1.5 text-xs leading-6 transition-colors hover:text-brand-700 dark:hover:text-brand-400"
          :class="[
            link.depth > 2 ? 'pl-6' : 'pl-3',
            active === link.id
              ? 'border-brand-600 font-medium text-brand-700 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-500 dark:text-slate-400',
          ]"
          :aria-current="active === link.id ? 'location' : undefined"
          @click="active = link.id; emit('navigate')"
        >{{ link.text }}</a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TocLink } from '~/composables/useContent'

const props = withDefaults(defineProps<{ links: TocLink[]; title?: string; showTitle?: boolean }>(), { showTitle: true })
const emit = defineEmits<{ navigate: [] }>()
const { locale } = useI18n()
const heading = computed(() => props.title || (locale.value === 'zh' ? '本文目录' : 'On this page'))
const active = ref('')
const flatLinks = computed(() => {
  const flat: TocLink[] = []
  const visited = new Set<string>()
  function visit(links: TocLink[]) {
    for (const link of links) {
      if (!visited.has(link.id)) {
        flat.push(link)
        visited.add(link.id)
      }
      if (link.children?.length) visit(link.children)
    }
  }
  visit(props.links)
  return flat
})

let frame = 0
function update() {
  frame = 0
  const headings = flatLinks.value
    .map(link => document.getElementById(link.id))
    .filter((element): element is HTMLElement => element !== null)
  if (!headings.length) return
  let current = headings[0]!.id
  for (const element of headings) {
    if (element.getBoundingClientRect().top <= 144) current = element.id
    else break
  }
  active.value = current
}

function scheduleUpdate() {
  if (!frame) frame = window.requestAnimationFrame(update)
}

onMounted(() => {
  update()
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate)
})
watch(flatLinks, () => { if (import.meta.client) nextTick(scheduleUpdate) })
onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleUpdate)
  window.removeEventListener('resize', scheduleUpdate)
  window.cancelAnimationFrame(frame)
})
</script>
