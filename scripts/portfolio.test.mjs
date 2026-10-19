import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { projects } from '../data/projects.ts'
import { profile } from '../data/profile.ts'
import { researchTopics } from '../data/research.ts'
import { publications, publicationStatusLabels } from '../data/publications.ts'
import { skillGroups } from '../data/skills.ts'
import { generatedFiles, normalizeSiteUrl, renderProfile, renderContentBlock, renderProject } from './sync-github.mjs'
import { normalizeBase, stripBase } from './static-paths.mjs'

const asset = path => fileURLToPath(new URL(`../public${path}`, import.meta.url))
const localized = value => { assert.ok(value?.zh?.trim()); assert.ok(value?.en?.trim()) }

test('static links support both root and GitHub Pages subpath deployments', () => {
  assert.equal(normalizeBase('/'), '/')
  assert.equal(normalizeBase('portfolio'), '/portfolio/')
  assert.equal(stripBase('/projects/gatemcp'), '/projects/gatemcp')
  assert.equal(stripBase('/portfolio/en/projects/gatemcp', '/portfolio/'), '/en/projects/gatemcp')
  assert.equal(stripBase('/portfolio', '/portfolio/'), '/')
  assert.equal(stripBase('/portfolio-other/page', '/portfolio/'), null)
  assert.equal(stripBase('/images/cover.svg', '/portfolio/'), null)
})

