// Import the "HowToLiveBetter" (高性价比人生指南) book into the blog's guide section.
//
// Reads `book/*.md` from the upstream clone, produces:
//   - content/zh/guide/<slug>.md  (34 chapter pages; the NN- prefix is stripped)
//   - data/guide.ts                     (single source of truth for the hub + renderer)
//
// Transformations (CC BY 4.0 requires stating what was changed):
//   1. Drop the `[← 回总目录](../README.md)` line (the blog has its own nav).
//   2. Drop the `# N. 标题` heading — the title moves into frontmatter (avoids a
//      duplicated <h1> with the article template).
//   3. Rewrite local cross-references (`../docs/*.md`, `../LICENSE`,
//      `../LICENSE-CODE`) to upstream GitHub URLs, since those files are not
//      part of the blog.
//   4. Preserve every `<!-- 成本标签 -->` HTML comment, item body, and the
//      `## 许可` heading verbatim.
//
// Usage: node scripts/import-howtolivebetter.mjs
//   --source <dir>  upstream clone root (or HOWTO_SRC env)
//   --out <dir>     blog content output dir (default: HOWTO_OUT env, or the path below)

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BLOG_ROOT = resolve(__dirname, '..')

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

const SOURCE = arg('source', process.env.HOWTO_SRC)
if (!SOURCE) throw new Error('Provide --source <upstream-clone> or set HOWTO_SRC.')
const CONTENT_DIR = arg('out', process.env.HOWTO_OUT || join(BLOG_ROOT, 'content', 'zh', 'guide'))
const DATA_FILE = join(BLOG_ROOT, 'data', 'guide.ts')

const REPO_URL = 'https://github.com/eternity4719/HowToLiveBetter'
const ONLINE_URL = 'https://eternity4719.github.io/HowToLiveBetter/'
const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/'
const MIT_URL = 'https://opensource.org/licenses/MIT'
const SYNCED_COMMIT = '91a4f53'
const SYNCED_DATE = '2026-10-04'

// Chapter descriptions (one concise line each), keyed by chapter number.
const DESCRIPTIONS = {
  1: '车祸、火灾、中毒等意外死亡的预防，以及证据最硬的疫苗、筛查和该去检查的身体信号。',
  2: '烟酒、运动、睡眠、饮食、久坐的量化账，加上戒烟戒酒的具体办法。',
  3: '睡眠、争吵、信息噪音、多任务和人际内耗，哪些精力值得省。',
  4: '无收益项目、沉没成本、拖延、会议和通勤，时间都花在了哪里。',
  5: '订阅、利息、保险、预付消费和常见消费陷阱的省钱账。',
  6: '看起来性价比高、其实并不高的东西。',
  7: '救助、补贴、找活、住宿吃饭、医疗和欠薪维权的兜底。',
  8: '交通事故、被骗止付、自首、正当防卫、签字担保等法律与财产安全。',
  9: '谣言、传播色情、兼职洗钱、高空抛物等普通人容易踩的法律红线。',
  10: '择偶、登记、婚检、健康账、时间账、钱账和退出成本，只拆账不下结论。',
  11: '外挂、爬虫、删库、开源许可、备案等程序员和技术人容易踩的红线。',
  12: '本钱、担保、注册、许可证、纳税、用人、合同和退场，创业别把家底赔进去。',
  13: '心脏骤停、卒中、心梗、大出血等急症的现场处置。',
  14: '二次验证、密码、SIM 卡、手机丢失、盗刷和 App 权限管理。',
  15: '押金、中介、资金监管、产权核对和宅基地的坑。',
  16: '服药依从、长期处方、慢病结算和并发症筛查。',
  17: '意定监护、遗嘱、养老骗局和长期护理。',
  18: '育儿补贴、产假、三期保护，只拆账不给结论。',
  19: '加班费、年休假、补偿、工伤认定和职场被欺负。',
  20: '安全睡眠、疫苗、喂养和发热就医红线。',
  21: '领事保护、境外医疗保险、电诈园区和证件丢失。',
  22: '娱乐场所安全红线，以及运动、正念等减压办法。',
  23: '要不要接着读、怎么挑技能、怎么学才记得住。',
  24: '分级诊疗、转诊、报销、急诊和病历，看病少花钱少走弯路。',
  25: '死亡证明、遗体、火化、殡葬和后续手续。',
  26: '平台资质、增值电信许可、备案、内容治理和服务器选型。',
  27: '叶酸、产检、筛查、生育保险和出生证明。',
  28: '极端节食、医美、减肥药和类固醇的风险账。',
  29: '丧亲、重病、失业后的高危窗口和能做的事。',
  30: '视力、欺凌、筛查、作息和游戏，3 到 18 岁的问题。',
  31: '打工、当兵、考公、消防员、自考等路径地图。',
  32: '留服认证、签证、打工时数和保险。',
  33: '残疾发生之后的康复、办事、就业、心理与照护。',
  34: '常用非处方药的剂量红线与避坑。',
}

