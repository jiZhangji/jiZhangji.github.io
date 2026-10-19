<template>
  <div class="container-wide">
    <header class="max-w-3xl">
      <p class="eyebrow">CONTACT{{ isEnglish ? '' : ' · 联系' }}</p>
      <h1 class="page-title">{{ isEnglish ? 'Let’s exchange ideas.' : '聊研究，也聊实现。' }}</h1>
      <p class="lead mt-6">{{ isEnglish ? 'Open to conversations about visual learning, remote sensing, and thoughtful technical work.' : '欢迎交流视觉学习、遥感与技术实践。一个具体的问题、一份可复现的实验，或一个值得尝试的想法，都是很好的起点。' }}</p>
    </header>

    <div class="contact-layout section-space">
      <section aria-labelledby="contact-links-heading">
        <h2 id="contact-links-heading" class="eyebrow mb-6">{{ isEnglish ? 'FIND ME ONLINE' : '公开联系渠道' }}</h2>
        <ul>
          <li v-for="link in contactLinks" :key="link.label" class="contact-item">
            <a :href="link.href" :target="link.isEmail ? undefined : '_blank'" :rel="link.isEmail ? undefined : 'noopener noreferrer'" class="contact-link group">
              <span>
                <span class="block text-lg font-medium text-slate-900 transition group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-400">{{ link.label }}</span>
                <span class="mt-1 block break-all text-sm text-slate-500 dark:text-slate-400">{{ link.detail }}</span>
              </span>
              <span aria-hidden="true" class="text-xl text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal-700 dark:group-hover:text-teal-400">↗</span>
            </a>
          </li>
        </ul>
        <p v-if="!profile.email" class="mt-5 text-xs leading-6 text-slate-500 dark:text-slate-400">{{ isEnglish ? 'Email and academic profiles will appear here when public details are added.' : '邮箱及其他学术主页尚未提供，确认公开信息后再补充。' }}</p>
      </section>

      <aside class="contact-note">
        <span aria-hidden="true" class="mb-5 block h-px w-8 bg-teal-600 dark:bg-teal-400"></span>
        <h2 class="text-lg font-medium tracking-tight text-slate-950 dark:text-slate-100">{{ isEnglish ? 'Good conversations start small.' : '从一个具体问题开始。' }}</h2>
        <p class="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">{{ isEnglish ? 'If you have a question about a project, a bug report, or a reproducible example, the relevant repository is a useful place to start.' : '如果想讨论某个项目、反馈问题或分享复现实例，可以从相应的 GitHub 仓库开始。' }}</p>
        <NuxtLink :to="to('/projects')" class="text-link mt-6 inline-flex items-center gap-2 text-sm">{{ isEnglish ? 'Browse projects' : '浏览项目' }} <span aria-hidden="true">→</span></NuxtLink>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { profile } from '~/data/profile'

const { locale } = useI18n()
const { to } = useLocaleUrl()
const isEnglish = computed(() => locale.value === 'en')

const contactLinks = computed(() => [
  { label: 'Email', href: profile.email ? `mailto:${profile.email}` : null, detail: profile.email, isEmail: true },
  { label: 'GitHub', href: profile.github, detail: `@${profile.github.replace(/\/+$/, '').split('/').pop()}`, isEmail: false },
  { label: 'Google Scholar', href: profile.scholar, detail: isEnglish.value ? 'Academic profile' : '学术主页', isEmail: false },
  { label: 'ORCID', href: profile.orcid, detail: isEnglish.value ? 'Researcher identifier' : '研究者标识', isEmail: false },
  { label: 'LinkedIn', href: profile.linkedin, detail: isEnglish.value ? 'Professional profile' : '职业主页', isEmail: false },
  { label: 'ResearchGate', href: profile.researchGate, detail: isEnglish.value ? 'Research profile' : '研究主页', isEmail: false },
].filter((link): link is { label: string; href: string; detail: string; isEmail: boolean } => Boolean(link.href && link.detail)))

useSeoMeta({
  title: () => `${isEnglish.value ? 'Contact' : '联系'} · ${profile.name}`,
  description: () => isEnglish.value ? `Contact ${profile.name} about computer vision, remote sensing, and technical projects.` : `与 ${profile.name} 交流计算机视觉、遥感与技术项目。`,
})
</script>

<style scoped>
.contact-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0.7fr); gap: 7rem; }
.contact-item { border-top: 1px solid rgb(148 163 184 / 0.3); }
.contact-item:last-child { border-bottom: 1px solid rgb(148 163 184 / 0.3); }
.contact-link { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; padding: 1.75rem 0; }
.contact-note { padding-top: 2.5rem; }
@media (max-width: 768px) {
  .contact-layout { grid-template-columns: 1fr; gap: 3rem; }
  .contact-note { padding-top: 0; }
}
</style>
