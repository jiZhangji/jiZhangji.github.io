<template>
  <aside class="guide-attribution card">
    <h2 class="text-base font-medium tracking-tight">关于本指南</h2>
    <p class="mt-3 text-sm leading-7">
      本页收录自开源项目「高性价比人生指南」（HowToLiveBetter），共
      <strong>{{ guideMeta.totalItems }}</strong> 条按性价比排序的生活建议，分 34 章。
      每一条都写明花掉什么（钱 / 时间 / 毅力）、换回什么（收益）、证据等级（A / B / C）与来源（期刊论文附 DOI 或 PubMed，或官方文件）。
    </p>

    <dl class="mt-5 grid gap-3 text-sm leading-7">
      <div>
        <dt class="font-medium">出处</dt>
        <dd><a class="text-link" :href="guideMeta.sourceRepo" target="_blank" rel="noopener noreferrer">高性价比人生指南 · GitHub ↗</a></dd>
      </div>
      <div>
        <dt class="font-medium">许可</dt>
        <dd>
          正文按
          <a class="text-link" :href="guideMeta.licenseUrl" target="_blank" rel="noopener noreferrer">CC BY 4.0 ↗</a>
          发布，代码按
          <a class="text-link" :href="guideMeta.codeLicenseUrl" target="_blank" rel="noopener noreferrer">MIT ↗</a>。
        </dd>
      </div>
      <div>
        <dt class="font-medium">本站改动</dt>
        <dd>
          对原文做了改编：重新排版为博客页面、拆分为 34 个章节页，并把指向源仓库内部的链接改写为指向 GitHub 的绝对链接；条目正文、成本标签与证据等级保持原文未改。
        </dd>
      </div>
      <div>
        <dt class="font-medium">同步版本</dt>
        <dd>
          commit <code class="rounded bg-slate-100 px-1.5 py-0.5 text-[0.85em] dark:bg-slate-800">{{ guideMeta.syncedCommit }}</code>（{{ guideMeta.syncedDate }}）。正文每天都在更新，以
          <a class="text-link" :href="guideMeta.onlineUrl" target="_blank" rel="noopener noreferrer">在线版 ↗</a>
          为准。
        </dd>
      </div>
    </dl>

    <p class="mt-5 border-t border-slate-200 pt-4 text-xs leading-6 text-slate-500 dark:border-slate-800 dark:text-slate-400">
      内容按中国大陆现行规定编写，不是医疗或法律建议，涉及身体或法律问题时请咨询专业人士。这是按性价比排好的备选单，不是任务清单——不用全做，作者自己也没做到其中大部分。本书不比较不同方式的致死率，也不写任何具体做法。
    </p>
  </aside>
</template>

<script setup lang="ts">
import { guideMeta } from '~/data/guide'
</script>

<style scoped>
.guide-attribution {
  padding: 1.5rem 1.6rem;
}
</style>
