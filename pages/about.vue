<template>
  <div class="container-wide">
    <header class="max-w-3xl">
      <p class="eyebrow">{{ isEnglish ? 'ABOUT' : 'ABOUT · 关于' }}</p>
      <h1 class="page-title">{{ isEnglish ? 'A little about me.' : '关于我。' }}</h1>
      <p class="lead mt-6">{{ localize(profile.bio) }}</p>
    </header>

    <div class="about-layout section-space">
      <aside class="about-identity">
        <img v-if="profile.avatar" :src="assetUrl(profile.avatar)" :alt="profile.name" width="96" height="96" class="mb-5 h-24 w-24 rounded-lg object-cover">
        <div v-else class="identity-monogram" aria-hidden="true">{{ profile.initials }}</div>
        <h2 class="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{{ profile.name }}</h2>
        <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{{ localize(profile.role) }}</p>
        <div class="mt-6 flex flex-col items-start gap-3 text-sm">
          <a :href="profile.github" target="_blank" rel="noopener noreferrer" class="text-link">GitHub <span aria-hidden="true">↗</span></a>
          <NuxtLink :to="to('/cv')" class="text-link">{{ isEnglish ? 'Résumé / CV' : '简历 / CV' }} <span aria-hidden="true">↗</span></NuxtLink>
          <NuxtLink :to="to('/contact')" class="text-link">{{ isEnglish ? 'Get in touch' : '联系我' }} <span aria-hidden="true">→</span></NuxtLink>
        </div>
      </aside>

      <div class="min-w-0 space-y-14">
        <section aria-labelledby="interests-heading">
          <p class="eyebrow mb-3">01 / {{ isEnglish ? 'CURIOSITY' : '研究兴趣' }}</p>
          <h2 id="interests-heading" class="section-heading">{{ isEnglish ? 'Understanding visual worlds.' : '理解图像，也理解它的形成。' }}</h2>
          <p class="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">{{ isEnglish ? 'My interests connect computer vision with remote sensing: learning useful representations, understanding their limits, and making experiments easier to inspect and reproduce.' : '研究兴趣围绕计算机视觉与遥感展开：学习有用的表征，理解方法的适用边界，让实验更容易检查、比较与复现。' }}</p>
          <ul class="mt-5 flex flex-wrap gap-2" :aria-label="isEnglish ? 'Research interests' : '研究兴趣'">
            <li v-for="interest in profile.interests" :key="interest.en" class="chip">{{ localize(interest) }}</li>
          </ul>
          <NuxtLink :to="to('/research')" class="text-link mt-5 inline-flex items-center gap-2 text-sm">{{ isEnglish ? 'Explore research questions' : '了解具体研究问题' }} <span aria-hidden="true">→</span></NuxtLink>
        </section>

        <section aria-labelledby="education-heading">
          <p class="eyebrow mb-3">02 / {{ isEnglish ? 'BACKGROUND' : '教育与研究经历' }}</p>
          <h2 id="education-heading" class="section-heading">{{ isEnglish ? 'Education & experience' : '教育与经历' }}</h2>
          <div class="mt-6 space-y-8">
            <div>
              <h3 class="mb-4 text-sm font-medium text-slate-900 dark:text-slate-200">{{ isEnglish ? 'Education' : '教育经历' }}</h3>
              <AcademicTimeline :entries="profile.education" :empty-text="isEnglish ? 'Education details have not been added yet.' : '教育信息待补充，暂不展示未经确认的学校、学位或日期。'" />
            </div>
            <div>
              <h3 class="mb-4 text-sm font-medium text-slate-900 dark:text-slate-200">{{ isEnglish ? 'Research experience' : '研究经历' }}</h3>
              <AcademicTimeline :entries="profile.experience" :empty-text="isEnglish ? 'Verified research experience will be listed here.' : '研究经历待补充，以确认后的公开信息为准。'" />
            </div>
          </div>
        </section>

        <section aria-labelledby="timeline-heading">
          <p class="eyebrow mb-3">03 / {{ isEnglish ? 'NOTEBOOK' : '实践记录' }}</p>
          <h2 id="timeline-heading" class="section-heading">{{ isEnglish ? 'Recent explorations' : '近期探索' }}</h2>
          <div class="mt-6">
            <AcademicTimeline :entries="profile.milestones" :empty-text="isEnglish ? 'New milestones will appear here.' : '后续实践记录将在这里更新。'" />
            <NuxtLink :to="to('/projects')" class="text-link mt-5 inline-flex items-center gap-2 text-sm">{{ isEnglish ? 'Visit the project collection' : '查看项目与交互实验' }} <span aria-hidden="true">→</span></NuxtLink>
          </div>
        </section>

        <section aria-labelledby="tools-heading">
          <p class="eyebrow mb-3">04 / {{ isEnglish ? 'MAKING' : '动手实践' }}</p>
          <h2 id="tools-heading" class="section-heading">{{ isEnglish ? 'Capabilities, grounded in projects.' : '能力，落在具体项目里。' }}</h2>
          <SkillsSection class="mt-6" />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { profile, type LocalizedText } from '~/data/profile'

const { locale } = useI18n()
const { to } = useLocaleUrl()
const { withBase } = useBaseUrl()
const isEnglish = computed(() => locale.value === 'en')
const localize = (value: LocalizedText) => value[isEnglish.value ? 'en' : 'zh']
const assetUrl = (path: string) => /^https?:\/\//i.test(path) ? path : withBase(path)

usePageSeo(
  () => isEnglish.value ? 'About' : '关于',
  () => localize(profile.bio),
)
</script>

<style scoped>
.about-layout { display: grid; grid-template-columns: 14rem minmax(0, 1fr); gap: 5rem; }
.about-identity { align-self: start; }
.identity-monogram {
  display: grid;
  place-items: center;
  width: 6rem;
  height: 6rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgb(148 163 184 / 0.3);
  background: rgb(148 163 184 / 0.04);
  font-size: 2rem;
  font-weight: 500;
  letter-spacing: -0.075em;
  color: #0f766e;
}
.dark .identity-monogram { color: #5eead4; }
@media (max-width: 768px) {
  .about-layout { grid-template-columns: 1fr; gap: 3rem; }
  .about-identity { border-bottom: 1px solid rgb(148 163 184 / 0.25); padding-bottom: 2rem; }
  .identity-monogram { width: 4rem; height: 4rem; font-size: 1.5rem; }
}
</style>
