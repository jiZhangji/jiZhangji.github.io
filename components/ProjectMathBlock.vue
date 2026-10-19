<template>
  <figure class="project-math-block">
    <figcaption>{{ block.title[lang] }}</figcaption>
    <div class="math-scroll" role="region" tabindex="0" :aria-label="block.title[lang]">
      <div v-html="mathHtml" />
    </div>
    <p class="math-explanation">{{ block.explanation[lang] }}</p>
    <p v-if="block.caption" class="math-caption">{{ block.caption[lang] }}</p>
  </figure>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'
import type { ProjectMathBlock } from '~/data/project-types'

const props = defineProps<{ block: ProjectMathBlock }>()
const { locale } = useI18n()
const lang = computed<'zh' | 'en'>(() => locale.value === 'en' ? 'en' : 'zh')
// The only HTML sink is KaTeX output, not arbitrary content. trust:false rejects
// HTML/URL commands; HTML + MathML retains an accessible mathematical version.
const mathHtml = computed(() => katex.renderToString(props.block.latex, {
  displayMode: true,
  output: 'htmlAndMathml',
  trust: false,
  throwOnError: false,
  strict: 'warn',
  maxExpand: 1000,
  maxSize: 10,
}))
</script>

<style scoped>
.project-math-block { min-width: 0; max-width: 100%; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); padding: 24px; }
figcaption { font-size: 14px; font-weight: 500; line-height: 1.8; }
.math-scroll { max-width: 100%; overflow-x: auto; overflow-y: hidden; padding: 16px 0; }
.math-scroll:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
.math-explanation, .math-caption { color: var(--muted); font-size: 12px; line-height: 1.9; }
.math-caption { margin-top: 10px; }
@media (max-width: 639px) { .project-math-block { padding: 18px; } }
</style>
