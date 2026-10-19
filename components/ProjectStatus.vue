<template>
  <span class="project-status" :data-status="status"><span aria-hidden="true" />{{ projectStatusLabels[status][lang] }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { projectStatusLabels, type ProjectStatus } from '~/data/project-types'
withDefaults(defineProps<{ status?: ProjectStatus }>(), { status: 'prototype' })
const { locale } = useI18n()
const lang = computed<'zh' | 'en'>(() => locale.value === 'en' ? 'en' : 'zh')
</script>

<style scoped>
.project-status { display: inline-flex; align-items: center; gap: 7px; max-width: 100%; color: var(--accent); font-size: 11px; line-height: 1.7; }
.project-status > span { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; background: currentColor; }
.project-status[data-status='in-progress'] { color: var(--clay); }
</style>