test('project slugs are unique, stable, and safe for routes', () => {
  assert.equal(new Set(projects.map(project => project.slug)).size, projects.length)
  for (const project of projects) assert.match(project.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
})

test('project cards have bilingual copy, covers, and explicit status', () => {
  for (const project of projects) {
    localized(project.title); localized(project.description)
    assert.ok(existsSync(asset(project.cover)), `Cover missing: ${project.cover}`)
    assert.ok(['in-progress', 'implemented', 'prototype'].includes(project.status))
    assert.ok(['local', 'restricted', 'public'].includes(project.sourceAvailability))
    assert.ok(project.tags.length)
  }
})

test('featured projects have complete, bilingual case studies', () => {
  const featured = projects.filter(project => project.featured)
  assert.ok(featured.length >= 3)
  for (const project of featured) {
    const details = project.details
    assert.ok(details)
    localized(details.problem); localized(details.contributionNote); localized(details.architectureNote)
    for (const key of ['contributions', 'implementation', 'results', 'limitations', 'nextSteps']) {
      assert.ok(details[key].length, `${project.slug}: ${key}`)
      details[key].forEach(localized)
    }
    assert.equal(details.architecture.length, 4)
    details.architecture.forEach(step => { localized(step.title); localized(step.description) })
    assert.match(details.reviewed, /^\d{4}-\d{2}-\d{2}$/)
  }
})

test('research and skill links resolve to actual projects', () => {
  const slugs = new Set(projects.map(project => project.slug))
  for (const topic of researchTopics) {
    localized(topic.title); localized(topic.summary)
    for (const slug of topic.relatedProjects || []) assert.ok(slugs.has(slug), slug)
  }
  for (const group of skillGroups) {
    localized(group.title); localized(group.description)
    for (const slug of group.projects) assert.ok(slugs.has(slug), slug)
  }
  assert.deepEqual(profile.skills, [...new Set(skillGroups.flatMap(group => group.tools))])
})

test('optional rich content is bilingual, structurally valid, and grounded in source', () => {
  for (const project of projects) {
    const blocks = Object.values(project.details?.contentBlocks || {}).flat()
    assert.equal(new Set(blocks.map(block => block.id)).size, blocks.length)
    for (const block of blocks) {
      assert.match(block.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      localized(block.title)
      if (block.caption) localized(block.caption)
      if (block.kind === 'code') assert.ok(block.code.trim())
      else if (block.kind === 'math') { assert.ok(block.latex.trim()); localized(block.explanation) }
      else if (block.kind === 'table') {
        assert.ok(block.columns.length && block.rows.length)
        block.columns.forEach(localized)
        block.rows.forEach(row => { assert.equal(row.length, block.columns.length); row.forEach(localized) })
      } else if (block.kind === 'video') {
        localized(block.transcript)
        if (block.source.kind === 'local') assert.ok(existsSync(asset(block.source.src)))
        else { normalizeSiteUrl(block.source.href); assert.match(block.source.verifiedOn, /^\d{4}-\d{2}-\d{2}$/) }
      } else assert.fail(`Unknown content kind: ${block.kind}`)
    }
  }
  const lab = projects.find(project => project.slug === 'interactive-lab')
  const snippet = lab.details.contentBlocks.implementation.find(block => block.id === 'neural-forward-code')
  const source = readFileSync(new URL('../lib/lab/neural.ts', import.meta.url), 'utf8').replaceAll('\r\n', '\n')
  assert.ok(source.includes(snippet.code), 'Displayed code drifted from the actual neural implementation; review the equations too.')
})

test('README rich content preserves math, code fences, tables, and confirmed demo links', () => {
  const title = { en: 'Fixture', zh: '测试夹具' }
  const code = renderContentBlock({ kind: 'code', title, language: 'markdown', code: '```example```' })
  assert.ok(code.includes('````markdown\n```example```\n````'))
  const table = renderContentBlock({ kind: 'table', title, columns: [title], rows: [[{ en: 'A|B', zh: '甲|乙' }]] })
  assert.ok(table.includes('A\\|B'))
  const lab = projects.find(project => project.slug === 'interactive-lab')
  const readme = renderProject(lab, 'https://example.org/portfolio')
  assert.ok(readme.includes('```math'))
  assert.ok(readme.includes('https://example.org/portfolio/en/lab'))
  assert.ok(readme.includes('../../../public/images/projects/interactive-lab.svg'))
})

test('unreleased research has no invented public source, results, or published status', () => {
  for (const project of projects.filter(project => project.category === 'research')) {
    assert.equal(project.status, 'in-progress')
    if (project.sourceAvailability !== 'public') assert.equal(project.repository, undefined)
    assert.doesNotMatch(JSON.stringify(project.details.results), /\d+(?:\.\d+)?\s*(?:%|pp\b)/)
  }
  for (const publication of publications) {
    assert.ok(publicationStatusLabels[publication.status])
    assert.match(publication.verifiedOn, /^\d{4}-\d{2}-\d{2}$/)
    assert.ok(publication.title && publication.authors.length && publication.venue)
  }
})

test('public data does not include local machine paths or credential shapes', () => {
  const payload = JSON.stringify({ projects, profile, researchTopics, publications, skillGroups })
  assert.doesNotMatch(payload, /[A-Z]:[\\/]|\/home\/|\/Users\/|PRIVATE KEY|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{24,}/)
})

test('public URL is explicit and excludes local previews / secrets', () => {
  assert.equal(normalizeSiteUrl(''), '')
  assert.equal(normalizeSiteUrl('https://example.org/portfolio/'), 'https://example.org/portfolio')
  for (const value of ['http://localhost:4050', 'https://127.0.0.1', 'https://172.16.0.2', 'https://100.64.0.1', 'https://169.254.1.1', 'https://[::1]', 'https://[fd00::1]', 'https://[::ffff:127.0.0.1]', 'https://preview.local', 'https://user:pass@example.org', 'https://example.org/?token=test', 'https://example.org/#test']) {
    assert.throws(() => normalizeSiteUrl(value))
  }
  assert.ok(!renderProfile().includes('jizhangji.github.io'))
  assert.ok(renderProfile('https://example.org/portfolio').includes('https://example.org/portfolio/en/projects/gatemcp'))
})

test('profile and project README drafts reuse the exact project descriptions', () => {
  const files = generatedFiles()
  assert.equal(files.size, 1 + projects.filter(project => project.featured).length)
  const profileReadme = files.get('github/PROFILE_README.md')
  for (const project of projects.filter(project => project.featured)) {
    assert.ok(profileReadme.includes(project.description.en))
    assert.ok(files.get(`github/projects/${project.slug}/README.md`).includes(project.description.en))
  }
})

test('generated SVG covers are static and carry accessible descriptions', () => {
  for (const project of projects.filter(project => project.featured)) {
    const svg = readFileSync(asset(project.cover), 'utf8')
    assert.ok(svg.includes('<title') && svg.includes('<desc'))
    assert.doesNotMatch(svg, /<script|<foreignObject|https?:\/\/(?!www.w3.org)/)
  }
})
