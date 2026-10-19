<template>
  <figure v-if="block.kind === 'code' && block.code.trim()" class="project-content-block">
    <figcaption class="content-title">{{ block.title[lang] }}<span class="code-language">{{ block.language }}</span></figcaption>
    <pre tabindex="0" :aria-label="block.title[lang]"><code :class="`language-${block.language}`">{{ block.code }}</code></pre>
    <p v-if="block.caption" class="content-caption">{{ block.caption[lang] }}</p>
  </figure>

  <div v-else-if="block.kind === 'table' && block.rows.length && block.columns.length" class="project-content-block">
    <div class="table-scroll" tabindex="0" role="region" :aria-label="block.title[lang]">
      <table>
        <caption class="content-title">{{ block.title[lang] }}</caption>
        <thead><tr><th v-for="(column, index) in block.columns" :key="index" scope="col">{{ column[lang] }}</th></tr></thead>
        <tbody>
          <tr v-for="(row, rowIndex) in block.rows" :key="rowIndex">
            <th scope="row">{{ row[0][lang] }}</th>
            <td v-for="(cell, cellIndex) in row.slice(1)" :key="cellIndex">{{ cell[lang] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="block.caption" class="content-caption">{{ block.caption[lang] }}</p>
  </div>

  <LazyProjectMathBlock v-else-if="block.kind === 'math' && block.latex.trim()" :block="block" />

  <figure v-else-if="block.kind === 'video' && (localVideo || externalVideo)" class="project-content-block">
    <figcaption class="content-title">{{ block.title[lang] }}</figcaption>
    <video v-if="localVideo" controls playsinline preload="none" :poster="localVideo.poster" :aria-label="block.title[lang]">
      <source :src="localVideo.src" :type="localVideo.mimeType">
      <track v-for="track in localVideo.captions" :key="`${track.language}-${track.src}`" kind="captions" :src="track.src" :srclang="track.language" :label="track.label[lang]" :default="track.language === lang">
      {{ isEn ? 'Your browser cannot play this video. Use the file link below or read the text alternative.' : '当前浏览器不能播放此视频，请使用下方文件链接或阅读文字说明。' }}
    </video>
    <a v-if="localVideo" :href="localVideo.src" class="text-link mt-4" target="_blank" rel="noopener noreferrer">{{ isEn ? 'Open video file' : '打开视频文件' }} ↗</a>
    <template v-else-if="externalVideo">
      <a :href="externalVideo.href" class="btn-ghost" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">{{ isEn ? 'Watch on the verified source site' : '前往已核验的视频来源' }} ↗</a>
      <p class="content-caption">{{ isEn ? 'External link checked' : '外部链接核对日期' }}: {{ externalVideo.verifiedOn }}. {{ isEn ? 'No third-party player is loaded on this page.' : '本页不加载第三方播放器。' }}</p>
    </template>
    <details class="video-transcript">
      <summary>{{ isEn ? 'Video text alternative' : '视频文字说明' }}</summary>
      <p>{{ block.transcript[lang] }}</p>
    </details>
    <p v-if="block.caption" class="content-caption">{{ block.caption[lang] }}</p>
  </figure>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectContentBlock } from '~/data/project-types'

const props = defineProps<{ block: ProjectContentBlock }>()
const { locale } = useI18n()
const lang = computed<'zh' | 'en'>(() => locale.value === 'en' ? 'en' : 'zh')
const isEn = computed(() => lang.value === 'en')
const { withBase } = useBaseUrl()

// Only same-site public assets may become media requests. Reject URL schemes,
// protocol-relative URLs, backslashes and traversal before applying the base.
function localAsset(path: string | undefined): string | undefined {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return undefined
  let decoded: string
  try { decoded = decodeURIComponent(path) } catch { return undefined }
  if (decoded.startsWith('//') || /[\u0000-\u0020\u007f\\?#]/.test(decoded)) return undefined
  if (decoded.split('/').some(part => part === '.' || part === '..')) return undefined
  return withBase(path)
}

const localVideo = computed(() => {
  const block = props.block
  if (block.kind !== 'video' || block.source.kind !== 'local') return null
  const src = localAsset(block.source.src)
  if (!src) return null
  return {
    src,
    mimeType: block.source.mimeType,
    poster: localAsset(block.source.poster),
    captions: (block.source.captions ?? []).flatMap(track => {
      const trackSrc = localAsset(track.src)
      return trackSrc ? [{ ...track, src: trackSrc }] : []
    }),
  }
})

const externalVideo = computed(() => {
  const block = props.block
  if (block.kind !== 'video' || block.source.kind !== 'verified-external') return null
  const source = block.source
  if (!/^\d{4}-\d{2}-\d{2}$/.test(source.verifiedOn)) return null
  try {
    const url = new URL(source.href)
    if (url.protocol !== 'https:' || url.username || url.password) return null
    return { href: url.href, verifiedOn: source.verifiedOn }
  } catch { return null }
})
</script>

<style scoped>
.project-content-block { min-width: 0; max-width: 100%; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); padding: 24px; }
.content-title { text-align: left; font-size: 14px; font-weight: 500; line-height: 1.8; margin-bottom: 16px; }
.code-language { display: inline-block; margin-left: 12px; color: var(--muted); font: 10px/1.8 ui-monospace, monospace; }
pre { overflow-x: auto; max-width: 100%; padding: 18px; border: 1px solid var(--line); border-radius: 4px; background: var(--soft); font-size: 12px; line-height: 1.8; white-space: pre; tab-size: 2; }
.content-caption { margin-top: 14px; color: var(--muted); font-size: 12px; line-height: 1.9; }
.table-scroll { max-width: 100%; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.8; }
caption { caption-side: top; padding-bottom: 16px; }
th, td { min-width: 120px; border-bottom: 1px solid var(--line); padding: 12px 16px; text-align: left; vertical-align: top; }
th { font-weight: 500; }
thead { background: var(--soft); }
tbody td { color: var(--muted); }
video { display: block; width: 100%; max-height: 520px; border: 1px solid var(--line); border-radius: 4px; background: var(--soft); }
.video-transcript { margin-top: 18px; font-size: 13px; line-height: 1.8; }
.video-transcript summary { cursor: pointer; color: var(--accent); }
.video-transcript p { white-space: pre-line; margin-top: 12px; color: var(--muted); }
pre:focus-visible, .table-scroll:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
@media (max-width: 639px) { .project-content-block { padding: 18px; } pre { padding: 14px; } }
</style>
