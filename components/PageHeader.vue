<template>
  <header class="page-header mb-10 sm:mb-14">
    <p v-if="eyebrow" class="eyebrow mb-4">{{ eyebrow }}</p>
    <h1 class="page-title">
      {{ title }}
    </h1>
    <p v-if="subtitle" class="lead mt-4 max-w-2xl">{{ subtitle }}</p>
    <div v-if="$slots.default" class="mt-5">
      <slot />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; eyebrow?: string }>()
</script>
