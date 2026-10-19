<template>
  <div class="container-page">
    <PageHeader eyebrow="GUIDE / 指南" :title="guideMeta.title" subtitle="一份按性价比排序的生活建议清单。每一条都写明花掉什么（钱 / 时间 / 毅力）、换回什么（收益）、证据等级（A / B / C）与来源。共 34 章、654 条，正文每天都在更新，以在线版为准。">
      <div class="mt-2 flex flex-wrap gap-2">
        <span class="chip">{{ guideMeta.totalItems }} 条建议</span>
        <span class="chip">{{ guideChapters.length }} 章</span>
        <span class="chip">证据 A · {{ guideMeta.grades.A }}</span>
        <span class="chip">证据 B · {{ guideMeta.grades.B }}</span>
        <span class="chip">证据 C · {{ guideMeta.grades.C }}</span>
      </div>
    </PageHeader>

    <p class="lead">
      这是按性价比排好的备选单，不是任务清单——不用全做，作者自己也没做到其中大部分。
      涉及身体或法律的问题请咨询专业人士；本书不比较不同方式的致死率，也不写任何具体做法。
    </p>

    <ol class="guide-chapters mt-10 grid gap-3 sm:grid-cols-2" aria-label="章节目录">
      <li v-for="chapter in guideChapters" :key="chapter.slug">
        <NuxtLink :to="`/guide/${chapter.slug}`" class="guide-chapter group">
          <span class="guide-chapter-num">{{ String(chapter.num).padStart(2, '0') }}</span>
          <span class="min-w-0">
            <span class="block text-[15px] font-medium leading-6 text-slate-900 transition-colors group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-brand-300">{{ chapter.title }}</span>
            <span class="mt-1 block text-[12px] leading-[1.9] text-slate-500 dark:text-slate-400">{{ chapter.description }}</span>
          </span>
        </NuxtLink>
      </li>
    </ol>

    <GuideAttribution class="mt-12" />
  </div>
</template>

<script setup lang="ts">
import { guideChapters, guideMeta } from '~/data/guide'
usePageSeo(guideMeta.title, '高性价比人生指南 · 按性价比排序的生活建议清单，共 34 章、654 条，逐条标注成本、收益、证据等级与来源。')
</script>

<style scoped>
.guide-chapters { list-style: none; margin: 0; padding: 0; }
.guide-chapter { display: flex; gap: 14px; align-items: flex-start; padding: 16px 18px; border: 1px solid var(--line); border-radius: 9px; background: var(--surface); transition: border-color .2s, transform .2s, box-shadow .2s; height: 100%; }
.guide-chapter:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow); }
.guide-chapter-num { font: italic 20px/1.4 Georgia, serif; color: var(--clay); flex-shrink: 0; padding-top: 2px; }
</style>
