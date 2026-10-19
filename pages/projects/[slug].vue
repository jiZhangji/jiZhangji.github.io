<template>
  <div class="container-wide pb-8 pt-5 sm:pt-10">
    <NuxtLink :to="url.to('/projects')" class="text-link mb-8"><SiteIcon name="arrow-left" class="h-4 w-4" />{{ isEn ? 'All projects' : '全部项目' }}</NuxtLink>
    <header class="max-w-3xl"><p class="eyebrow mb-4">{{ project.category.toUpperCase() }} / {{ project.year }}</p><h1 class="page-title">{{ project.title[lang] }}</h1><p class="lead mt-6">{{ project.description[lang] }}</p><div class="mt-5 flex flex-wrap gap-2"><span v-for="tag in project.tags" :key="tag" class="chip">{{ tag }}</span></div></header>

    <ProjectCaseStudy v-if="project.details" :project="project" />

    <template v-else-if="project.slug === 'pelican-lab'">
      <section class="section-rule mt-10 grid gap-6 py-7 md:grid-cols-[1fr_2fr]"><div><h2 class="section-heading">{{ isEn ? 'One prompt. Three interpretations.' : '同一个题目，三种独立实现。' }}</h2></div><div class="muted text-sm leading-8"><p>{{ isEn ? 'A helmet, sunglasses, a red scarf, a bicycle, and a coastal road. The three prototypes approach the same brief through different scene structures and interaction details.' : '头盔、墨镜、红围巾、自行车，以及一条海岸公路。三份原型以不同的场景结构与交互细节实现同一题目。' }}</p><p class="mt-3">{{ isEn ? 'This is an artifact archive, not a controlled model benchmark. File size is not a quality score, and source-code features are not a claim that every interaction has been exhaustively tested.' : '这是作品档案，不是严格控制条件的模型评测。文件大小不等于质量，源码里存在功能也不意味着每个交互都经过全面验收。' }}</p></div></section>
      <div class="grid gap-7 md:grid-cols-3"><article v-for="item in pelicanExperiments" :key="item.id"><NuxtLink :to="url.to(`/projects/pelican-${item.id}`)" class="project-preview block"><img :src="withBase(item.cover)" :alt="item.title[lang]" width="800" height="500" loading="lazy"></NuxtLink><p class="eyebrow mt-5">{{ item.source }}</p><h2 class="mt-2 text-lg font-medium"><NuxtLink :to="url.to(`/projects/pelican-${item.id}`)">{{ item.title[lang] }}</NuxtLink></h2><p class="muted mt-2 text-xs leading-7">{{ item.description[lang] }}</p><NuxtLink :to="url.to(`/projects/pelican-${item.id}`)" class="text-link mt-4">{{ isEn ? 'Explore the prototype' : '查看交互原型' }} ↗</NuxtLink></article></div>
      <section class="section-rule mt-12 pt-9"><p class="eyebrow">VECTOR STUDIES</p><h2 class="section-heading mt-3">{{ isEn ? 'Before the third dimension.' : '在第三个维度之前。' }}</h2><p class="muted mt-4 text-sm leading-7">{{ isEn ? 'Three independent cycling studies and two found stack illustrations. One additional image-generation record has no recovered local image and is not presented as an artifact.' : '三张独立的骑行习作，以及两张已找到的叠罗汉插画。另有一条生成记录未找到本地图片，未补造为作品。' }}</p><div class="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><figure v-for="item in svgExperiments" :key="item.id"><a :href="withBase(item.src)" target="_blank" rel="noopener noreferrer" class="project-preview block"><img :src="withBase(item.src)" :alt="item.title[lang]" width="800" height="500" loading="lazy"></a><figcaption class="mt-3"><p class="text-sm font-medium">{{ item.title[lang] }}</p><p class="muted mt-1 text-xs leading-6">{{ item.description[lang] }}</p><a :href="withBase(item.src)" download class="text-link mt-2 text-xs">{{ isEn ? 'Download SVG' : '下载 SVG' }} ↓</a></figcaption></figure></div></section>
      <NuxtLink :to="url.to('/blog/experiments/pelican-2026-09-27')" class="btn-ghost mt-10">{{ isEn ? 'Read the experiment notes' : '阅读完整实验记录' }}<SiteIcon name="arrow-right" class="h-4 w-4" /></NuxtLink>
    </template>

    <template v-else-if="experiment">
      <div class="mt-8 flex flex-wrap gap-3"><a :href="withBase(experiment.demo)" target="_blank" rel="noopener noreferrer" class="btn-primary">{{ isEn ? 'Open the 3D demo' : '打开 3D 演示' }}<SiteIcon name="arrow-up-right" class="h-4 w-4" /></a><button type="button" class="btn-ghost" @click="loaded = !loaded">{{ loaded ? (isEn ? 'Unload embedded demo' : '关闭嵌入演示') : (isEn ? 'Load on this page' : '在本页加载') }}</button></div>
      <p class="muted mt-3 text-xs leading-6">{{ isEn ? 'The 3D engine loads only when you choose to open it. Sound requires a user action inside the game.' : '仅在你主动打开时加载 3D 引擎；声音需要在游戏内主动开启。' }}</p>
      <div class="section-rule mt-8 pt-8"><iframe v-if="loaded" :src="withBase(experiment.demo)" :title="experiment.title[lang]" class="h-[500px] w-full border-0 bg-[#172423] sm:h-[660px]" allow="fullscreen; autoplay" allowfullscreen /><figure v-else><div class="project-preview mx-auto max-w-3xl"><img :src="withBase(experiment.cover)" :alt="experiment.title[lang]" width="800" height="600"></div><figcaption class="muted mt-3 text-center text-xs">{{ isEn ? 'The cover is the corresponding 2D SVG study, not a screenshot of the 3D scene.' : '封面是对应的 2D SVG 习作，并非 3D 场景截图。' }}</figcaption></figure></div>
      <section class="section-rule mt-9 grid gap-8 py-8 md:grid-cols-2"><div><h2 class="text-xl font-medium">{{ isEn ? 'Controls & runtime' : '操作与运行' }}</h2><p class="muted mt-4 text-sm leading-8">{{ isEn ? 'W/S to change speed, A/D to change lane, Space to jump, T for wings / wheelie. Use the on-screen controls for camera and audio. Click inside the scene before using the keyboard.' : 'W/S 加减速，A/D 变道，空格跳跃，T 展翅或抬前轮。镜头和音效使用画面中的按钮；键盘操作前请先点击游戏画面。' }}</p><p class="muted mt-3 text-sm leading-8">{{ isEn ? 'Three.js is bundled locally. No external font or CDN request is required for this archived copy.' : 'Three.js 已在本地保存。这份归档副本不依赖外部字体或 CDN 请求。' }}</p></div><div><h2 class="text-xl font-medium">{{ isEn ? 'Provenance & limitations' : '来源与验证边界' }}</h2><dl class="mt-4 space-y-3 text-sm"><div><dt class="muted inline">{{ isEn ? 'Source: ' : '来源：' }}</dt><dd class="inline">{{ experiment.source }}</dd></div><div><dt class="muted inline">{{ isEn ? 'Recorded model label: ' : '日志模型标签：' }}</dt><dd class="inline">{{ experiment.model || (isEn ? 'Not confirmed' : '未确认') }}</dd></div></dl><p class="muted mt-4 text-xs leading-7">{{ isEn ? 'Model labels come from local records, not independent identity verification. Offline changes are limited to asset loading; original files are retained separately.' : '模型名来自本地记录，并非独立身份鉴定。本地化修改限于资源加载，原始文件另行保留。' }}</p></div></section>
      <NuxtLink :to="url.to('/projects/pelican-lab')" class="text-link">{{ isEn ? 'Back to all Pelican experiments' : '返回鹈鹕实验合集' }}<SiteIcon name="arrow-right" class="h-4 w-4" /></NuxtLink>
    </template>

    <template v-else>
      <figure class="project-preview mt-10"><img :src="withBase(project.cover)" :alt="project.title[lang]" width="1200" height="750"></figure>
      <section class="section-rule mt-10 grid gap-8 py-9 md:grid-cols-2"><div><h2 class="section-heading">{{ isEn ? 'Content first, always.' : '始终让内容先行。' }}</h2><p class="muted mt-4 text-sm leading-8">{{ isEn ? 'The site keeps the existing Nuxt foundation and organizes personal information, research topics, publications, and projects as typed data. Blog posts remain plain Markdown.' : '沿用已有 Nuxt 基础，将个人资料、研究方向、论文与项目拆分为类型化数据；博客继续使用普通 Markdown，避免内容维护依赖页面代码。' }}</p></div><div><h2 class="section-heading">{{ isEn ? 'A quiet reading experience.' : '克制、清晰的阅读体验。' }}</h2><p class="muted mt-4 text-sm leading-8">{{ isEn ? 'Chinese and English routes, light and dark themes, mathematical notation, code highlighting, article search, and on-demand interactive experiments.' : '中英双语、明暗主题、数学公式、代码高亮、文章搜索，以及按需加载的交互实验。未核实的论文、经历和联系方式明确留空。' }}</p></div></section>
      <NuxtLink :to="url.to('/blog/notes/building-a-research-notebook')" class="btn-ghost">{{ isEn ? 'Read the implementation notes' : '阅读搭建记录' }}<SiteIcon name="arrow-right" class="h-4 w-4" /></NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { projects } from '~/data/projects'
import { pelicanExperiments, svgExperiments } from '~/data/experiments'
const route = useRoute()
const { locale } = useI18n()
const lang = computed<'zh' | 'en'>(() => locale.value === 'en' ? 'en' : 'zh')
const isEn = computed(() => lang.value === 'en')
const url = useLocaleUrl()
const { withBase } = useBaseUrl()
const project = computed(() => { const found = projects.find(item => item.slug === route.params.slug); if (!found) throw createError({ statusCode: 404, statusMessage: 'Project not found' }); return found })
const experiment = computed(() => pelicanExperiments.find(item => `pelican-${item.id}` === project.value.slug))
const loaded = ref(false)
watch(() => route.params.slug, () => { loaded.value = false })
usePageSeo(() => project.value.title[lang.value], () => project.value.description[lang.value])
</script>
