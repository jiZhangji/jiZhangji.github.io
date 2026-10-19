<template>
  <figure class="architecture-figure">
    <ol class="architecture-flow">
      <li v-for="(step, index) in steps" :key="step.title.en">
        <span class="eyebrow">{{ String(index + 1).padStart(2, '0') }}</span>
        <h3>{{ step.title[lang] }}</h3>
        <p>{{ step.description[lang] }}</p>
        <svg v-if="index < steps.length - 1" class="architecture-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 12h17m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.4" /></svg>
      </li>
    </ol>
    <figcaption>{{ note[lang] }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectDetails } from '~/data/project-types'
import type { LocalizedText } from '~/data/profile'
defineProps<{ steps: ProjectDetails['architecture']; note: LocalizedText }>()
const { locale } = useI18n()
const lang = computed<'zh' | 'en'>(() => locale.value === 'en' ? 'en' : 'zh')
</script>

<style scoped>
.architecture-figure { border: 1px solid var(--line); border-radius: 10px; background: var(--soft); padding: 28px; }
.architecture-flow { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 28px; }
.architecture-flow li { position: relative; min-width: 0; padding: 18px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); }
.architecture-flow h3 { font-size: 14px; font-weight: 500; line-height: 1.6; margin-top: 8px; }
.architecture-flow p { color: var(--muted); font-size: 12px; line-height: 1.8; margin-top: 10px; }
.architecture-arrow { position: absolute; width: 22px; height: 22px; top: calc(50% - 11px); right: -26px; color: var(--accent); }
figcaption { margin-top: 22px; color: var(--muted); font-size: 12px; line-height: 1.8; }
@media (max-width: 767px) { .architecture-figure { padding: 20px; } .architecture-flow { grid-template-columns: minmax(0, 1fr); } .architecture-arrow { top: auto; bottom: -26px; right: calc(50% - 11px); transform: rotate(90deg); } }
</style>
