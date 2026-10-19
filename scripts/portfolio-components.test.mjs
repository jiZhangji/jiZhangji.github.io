/**
 * Component SSR contracts only. Run on an approved server with the project's
 * existing Vue compiler/runtime, TypeScript, and KaTeX dependencies available.
 *
 * Compiles the actual SFC scripts/templates in memory; no fixture files, public
 * assets, network requests, services, package installs, or Nuxt build are made.
 * Nuxt auto-imports, lazy chunk loading, routing, hydration, CSS, mobile layout,
 * caption-file contents, and real video playback are NOT integration-tested.
 * All content below is artificial test data, not portfolio/research evidence.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parse, compileScript } from '@vue/compiler-sfc'
import ts from 'typescript'
import { createSSRApp, defineComponent, h, inject, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'

const require = createRequire(import.meta.url)
const contextKey = 'portfolio-component-ssr-fixture'
const importUrls = new Map(['vue', 'vue/server-renderer', 'katex'].map(name => [name, pathToFileURL(require.resolve(name)).href]))
const componentCache = new Map()

// Mock only the small Nuxt auto-import surface used by these components. Each
// SSR app provides its own context, so language/base state is not shared.
const fixturePrelude = `
import { inject as fixtureInject } from 'vue'
function fixtureContext() {
  const context = fixtureInject(${JSON.stringify(contextKey)}, null)
  if (!context) throw new Error('Missing portfolio SSR fixture context')
  return context
}
const useI18n = () => ({ locale: fixtureContext().locale })
const useBaseUrl = () => ({ withBase: fixtureContext().withBase })
const useLocaleUrl = () => ({ to: fixtureContext().to })
`

function resolveRuntimeImports(context) {
  const visit = node => {
    if (ts.isImportDeclaration(node)) {
      const name = node.moduleSpecifier.text
      const url = importUrls.get(name)
      assert.ok(url, `Unsupported runtime import in component SSR fixture: ${name}`)
      return ts.factory.updateImportDeclaration(node, node.modifiers, node.importClause, ts.factory.createStringLiteral(url), node.attributes)
    }
    return ts.visitEachChild(node, visit, context)
  }
  return sourceFile => ts.visitNode(sourceFile, visit)
}

async function compileComponent(name) {
  if (!componentCache.has(name)) componentCache.set(name, (async () => {
    const filename = fileURLToPath(new URL(`../components/${name}.vue`, import.meta.url))
    const parsed = parse(readFileSync(filename, 'utf8'), { filename })
    assert.deepEqual(parsed.errors, [], `${name}: SFC parsing errors`)
    const compiled = compileScript(parsed.descriptor, {
      id: `portfolio-ssr-fixture-${name}`,
      inlineTemplate: true,
      templateOptions: { ssr: true },
    })
    const output = ts.transpileModule(`${fixturePrelude}\n${compiled.content}`, {
      fileName: `${filename}.ts`,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, sourceMap: false },
      reportDiagnostics: true,
      transformers: { after: [resolveRuntimeImports] },
    })
    const errors = (output.diagnostics || []).filter(item => item.category === ts.DiagnosticCategory.Error)
    assert.deepEqual(errors.map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')), [], `${name}: transpilation errors`)
    // Absolute file URLs let data: modules use the real installed dependencies.
    // Type-only aliases disappear during transpilation; new runtime aliases fail
    // explicitly above instead of being silently mocked.
    const moduleUrl = `data:text/javascript;base64,${Buffer.from(output.outputText).toString('base64')}`
    return (await import(moduleUrl)).default
  })())
  return componentCache.get(name)
}

const emptyChild = defineComponent({ inheritAttrs: false, setup: () => () => null })
const nuxtLinkFixture = defineComponent({
  inheritAttrs: false,
  props: { to: { type: String, required: true } },
  setup(props, { attrs, slots }) {
    const context = inject(contextKey)
    // This is intentionally a link stub, not Nuxt's router implementation.
    return () => h('a', { ...attrs, href: context.prefixBase(props.to), 'data-fixture-nuxt-link': '' }, slots.default?.())
  },
})

async function renderComponent(name, props, { lang = 'zh', base = '/' } = {}) {
  assert.ok(['zh', 'en'].includes(lang))
  assert.ok(['/', '/portfolio/'].includes(base))
  const calls = { assets: [], routes: [] }
  const prefixBase = path => `${base.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`
  const context = {
    locale: ref(lang),
    prefixBase,
    withBase: path => { calls.assets.push(path); return prefixBase(path) },
    to: path => { calls.routes.push(path); return lang === 'en' ? `/en${path === '/' ? '' : path}` : path },
  }
  const app = createSSRApp(await compileComponent(name), props)
  app.provide(contextKey, context)
  app.component('LazyProjectMathBlock', await compileComponent('ProjectMathBlock'))
  app.component('ProjectContentBlock', await compileComponent('ProjectContentBlock'))
  app.component('NuxtLink', nuxtLinkFixture)
  for (const child of ['ProjectStatus', 'ProjectArchitecture', 'SiteIcon']) app.component(child, emptyChild)
  const warnings = []
  app.config.warnHandler = message => warnings.push(message)
  const html = await renderToString(app)
  assert.deepEqual(warnings, [], `${name}: unexpected Vue SSR warnings`)
  return { html, calls }
}

const localized = (zh, en) => ({ zh, en })
const escapeHtml = value => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
// Read only known start tags in this renderer's escaped fixture output. This is
// not a general HTML parser or an accessibility/browser compliance checker.
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}(?=[\\s>])[^>]*>`, 'g'))].map(match => match[0])
const attribute = (tag, name) => {
  const match = tag.match(new RegExp(`\\s${name}(?:="([^"]*)")?(?=\\s|>)`))
  return match ? (match[1] ?? '') : undefined
}
const assertLocalized = (html, text, lang) => {
  assert.ok(html.includes(escapeHtml(text[lang])), `Missing ${lang} text: ${text[lang]}`)
  assert.ok(!html.includes(escapeHtml(text[lang === 'en' ? 'zh' : 'en'])), 'Text leaked from the other locale')
}
const assertNoPlayerEmbed = html => assert.doesNotMatch(html, /<(?:iframe|embed|object|script)\b/i)

const codeBlock = {
  id: 'fixture-code', kind: 'code', language: 'html',
  title: localized('夹具：代码文本', 'Fixture: code text'),
  code: '<script>alert("fixture")</script>\n<img src="x" onerror="alert(1)"> & \'quoted\'',
  caption: localized('这段内容只应显示为文本。', 'This content must remain text.'),
}
const tableBlock = {
  id: 'fixture-table', kind: 'table',
  title: localized('夹具：说明表', 'Fixture: explanatory table'),
  columns: [localized('模块', 'Module'), localized('说明', 'Explanation')],
  rows: [
    [localized('输入行', 'Input row'), localized('合成夹具，不是实验结果。', 'Synthetic fixture, not an experiment result.')],
    [localized('输出行', 'Output row'), localized('<img src="x">应转义', '<img src="x">must be escaped')],
  ],
  caption: localized('首列是行标题。', 'The first column contains row headers.'),
}
const mathBlock = {
  id: 'fixture-math', kind: 'math',
  title: localized('夹具：公式', 'Fixture: equation'),
  latex: String.raw`y = \sigma\left(\sum_{i=1}^{2} w_i x_i + b\right)`,
  explanation: localized('公式的可读文字说明。', 'A readable explanation of the equation.'),
  caption: localized('只验证数学标记的输出。', 'Only mathematical markup output is checked.'),
}
const videoBlock = {
  id: 'fixture-video', kind: 'video',
  title: localized('夹具：本地视频', 'Fixture: same-site video'),
  source: {
    kind: 'local', src: '/media/fixture-demo.mp4', mimeType: 'video/mp4', poster: '/media/fixture-poster.svg',
    captions: [
      { src: '/media/fixture-zh.vtt', language: 'zh', label: localized('中文字幕轨', 'Chinese caption track') },
      { src: '/media/fixture-en.vtt', language: 'en', label: localized('英文字幕轨', 'English caption track') },
    ],
  },
  transcript: localized('画面显示一个测试方块；这是人工夹具。', 'The sequence shows a test square; this is an artificial fixture.'),
  caption: localized('此夹具不提供真实媒体文件。', 'No real media file is supplied by this fixture.'),
}
const projectFixture = demo => ({
  slug: 'fixture-project', title: localized('项目夹具', 'Project fixture'), description: localized('人工数据', 'Artificial data'),
  category: 'engineering', year: 2026, cover: '/images/fixture.svg', tags: ['Fixture'],
  status: 'prototype', sourceAvailability: 'local', demo,
  details: {
    problem: localized('夹具问题', 'Fixture problem'), contributions: [], contributionNote: localized('夹具边界', 'Fixture boundary'),
    architecture: [], architectureNote: localized('夹具结构', 'Fixture architecture'), implementation: [],
    results: [], limitations: [], nextSteps: [], reviewed: '2026-10-11',
  },
})

for (const lang of ['zh', 'en']) for (const base of ['/', '/portfolio/']) {
  const options = { lang, base }
  const suffix = `${lang}; base=${base}`
  const prefix = base.replace(/\/+$/, '')

  test(`component SSR: code is escaped, localized and focusable (${suffix})`, async () => {
    const { html } = await renderComponent('ProjectContentBlock', { block: codeBlock }, options)
    assertLocalized(html, codeBlock.title, lang)
    assertLocalized(html, codeBlock.caption, lang)
    assert.equal(html.match(/<code\b[^>]*>([\s\S]*?)<\/code>/)?.[1], escapeHtml(codeBlock.code))
    assert.equal(attribute(tags(html, 'pre')[0], 'tabindex'), '0')
    assert.equal(attribute(tags(html, 'pre')[0], 'aria-label'), codeBlock.title[lang])
    assert.doesNotMatch(html, /<(?:script|img)\b/i)
  })

  test(`component SSR: table has caption, column and row headers (${suffix})`, async () => {
    const { html } = await renderComponent('ProjectContentBlock', { block: tableBlock }, options)
    assertLocalized(html, tableBlock.title, lang)
    assertLocalized(html, tableBlock.caption, lang)
    assert.match(html, new RegExp(`<caption\\b[^>]*>${tableBlock.title[lang]}</caption>`))
    const headings = tags(html, 'th')
    assert.equal(headings.filter(tag => attribute(tag, 'scope') === 'col').length, tableBlock.columns.length)
    assert.equal(headings.filter(tag => attribute(tag, 'scope') === 'row').length, tableBlock.rows.length)
    for (const text of [...tableBlock.columns, ...tableBlock.rows.flat()]) assertLocalized(html, text, lang)
    assert.ok(tags(html, 'div').some(tag => attribute(tag, 'role') === 'region' && attribute(tag, 'tabindex') === '0' && attribute(tag, 'aria-label') === tableBlock.title[lang]))
    assert.doesNotMatch(html, /<img\b/i)
  })

  test(`component SSR: registered math child emits HTML, MathML and explanation (${suffix})`, async () => {
    const { html } = await renderComponent('ProjectContentBlock', { block: mathBlock }, options)
    assertLocalized(html, mathBlock.title, lang)
    assertLocalized(html, mathBlock.explanation, lang)
    assertLocalized(html, mathBlock.caption, lang)
    assert.match(html, /class="katex-mathml"/)
    assert.match(html, /class="katex-html"[^>]*aria-hidden="true"/)
    assert.match(html, /<math\b/)
    assert.match(html, /<annotation encoding="application\/x-tex">/)
    assert.ok(html.includes(escapeHtml(mathBlock.latex)))
    assert.doesNotMatch(html, /<lazy-project-math-block\b|katex-error/i)
  })

  test(`component SSR: local video is opt-in with captions and text alternative (${suffix})`, async () => {
    const { html, calls } = await renderComponent('ProjectContentBlock', { block: videoBlock }, options)
    assertLocalized(html, videoBlock.title, lang)
    assertLocalized(html, videoBlock.transcript, lang)
    assertLocalized(html, videoBlock.caption, lang)
    const player = tags(html, 'video')[0]
    assert.notEqual(attribute(player, 'controls'), undefined)
    assert.notEqual(attribute(player, 'playsinline'), undefined)
    assert.equal(attribute(player, 'preload'), 'none')
    assert.equal(attribute(player, 'autoplay'), undefined)
    assert.equal(attribute(player, 'poster'), `${prefix}${videoBlock.source.poster}`)
    assert.equal(attribute(player, 'aria-label'), videoBlock.title[lang])
    assert.equal(attribute(tags(html, 'source')[0], 'src'), `${prefix}${videoBlock.source.src}`)
    assert.equal(attribute(tags(html, 'source')[0], 'type'), 'video/mp4')
    const tracks = tags(html, 'track')
    assert.equal(tracks.length, 2)
    for (const track of videoBlock.source.captions) {
      const tag = tracks.find(item => attribute(item, 'srclang') === track.language)
      assert.ok(tag, `Missing ${track.language} caption track`)
      assert.equal(attribute(tag, 'kind'), 'captions')
      assert.equal(attribute(tag, 'src'), `${prefix}${track.src}`)
      assert.equal(attribute(tag, 'label'), track.label[lang])
      assert.equal(attribute(tag, 'default') !== undefined, track.language === lang)
    }
    assert.match(html, /<details\b/)
    assert.ok(html.includes(lang === 'en' ? 'Video text alternative' : '视频文字说明'))
    const link = tags(html, 'a')[0]
    assert.equal(attribute(link, 'href'), `${prefix}${videoBlock.source.src}`)
    assert.equal(attribute(link, 'rel'), 'noopener noreferrer')
    assert.equal(calls.routes.length, 0)
    assert.deepEqual(calls.assets, [videoBlock.source.src, videoBlock.source.poster, ...videoBlock.source.captions.map(track => track.src)])
    assertNoPlayerEmbed(html)
    assert.doesNotMatch(html, /(?:src|poster)="(?:https?:)?\/\//i)
  })

  test(`component SSR: verified remote video is a link, never a loaded player (${suffix})`, async () => {
    const source = { kind: 'verified-external', href: 'https://video.example.org/watch/fixture', verifiedOn: '2026-10-11' }
    const { html, calls } = await renderComponent('ProjectContentBlock', { block: { ...videoBlock, source } }, options)
    const link = tags(html, 'a')[0]
    assert.equal(attribute(link, 'href'), source.href)
    assert.equal(attribute(link, 'target'), '_blank')
    assert.equal(attribute(link, 'rel'), 'noopener noreferrer')
    assert.equal(attribute(link, 'referrerpolicy'), 'no-referrer')
    assert.ok(html.includes(source.verifiedOn))
    assertLocalized(html, videoBlock.transcript, lang)
    assertNoPlayerEmbed(html)
    assert.doesNotMatch(html, /<(?:video|source|track|img|audio)\b/i)
    assert.deepEqual(calls, { assets: [], routes: [] })
  })

  test(`component SSR: demo distinguishes route, public file and external link (${suffix})`, async () => {
    for (const [demo, kind, expected] of [
      ['/lab', 'route', `${prefix}${lang === 'en' ? '/en' : ''}/lab`],
      ['/demos/fixture.html', 'file', `${prefix}/demos/fixture.html`],
      ['https://demo.example.org/fixture', 'external', 'https://demo.example.org/fixture'],
    ]) {
      const { html, calls } = await renderComponent('ProjectCaseStudy', { project: projectFixture(demo) }, options)
      const link = tags(html, 'a').find(tag => attribute(tag, 'class')?.split(' ').includes('btn-primary'))
      assert.ok(link, `Missing ${kind} demo link`)
      assert.equal(attribute(link, 'href'), expected)
      assert.equal(attribute(link, 'data-fixture-nuxt-link') !== undefined, kind === 'route')
      if (kind !== 'route') {
        assert.equal(attribute(link, 'target'), '_blank')
        assert.equal(attribute(link, 'rel'), 'noopener noreferrer')
        assert.equal(attribute(link, 'referrerpolicy'), 'no-referrer')
      }
      assert.deepEqual(calls.routes, kind === 'route' ? [demo] : [])
      assert.deepEqual(calls.assets, kind === 'file' ? [demo] : [])
    }
  })
}

test('component SSR: blank optional code, math and table blocks are not rendered', async () => {
  for (const block of [
    { ...codeBlock, code: ' \n ' }, { ...mathBlock, latex: ' \n ' },
    { ...tableBlock, rows: [] }, { ...tableBlock, columns: [] },
  ]) {
    const { html } = await renderComponent('ProjectContentBlock', { block })
    assert.doesNotMatch(html, /<(?:figure|pre|table|math)\b/i)
  }
})

test('component SSR: KaTeX refuses untrusted URL and HTML commands', async () => {
  for (const latex of [
    String.raw`\href{javascript:alert(1)}{unsafe}`,
    String.raw`\href{https://fixture.example.org/unsafe}{unsafe}`,
    String.raw`\htmlClass{fixture-injected-class}{x}`,
    String.raw`\htmlStyle{position:fixed}{x}`,
    String.raw`\htmlData{fixture-injected=true}{x}`,
    String.raw`\includegraphics{https://fixture.example.org/unsafe.png}`,
  ]) {
    const { html } = await renderComponent('ProjectMathBlock', { block: { ...mathBlock, latex } })
    assertNoPlayerEmbed(html)
    assert.doesNotMatch(html, /<(?:a|img)\b/i)
    assert.doesNotMatch(html, /class="[^"]*fixture-injected-class|style="[^"]*position:fixed|\sdata-fixture-injected=/i)
    assertLocalized(html, mathBlock.explanation, 'zh')
  }
})

test('component SSR: malformed math remains escaped and preserves explanation', async () => {
  const latex = String.raw`\frac{<script>}{`
  const { html } = await renderComponent('ProjectMathBlock', { block: { ...mathBlock, latex } }, { lang: 'en' })
  assert.match(html, /class="katex-error"/)
  assert.doesNotMatch(html, /<script\b/i)
  assert.ok(html.includes('&lt;script&gt;'))
  assertLocalized(html, mathBlock.explanation, 'en')
})

test('component SSR: unsafe local video paths are rejected before base rewriting', async () => {
  for (const src of [
    'https://media.example.org/demo.mp4', '//media.example.org/demo.mp4', 'media/demo.mp4',
    '/media/../secret.mp4', '/media/%2e%2e/secret.mp4', '/media/./demo.mp4',
    '/media/demo.mp4?download=1', '/media/demo.mp4#t=2', '/media\\demo.mp4', '/media/%5cdemo.mp4',
    '/%2fmedia.example.org/demo.mp4', '/media/%00demo.mp4', '/media/demo%20file.mp4', '/media/%broken.mp4',
  ]) {
    const block = { ...videoBlock, source: { ...videoBlock.source, src } }
    const { html, calls } = await renderComponent('ProjectContentBlock', { block }, { lang: 'en', base: '/portfolio/' })
    assert.doesNotMatch(html, /<(?:figure|video|source|track|a)\b/i, src)
    assert.deepEqual(calls, { assets: [], routes: [] }, src)
  }
})

test('component SSR: unsafe poster/caption URLs are dropped without disabling a safe video', async () => {
  const source = {
    ...videoBlock.source,
    poster: 'https://media.example.org/unsafe.png',
    captions: [
      { ...videoBlock.source.captions[0], src: '//media.example.org/unsafe.vtt' },
      { ...videoBlock.source.captions[0], src: '/media/%2e%2e/unsafe.vtt' },
      videoBlock.source.captions[1],
    ],
  }
  const { html, calls } = await renderComponent('ProjectContentBlock', { block: { ...videoBlock, source } }, { lang: 'en', base: '/portfolio/' })
  assert.equal(tags(html, 'video').length, 1)
  assert.equal(attribute(tags(html, 'video')[0], 'poster'), undefined)
  assert.equal(tags(html, 'track').length, 1)
  assert.equal(attribute(tags(html, 'track')[0], 'src'), '/portfolio/media/fixture-en.vtt')
  assert.doesNotMatch(html, /media\.example\.org|unsafe\.vtt/)
  assert.deepEqual(calls.assets, [videoBlock.source.src, videoBlock.source.captions[1].src])
})

test('component SSR: invalid verified-external sources never become media or links', async () => {
  for (const source of [
    { href: 'http://video.example.org/watch', verifiedOn: '2026-10-11' },
    { href: '//video.example.org/watch', verifiedOn: '2026-10-11' },
    { href: 'javascript:alert(1)', verifiedOn: '2026-10-11' },
    { href: 'https://fixture:fake@video.example.org/watch', verifiedOn: '2026-10-11' },
    { href: 'https://video.example.org/watch', verifiedOn: '' },
    { href: 'https://video.example.org/watch', verifiedOn: 'not-a-date' },
  ]) {
    const block = { ...videoBlock, source: { kind: 'verified-external', ...source } }
    const { html, calls } = await renderComponent('ProjectContentBlock', { block })
    assert.doesNotMatch(html, /<(?:figure|video|source|a)\b/i)
    assert.deepEqual(calls, { assets: [], routes: [] })
  }
})

test('component SSR: unsafe demo URLs do not reach route or asset helpers', async () => {
  for (const demo of [
    '//demo.example.org/fixture', 'javascript:alert(1)', 'data:text/html,fixture', 'relative/demo',
    'https://fixture:fake@demo.example.org/fixture', '/demos/../fixture.html', '/demos/%2e%2e/fixture.html',
    '/demos\\fixture.html', '/%2fdemo.example.org/fixture', '/demos/%broken.html',
  ]) {
    const { html, calls } = await renderComponent('ProjectCaseStudy', { project: projectFixture(demo) }, { lang: 'en', base: '/portfolio/' })
    assert.ok(!tags(html, 'a').some(tag => attribute(tag, 'class')?.split(' ').includes('btn-primary')), demo)
    assert.ok(html.includes('A public demo is not available yet.'))
    assert.deepEqual(calls, { assets: [], routes: [] }, demo)
  }
})
