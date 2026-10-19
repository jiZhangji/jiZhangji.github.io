<template>
  <svg v-if="name === 'github'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.53v-2.1c-3.09.67-3.74-1.31-3.74-1.31-.51-1.28-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15.99 1.69 2.6 1.2 3.23.92.1-.72.39-1.21.7-1.49-2.47-.28-5.07-1.24-5.07-5.5 0-1.21.43-2.2 1.15-2.98-.12-.28-.5-1.41.11-2.94 0 0 .94-.3 3.06 1.14a10.7 10.7 0 0 1 5.57 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.66.11 2.94.72.78 1.15 1.77 1.15 2.98 0 4.27-2.6 5.21-5.09 5.49.4.35.75 1.02.75 2.06V22c0 .29.2.64.76.53A11.1 11.1 0 0 0 12 .9Z" />
  </svg>
  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'arrow-up-right'"><path d="M7 17 17 7M7 7h10v10" /></template>
    <template v-else-if="name === 'arrow-right'"><path d="M4 12h16m-6-6 6 6-6 6" /></template>
    <template v-else-if="name === 'arrow-left'"><path d="M20 12H4m6-6-6 6 6 6" /></template>
    <template v-else-if="name === 'search'"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></template>
    <template v-else-if="name === 'menu'"><path d="M4 7h16M4 12h16M4 17h16" /></template>
    <template v-else-if="name === 'close'"><path d="m6 6 12 12M6 18 18 6" /></template>
    <template v-else-if="name === 'mail'"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></template>
    <template v-else-if="name === 'sun'"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" /></template>
    <template v-else-if="name === 'moon'"><path d="M20.5 14A8.8 8.8 0 0 1 10 3.5 8.8 8.8 0 1 0 20.5 14Z" /></template>
    <template v-else-if="name === 'monitor'"><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></template>
    <template v-else-if="name === 'book'"><path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15" /></template>
    <template v-else-if="name === 'download'"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></template>
    <template v-else-if="name === 'rss'"><path d="M4 4a16 16 0 0 1 16 16M4 11a9 9 0 0 1 9 9" /><circle cx="4.5" cy="19.5" r="1" fill="currentColor" /></template>
    <template v-else-if="name === 'code'"><path d="m7 7-5 5 5 5m10-10 5 5-5 5m-4-13-2 16" /></template>
    <template v-else-if="name === 'play'"><path d="m8 4 12 8-12 8V4Z" /></template>
    <template v-else-if="name === 'check'"><path d="m4 12 5 5L20 6" /></template>
    <template v-else-if="name === 'pause'"><path d="M8 5v14M16 5v14" stroke-width="3" /></template>
    <template v-else-if="name === 'gamepad'"><path d="M7 6h10c3 0 4 4 5 10 .5 4-3 4-5 0H7c-2 4-5.5 4-5 0 1-6 2-10 5-10Z"/><path d="M5 10h6m-3-3v6M16 10h.01M19 13h.01"/></template>
    <template v-else-if="name === 'network'"><circle cx="4" cy="6" r="2"/><circle cx="4" cy="18" r="2"/><circle cx="12" cy="12" r="3"/><circle cx="20" cy="6" r="2"/><circle cx="20" cy="18" r="2"/><path d="m6 7 4 3m-4 7 4-3m4-4 4-3m-4 7 4 3"/></template>
    <template v-else-if="name === 'route'"><circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h9a4 4 0 0 1 0 8H8a3 3 0 0 0 0 6h9"/></template>
    <template v-else-if="name === 'share'"><circle cx="5" cy="12" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="19" cy="19" r="3"/><path d="m8 11 8-5m-8 7 8 5"/></template>
    <template v-else-if="name === 'shield'"><path d="m12 2 8 4v6c0 5-8 10-8 10s-8-5-8-10V6l8-4Z"/><path d="m8 12 3 3 5-6"/></template>
    <template v-else-if="name === 'arrow-up'"><path d="M12 20V4m-6 6 6-6 6 6" /></template>
    <template v-else><circle cx="12" cy="12" r="8" /><path d="M12 8v8m-4-4h8" /></template>
  </svg>
</template>

<script setup lang="ts">
defineProps<{ name: string }>()
</script>
