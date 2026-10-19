<template><img :src="resolved" :alt="alt || ''" :width="width" :height="height" loading="lazy" decoding="async"></template>
<script setup lang="ts">
const props = defineProps<{ src: string; alt?: string; width?: string | number; height?: string | number }>()
const { withBase } = useBaseUrl()
const resolved = computed(() => props.src.startsWith('/') ? withBase(props.src) : props.src)
</script>
