<template>
  <section class="mt-14 border-t border-slate-200/80 pt-8 dark:border-slate-800">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {{ t('comments.title') }}
        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {{ list.length }}
        </span>
      </h2>
      <button
        type="button"
        class="text-xs text-slate-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
        @click="load"
      >
        {{ t('comments.refresh') }}
      </button>
    </div>

    <!-- form -->
    <form class="grid gap-3 sm:grid-cols-3" @submit.prevent="submit">
      <label class="grid gap-1">
        <span class="text-xs text-slate-500 dark:text-slate-400">{{ t('comments.nickname') }} *</span>
        <input v-model="form.nickname" required maxlength="30" class="input" />
      </label>
      <label class="grid gap-1">
        <span class="text-xs text-slate-500 dark:text-slate-400">{{ t('comments.email') }}</span>
        <input v-model="form.email" type="email" maxlength="80" class="input" />
      </label>
      <label class="grid gap-1">
        <span class="text-xs text-slate-500 dark:text-slate-400">{{ t('comments.website') }}</span>
        <input v-model="form.website" type="url" maxlength="120" class="input" />
      </label>
      <label class="grid gap-1 sm:col-span-3">
        <span class="text-xs text-slate-500 dark:text-slate-400">{{ t('comments.content') }}</span>
        <textarea v-model="form.content" required rows="4" maxlength="1000" class="input resize-y" :placeholder="t('comments.placeholder')" />
      </label>
      <div class="flex items-center justify-between sm:col-span-3">
        <p class="text-xs text-slate-400 dark:text-slate-500">{{ t('comments.note') }}</p>
        <button type="submit" class="btn-primary">{{ t('comments.submit') }}</button>
      </div>
    </form>

    <!-- list -->
    <ul v-if="list.length" class="mt-8 space-y-5">
      <li v-for="(c, i) in list" :key="i" class="flex gap-3">
        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          {{ (c.nickname || '?').slice(0, 1).toUpperCase() }}
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-baseline gap-2 text-xs">
            <component :is="c.website ? 'a' : 'span'" :href="c.website || undefined" target="_blank" rel="noopener" class="font-semibold text-slate-700 dark:text-slate-200">
              {{ c.nickname }}
            </component>
            <time class="text-slate-400 dark:text-slate-500">{{ c.time }}</time>
          </div>
          <p class="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600 dark:text-slate-300">{{ c.content }}</p>
        </div>
      </li>
    </ul>
    <p v-else class="mt-8 text-center text-sm text-slate-400 dark:text-slate-500">
      {{ t('comments.empty') }}
    </p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{ postPath: string }>()
const { t } = useI18n()

interface Comment {
  nickname: string
  email?: string
  website?: string
  content: string
  time: string
}

const list = ref<Comment[]>([])
const form = reactive({ nickname: '', email: '', website: '', content: '' })

const key = computed(() => `comments:${props.postPath}`)

function load() {
  if (!import.meta.client) return
  try {
    list.value = JSON.parse(localStorage.getItem(key.value) || '[]')
  } catch {
    list.value = []
  }
}

function submit() {
  const c: Comment = {
    nickname: form.nickname.trim(),
    email: form.email.trim(),
    website: form.website.trim(),
    content: form.content.trim(),
    time: new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
  }
  if (!c.nickname || !c.content) return
  list.value = [...list.value, c]
  try {
    localStorage.setItem(key.value, JSON.stringify(list.value))
  } catch {
    /* ignore */
  }
  form.content = ''
}

onMounted(load)
watch(key, load)
</script>

<style scoped>
.input {
  @apply w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition
         placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20
         dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:placeholder:text-slate-600;
}
</style>
