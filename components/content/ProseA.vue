<template>
  <a v-if="isAsset || external || target === '_blank'" :href="resolved" :target="target" :rel="target === '_blank' ? 'noopener noreferrer' : undefined"><slot /></a>
  <NuxtLink v-else :to="href"><slot /></NuxtLink>
</template>
<script setup lang="ts">
const props = defineProps<{ href: string; target?: string }>()
const { withBase } = useBaseUrl()
const external = computed(() => /^(?:https?:|mailto:|tel:|\/\/|#)/i.test(props.href))
const isAsset = computed(() => /\.(?:html?|svg|png|jpe?g|webp|gif|pdf|zip)(?:[?#]|$)/i.test(props.href))
const resolved = computed(() => props.href.startsWith('/') && isAsset.value ? withBase(props.href) : props.href)
</script>
