<template>
  <ol v-if="entries.length" class="academic-timeline">
    <li v-for="entry in entries" :key="entry.id" class="timeline-entry">
      <p class="timeline-period">{{ localize(entry.period) }}</p>
      <div>
        <h3 class="font-medium text-slate-900 dark:text-slate-100">{{ localize(entry.title) }}</h3>
        <p v-if="entry.organization" class="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {{ localize(entry.organization) }}
        </p>
        <p v-if="entry.description" class="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
          {{ localize(entry.description) }}
        </p>
      </div>
    </li>
  </ol>
  <p v-else class="text-sm leading-7 text-slate-500 dark:text-slate-400">{{ emptyText }}</p>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { LocalizedText, ProfileEntry } from '~/data/profile'

defineProps<{ entries: ProfileEntry[]; emptyText: string }>()
const { locale } = useI18n()
const localize = (value: LocalizedText) => value[locale.value === 'en' ? 'en' : 'zh']
</script>

<style scoped>
.academic-timeline {
  margin: 0;
  padding: 0;
  list-style: none;
}

.timeline-entry {
  position: relative;
  display: grid;
  grid-template-columns: 8.5rem minmax(0, 1fr);
  gap: 1.5rem;
  border-left: 1px solid rgb(148 163 184 / 0.3);
  padding: 0 0 2rem 1.5rem;
}

.timeline-entry:last-child { padding-bottom: 0; }
.timeline-entry::before {
  content: '';
  position: absolute;
  top: 0.4rem;
  left: -3px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #0d9488;
}
.timeline-period {
  font-size: 0.75rem;
  line-height: 1.75;
  font-variant-numeric: tabular-nums;
  color: #64748b;
}
.dark .timeline-period { color: #94a3b8; }
@media (max-width: 640px) {
  .timeline-entry { grid-template-columns: 1fr; gap: 0.25rem; }
}
</style>
