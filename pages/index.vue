<template>
  <div class="academic-home">
    <a href="#main-content" class="skip-link">{{ isEn ? 'Skip to content' : '跳到正文' }}</a>
    <aside class="academic-sidebar" :aria-label="isEn ? 'Profile and navigation' : '个人信息与导航'">
      <div class="academic-identity">
        <img v-if="profile.avatar" :src="withBase(profile.avatar)" :alt="profile.name" class="academic-avatar" width="88" height="88">
        <span v-else class="academic-monogram" aria-hidden="true">{{ profile.initials }}</span>
        <h1>{{ profile.name }}</h1>
        <p class="academic-role">{{ profile.role[lang] }}</p>
        <p class="academic-sidebar-note">{{ isEn ? 'Research, code, and field notes.' : '研究、代码与实践笔记。' }}</p>
        <div class="academic-socials">
          <a :href="profile.github" target="_blank" rel="noopener noreferrer" class="icon-button" title="GitHub" aria-label="GitHub"><SiteIcon name="github" class="h-5 w-5" /></a>
          <a v-if="profile.email" :href="`mailto:${profile.email}`" class="icon-button" :title="isEn ? 'Email' : '邮件'" :aria-label="isEn ? 'Email' : '邮件'"><SiteIcon name="mail" class="h-5 w-5" /></a>
          <NuxtLink :to="url.to('/cv')" class="icon-button" :title="isEn ? 'Curriculum vitae' : '简历'" :aria-label="isEn ? 'Curriculum vitae' : '简历'"><SiteIcon name="book" class="h-5 w-5" /></NuxtLink>
        </div>
      </div>
      <nav class="academic-nav" :aria-label="isEn ? 'Homepage sections' : '首页章节'">
        <a v-for="item in sections" :key="item.id" :href="`#${item.id}`">{{ item.label[lang] }}<SiteIcon name="arrow-right" class="h-3.5 w-3.5" /></a>
      </nav>
      <div class="academic-sidebar-bottom">
        <div class="academic-shortcuts"><NuxtLink :to="url.to('/blog')">{{ isEn ? 'Blog' : '博客' }}</NuxtLink><NuxtLink :to="url.to('/guide')">{{ isEn ? 'Guide' : '指南' }}</NuxtLink><NuxtLink :to="url.to('/lab')">{{ isEn ? 'Lab' : '实验室' }}</NuxtLink></div>
        <div class="flex items-center gap-1">
          <NuxtLink :to="url.switchTo(isEn ? 'zh' : 'en')" class="icon-button font-mono text-xs" :aria-label="isEn ? '切换到中文' : 'Switch to English'" :title="isEn ? '切换到中文' : 'Switch to English'">{{ isEn ? '中' : 'EN' }}</NuxtLink>
          <button type="button" class="icon-button" :aria-label="themeLabel" :title="themeLabel" @click="cycle"><SiteIcon :name="mode === 'system' ? 'monitor' : mode === 'dark' ? 'moon' : 'sun'" class="h-[18px] w-[18px]" /></button>
          <button type="button" class="icon-button" :aria-label="isEn ? 'Search articles' : '搜索文章'" :title="isEn ? 'Search articles' : '搜索文章'" @click="searchOpen = true"><SiteIcon name="search" class="h-[18px] w-[18px]" /></button>
        </div>
      </div>
    </aside>

    <div class="academic-body">
      <section id="about" class="academic-section academic-intro" aria-labelledby="about-title">
        <p class="eyebrow">AI RESEARCH & ENGINEERING</p>
        <h2 id="about-title">{{ isEn ? 'About Me' : '关于我' }}<span class="academic-section-en">{{ isEn ? '关于我' : 'About Me' }}</span></h2>
        <p class="academic-intro-lead">{{ isEn ? `Hi, I'm ${profile.name}.` : `你好，我是 ${profile.name}。` }}</p>
        <p class="academic-bio">{{ profile.bio[lang] }}</p>
        <ul class="academic-interests"><li v-for="interest in profile.interests.slice(0, 8)" :key="interest.en">{{ interest[lang] }}</li></ul>
        <div class="academic-inline-links"><a :href="profile.github" target="_blank" rel="noopener noreferrer"><SiteIcon name="github" class="h-4 w-4" />@jiZhangji</a><NuxtLink :to="url.to('/research')">{{ isEn ? 'Research directions' : '研究方向' }}<SiteIcon name="arrow-up-right" class="h-3.5 w-3.5" /></NuxtLink><NuxtLink :to="url.to('/contact')">{{ isEn ? 'Contact' : '联系我' }}<SiteIcon name="arrow-up-right" class="h-3.5 w-3.5" /></NuxtLink></div>
      </section>
      <section v-if="profile.education.length" id="education" class="academic-section" aria-labelledby="education-title"><h2 id="education-title">{{ isEn ? 'Education' : '教育经历' }}</h2><AcademicTimeline :entries="profile.education" empty-text="" /></section>
      <section v-if="profile.experience.length" id="experience" class="academic-section" aria-labelledby="experience-title"><h2 id="experience-title">{{ isEn ? 'Experience' : '研究与工作经历' }}</h2><AcademicTimeline :entries="profile.experience" empty-text="" /></section>
      <section id="research" class="academic-section" aria-labelledby="research-title">
        <h2 id="research-title">{{ isEn ? 'Research Interests' : '研究方向' }}<span class="academic-section-en">{{ isEn ? '研究方向' : 'Research Interests' }}</span></h2>
        <ul class="academic-research-list"><li v-for="topic in homeTopics" :key="topic.id"><NuxtLink :to="`${url.to('/research')}#${topic.id}`">{{ topic.title[lang] }}</NuxtLink><p>{{ topic.summary[lang] }}</p></li></ul>
      </section>
      <section id="projects" class="academic-section" aria-labelledby="projects-title">
        <div class="academic-section-top"><h2 id="projects-title">{{ isEn ? 'Selected Projects' : '精选项目' }}<span class="academic-section-en">{{ isEn ? '精选项目' : 'Selected Projects' }}</span></h2><NuxtLink :to="url.to('/projects')" class="text-link">{{ isEn ? 'All projects' : '全部项目' }}<SiteIcon name="arrow-up-right" class="h-3.5 w-3.5" /></NuxtLink></div>
        <article v-for="project in featuredProjects" :key="project.slug" class="academic-project">
          <NuxtLink :to="url.to(`/projects/${project.slug}`)" class="academic-project-image" tabindex="-1" aria-hidden="true"><img :src="withBase(project.cover)" alt="" width="240" height="150" loading="lazy"></NuxtLink>
          <div><div class="academic-project-meta"><span>{{ project.year }}</span><ProjectStatus :status="project.status" /></div><h3><NuxtLink :to="url.to(`/projects/${project.slug}`)">{{ project.title[lang] }}</NuxtLink></h3><p>{{ project.description[lang] }}</p><div class="academic-project-tags">{{ project.tags.join(' · ') }}</div><NuxtLink :to="url.to(`/projects/${project.slug}`)" class="text-link text-xs">{{ isEn ? 'Project details' : '项目详情' }}<SiteIcon name="arrow-up-right" class="h-3 w-3" /></NuxtLink></div>
        </article>
        <div class="academic-lab-link"><SiteIcon name="gamepad" class="h-5 w-5" /><NuxtLink :to="url.to('/lab')">{{ isEn ? 'Interactive lab' : '互动实验室' }}</NuxtLink><span>{{ isEn ? 'Connect Four · Neural network · A* pathfinding' : '四子棋 · 神经网络 · A* 寻路' }}</span><SiteIcon name="arrow-up-right" class="h-4 w-4" /></div>
      </section>
      <section v-if="selectedPublications.length" id="publications" class="academic-section" aria-labelledby="publications-title"><h2 id="publications-title">{{ isEn ? 'Publications' : '论文' }}</h2><AcademicPublication v-for="publication in selectedPublications" :key="publication.id" :publication="publication" /></section>
      <section id="skills" class="academic-section" aria-labelledby="skills-title">
        <h2 id="skills-title">{{ isEn ? 'Skills' : '技术能力' }}<span class="academic-section-en">{{ isEn ? '技术能力' : 'Skills' }}</span></h2>
        <dl class="academic-skills"><div v-for="group in skillGroups" :key="group.id"><dt>{{ group.title[lang] }}</dt><dd><p>{{ group.tools.join(' · ') }}</p><div><NuxtLink v-for="slug in group.projects" :key="slug" :to="url.to(`/projects/${slug}`)">{{ projectName(slug) }}<SiteIcon name="arrow-up-right" class="h-3 w-3" /></NuxtLink></div></dd></div></dl>
      </section>
      <section id="notes" class="academic-section" aria-labelledby="notes-title">
        <div class="academic-section-top"><h2 id="notes-title">{{ isEn ? 'Recent Writing' : '最近文章' }}<span class="academic-section-en">{{ isEn ? '最近文章' : 'Recent Writing' }}</span></h2><NuxtLink :to="url.to('/blog')" class="text-link">{{ isEn ? 'All writing' : '全部文章' }}<SiteIcon name="arrow-up-right" class="h-3.5 w-3.5" /></NuxtLink></div>
        <PostCard v-for="post in posts.slice(0, 3)" :key="post.path" :post="post" heading-tag="h3" /><p v-if="!posts.length" class="muted text-sm">{{ isEn ? 'New notes are being prepared.' : '文章正在整理中。' }}</p>
      </section>
      <section id="github" class="academic-section" aria-labelledby="github-title"><h2 id="github-title">GitHub</h2><p class="muted text-sm leading-7">{{ isEn ? 'Code, public projects, and ongoing work.' : '代码、公开项目与持续进行的工作。' }}</p><a :href="`${profile.github}?tab=repositories`" class="academic-github-link" target="_blank" rel="noopener noreferrer"><SiteIcon name="github" class="h-5 w-5" /><span>github.com/jiZhangji</span><SiteIcon name="arrow-up-right" class="h-4 w-4" /></a></section>
      <section v-if="profile.milestones.length" id="news" class="academic-section" aria-labelledby="news-title"><h2 id="news-title">{{ isEn ? 'Updates' : '近期动态' }}<span class="academic-section-en">{{ isEn ? '近期动态' : 'Updates' }}</span></h2><ul class="academic-updates"><li v-for="entry in profile.milestones" :key="entry.id"><time>{{ entry.period[lang] }}</time><div><h3>{{ entry.title[lang] }}</h3><p v-if="entry.description">{{ entry.description[lang] }}</p></div></li></ul></section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { profile } from '~/data/profile'
