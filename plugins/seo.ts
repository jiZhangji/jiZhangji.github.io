import { profile } from '~/data/profile'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl).replace(/\/+$/, '')
  const canonical = computed(() => `${siteUrl}${route.path === '/' ? '/' : route.path.replace(/\/$/, '')}`)
  const barePath = computed(() => route.path.replace(/^\/(zh|en)(?=\/|$)/, '') || '/')
  useHead({
    link: computed(() => [
      { rel: 'canonical', href: canonical.value },
      { rel: 'alternate', hreflang: 'zh-CN', href: `${siteUrl}${barePath.value}` },
      { rel: 'alternate', hreflang: 'en', href: `${siteUrl}/en${barePath.value === '/' ? '' : barePath.value}` },
      { rel: 'alternate', hreflang: 'x-default', href: `${siteUrl}${barePath.value}` },
    ]),
    meta: [
      { name: 'author', content: profile.name },
      { name: 'keywords', content: 'Zhang Ji, Computer Vision, SAR, Remote Sensing, Multimodal Learning, Research, 计算机视觉, 遥感, 自监督学习' },
      { property: 'og:site_name', content: `${profile.name} · Research & Notes` },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: `${siteUrl}/images/social-card.svg` },
      { property: 'og:image:alt', content: 'Zhang Ji — AI, Computer Vision & Remote Sensing' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: `${siteUrl}/images/social-card.svg` },
    ],
    script: [{ key: 'person-schema', type: 'application/ld+json', innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: profile.name, url: siteUrl, sameAs: [profile.github], knowsAbout: profile.interests.map(i => i.en) }) }],
  })
})
