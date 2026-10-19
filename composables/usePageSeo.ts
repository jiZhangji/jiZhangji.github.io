import { toValue, type MaybeRefOrGetter } from 'vue'
import { profile } from '~/data/profile'

export function usePageSeo(title: MaybeRefOrGetter<string>, description: MaybeRefOrGetter<string>, type: 'website' | 'article' = 'website') {
  useSeoMeta({
    title: () => `${toValue(title)} · ${profile.name}`,
    description: () => toValue(description),
    ogTitle: () => `${toValue(title)} · ${profile.name}`,
    ogDescription: () => toValue(description),
    ogType: type,
    twitterCard: 'summary_large_image',
    twitterTitle: () => `${toValue(title)} · ${profile.name}`,
    twitterDescription: () => toValue(description),
  })
}