function rewriteLinks(body) {
  return body.replace(/\]\(\.\.\/([^)\s]+)\)/g, (match, target) => {
    let url
    if (target === 'README.md') url = REPO_URL
    else if (target === 'LICENSE') url = LICENSE_URL
    else if (target === 'LICENSE-CODE') url = MIT_URL
    else {
      const encoded = target.split('/').map(encodeURIComponent).join('/')
      url = `${REPO_URL}/blob/main/${encoded}`
    }
    return `](${url})`
  })
}

function main() {
  const bookDir = join(SOURCE, 'book')
  const files = readdirSync(bookDir).filter((f) => f.endsWith('.md')).sort()
  if (files.length !== 34) {
    throw new Error(`Expected 34 chapter files under ${bookDir}, found ${files.length}`)
  }

  mkdirSync(CONTENT_DIR, { recursive: true })
  mkdirSync(dirname(DATA_FILE), { recursive: true })

  const chapters = []
  let totalItems = 0
  let totalComments = 0

  for (const filename of files) {
    const src = readFileSync(join(bookDir, filename), 'utf8').replace(/\r\n/g, '\n')
    const lines = src.split('\n')

    // Locate + extract the `# N. 标题` heading.
    let title = null
    let h1Index = -1
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^#\s+(\d+)\.\s*(.+?)\s*$/)
      if (m) { title = `${m[1]}. ${m[2]}`; h1Index = i; break }
    }
    if (!title) throw new Error(`No h1 heading found in ${filename}`)
    const num = Number(title.split('.')[0])

    // Drop the 回总目录 line(s) and the h1.
    const kept = lines.filter((line, i) => {
      if (i === h1Index) return false
      if (/^\[←\s*回总目录\]/.test(line.trim())) return false
      return true
    })

    let body = kept.join('\n')
    body = rewriteLinks(body).trim()

    const itemCount = (body.match(/^###\s+\d+\.\s/gm) || []).length
    const commentCount = (body.match(/<!--\s*成本标签/g) || []).length
    totalItems += itemCount
    totalComments += commentCount

    const slug = filename.replace(/^\d+-/, '').replace(/\.md$/, '')
    const description = DESCRIPTIONS[num]
    if (!description) throw new Error(`Missing description for chapter ${num}`)

    const frontmatter = [
      '---',
      `title: ${JSON.stringify(title)}`,
      `description: ${JSON.stringify(description)}`,
      `date: '${SYNCED_DATE}'`,
      'category: guide',
      'draft: false',
      '---',
      '',
      '',
    ].join('\n')

    const outName = slug + '.md'
    const outPath = join(CONTENT_DIR, outName)
    writeFileSync(outPath, frontmatter + body + '\n', 'utf8')
    console.log(`✓ ${filename}  →  content/zh/guide/${outName}  (${itemCount} items, ${commentCount} cost tags)`)

    chapters.push({ slug, num, title, description })
  }

  if (totalItems !== 654) throw new Error(`Item count mismatch: expected 654, got ${totalItems}`)
  if (totalComments !== 654) throw new Error(`Cost-tag comment count mismatch: expected 654, got ${totalComments}`)

  // Emit data/guide.ts (single source of truth for hub + renderer + sitemap).
  const ts = `// Generated by scripts/import-howtolivebetter.mjs — do not edit by hand.
// Source: ${REPO_URL} (synced commit ${SYNCED_COMMIT}, ${SYNCED_DATE})

export interface GuideChapter {
  slug: string
  num: number
  title: string
  description: string
}

export const guideChapters: GuideChapter[] = [
${chapters.map((c) => `  { slug: ${JSON.stringify(c.slug)}, num: ${c.num}, title: ${JSON.stringify(c.title)}, description: ${JSON.stringify(c.description)} },`).join('\n')}
]

export const guideMeta = {
  title: '高性价比人生指南',
  sourceRepo: ${JSON.stringify(REPO_URL)},
  onlineUrl: ${JSON.stringify(ONLINE_URL)},
  licenseUrl: ${JSON.stringify(LICENSE_URL)},
  license: 'CC BY 4.0',
  codeLicenseUrl: ${JSON.stringify(MIT_URL)},
  codeLicense: 'MIT',
  syncedCommit: ${JSON.stringify(SYNCED_COMMIT)},
  syncedDate: ${JSON.stringify(SYNCED_DATE)},
  totalItems: 654,
  grades: { A: 429, B: 174, C: 51 },
} as const
`
  writeFileSync(DATA_FILE, ts, 'utf8')
  console.log(`\n✓ data/guide.ts (${chapters.length} chapters, ${totalItems} items total)`)
  console.log(`✓ Grade tally: A 429 / B 174 / C 51 (from upstream README)`)
}

main()
