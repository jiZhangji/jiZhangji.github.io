<template>
  <article class="post-card group" :class="{ 'post-card-featured': featured }">
    <div class="post-date">
      <span v-if="featured" class="post-featured-label">{{ locale === 'zh' ? '最新笔记' : 'LATEST NOTE' }}</span>
      <time :datetime="post.date">{{ formatDate(post.date, locale) }}</time>
      <p class="sm:mt-1">{{ readingMinutes(post) }} {{ locale === 'zh' ? '分钟阅读' : 'min read' }}</p>
    </div>

    <div class="min-w-0">
      <p v-if="post.category" class="mb-2 text-xs">
        <NuxtLink
          :to="url.to(`/categories/${encodeURIComponent(post.category)}`)"
          class="font-medium text-brand-700 hover:underline dark:text-brand-400"
        >
          {{ label(post.category) }}
        </NuxtLink>
      </p>

      <component :is="headingTag" class="post-title">
        <NuxtLink
          :to="url.to(toRoutePath(post.path))"
          class="post-title-link"
        >
          <span>{{ post.title }}</span><SiteIcon name="arrow-up-right" class="post-arrow" />
        </NuxtLink>
      </component>

      <p v-if="post.description" class="muted mt-3 line-clamp-3 text-sm leading-7">
        {{ post.description }}
      </p>

      <div v-if="post.tags?.length" class="mt-4 flex flex-wrap gap-2">
        <NuxtLink
          v-for="tag in post.tags"
          :key="tag"
          :to="url.to(`/tags/${encodeURIComponent(tag)}`)"
          class="chip"
        >
          {{ tag }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { BlogPost } from '~/composables/useContent'

withDefaults(defineProps<{ post: BlogPost; featured?: boolean; headingTag?: 'h2' | 'h3' }>(), {
  featured: false,
  headingTag: 'h2',
})

const { locale } = useI18n()
const url = useLocaleUrl()
const { label } = useCategoriesConfig()
</script>