import { researchTopics } from '~/data/research'
import { projects } from '~/data/projects'
import { publications } from '~/data/publications'
import { skillGroups } from '~/data/skills'
const { locale } = useI18n()
const lang = computed<'zh' | 'en'>(() => locale.value === 'en' ? 'en' : 'zh')
const isEn = computed(() => lang.value === 'en')
const url = useLocaleUrl()
const { withBase } = useBaseUrl()
const { mode, cycle } = useTheme()
const searchOpen = useState('search-open', () => false)
const { posts } = useBlog()
const featuredProjects = projects.filter(project => project.featured)
const homeTopics = researchTopics.filter(topic => ['sar-representation', 'remote-sensing-detection', 'state-space-models', 'llm-agents'].includes(topic.id))
const selectedPublications = publications.filter(publication => publication.selected).slice(0, 2)
const projectName = (slug: string) => projects.find(project => project.slug === slug)?.title[lang.value] ?? slug
const themeLabel = computed(() => isEn.value ? `Theme: ${mode.value}. Switch theme` : `当前主题：${mode.value === 'dark' ? '深色' : mode.value === 'light' ? '浅色' : '跟随系统'}，点击切换`)
const sections = [
  { id: 'about', label: { zh: '关于我', en: 'About Me' } },
  ...(profile.education.length ? [{ id: 'education', label: { zh: '教育经历', en: 'Education' } }] : []),
  ...(profile.experience.length ? [{ id: 'experience', label: { zh: '研究经历', en: 'Experience' } }] : []),
  { id: 'research', label: { zh: '研究方向', en: 'Research' } },
  { id: 'projects', label: { zh: '精选项目', en: 'Projects' } },
  ...(selectedPublications.length ? [{ id: 'publications', label: { zh: '论文', en: 'Publications' } }] : []),
  { id: 'skills', label: { zh: '技术能力', en: 'Skills' } },
  { id: 'notes', label: { zh: '最近文章', en: 'Writing' } },
  { id: 'github', label: { zh: 'GitHub', en: 'GitHub' } },
  ...(profile.milestones.length ? [{ id: 'news', label: { zh: '近期动态', en: 'Updates' } }] : []),
]
usePageSeo(() => isEn.value ? 'AI Research & Agent Engineering' : 'AI 研究与 Agent 工程', () => profile.bio[lang.value])
</script>
