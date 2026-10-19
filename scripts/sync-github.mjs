import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { isIP } from 'node:net'
import { profile } from '../data/profile.ts'
import { projects } from '../data/projects.ts'
import { researchTopics } from '../data/research.ts'
import { skillGroups } from '../data/skills.ts'
import { publications, publicationStatusLabels } from '../data/publications.ts'
import { projectStatusLabels } from '../data/project-types.ts'

const root = fileURLToPath(new URL('../', import.meta.url))
const selected = projects.filter(project => project.featured)
const fence = String.fromCharCode(96).repeat(3)
const clean = text => text.replaceAll('|', '\\|').replaceAll('\n', ' ')
const bullets = (items, lang = 'en') => items.map(item => `- ${item[lang]}`).join('\n')

export function renderContentBlock(block) {
  const heading = `### ${block.title.en}\n\n`
  const caption = block.caption ? `\n\n${block.caption.en}` : ''
  if (block.kind === 'code') {
    const delimiter = String.fromCharCode(96).repeat(Math.max(3, ...[...block.code.matchAll(/`+/g)].map(match => match[0].length + 1)))
    const language = /^[a-z\d_+-]+$/i.test(block.language) ? block.language : ''
    return `${heading}${delimiter}${language}\n${block.code}\n${delimiter}${caption}`
  }
  if (block.kind === 'math') return `${heading}${fence}math\n${block.latex}\n${fence}\n\n${block.explanation.en}${caption}`
  if (block.kind === 'table') {
    const row = cells => `| ${cells.map(cell => clean(cell.en)).join(' | ')} |`
    return `${heading}${row(block.columns)}\n| ${block.columns.map(() => '---').join(' | ')} |\n${block.rows.map(row).join('\n')}${caption}`
  }
  if (block.kind === 'video') {
    const link = block.source.kind === 'local' ? `../../../public${block.source.src}` : block.source.href
    return `${heading}[Open video](${link})\n\n${block.transcript.en}${caption}`
  }
  throw new Error(`Unsupported content block: ${block.kind}`)
}

export function normalizeSiteUrl(value = '') {
  if (!value) return ''
  const url = new URL(value)
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  const [first, second] = host.split('.').map(Number)
  const privateV4 = isIP(host) === 4 && (first === 0 || first === 10 || first === 127 || first >= 224 ||
    (first === 100 && second >= 64 && second <= 127) || (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)))
  const privateV6 = isIP(host) === 6 && (host === '::' || host === '::1' || /^(?:f[cd]|fe[89ab]|::ffff:)/.test(host))
  const localName = /(?:^|\.)(?:localhost|local|internal)$/.test(host) || (!isIP(host) && !host.includes('.'))
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || privateV4 || privateV6 || localName) {
    throw new Error('Use a confirmed public HTTPS site URL, without credentials, query, or fragment.')
  }
  return url.href.replace(/\/+$/, '')
}

export function renderProfile(siteUrl = '') {
  const base = normalizeSiteUrl(siteUrl)
  const projectTitle = project => base ? `[${clean(project.title.en)}](${base}/en/projects/${project.slug})` : clean(project.title.en)
  return `<!-- Generated from data/. Do not maintain a second project catalog here. -->
# ${profile.name}

${profile.role.en}

${profile.bio.en}

${profile.bio.zh}

## Research interests

${researchTopics.map(topic => `- ${topic.title.en}`).join('\n')}

## Selected work

| Project | Focus | Status |
| --- | --- | --- |
${selected.map(project => `| ${projectTitle(project)} | ${clean(project.description.en)} | ${projectStatusLabels[project.status].en} |`).join('\n')}

Research entries are high-level overviews. Unreleased manuscripts, datasets, weights, and private source are not distributed through this profile. Implementation scope is not a claim of sole authorship or universal performance gains.

## Technical focus

${skillGroups.map(group => `- **${group.title.en}:** ${group.tools.join(' · ')}`).join('\n')}

These technologies are present in the project source; they are not proficiency ratings.

## Publications

${publications.length ? publications.map(publication => `- ${publication.title} — ${publication.venue}, ${publication.year} · ${publicationStatusLabels[publication.status].en}`).join('\n') : 'Public bibliographic details are being verified. Manuscripts and submissions are not presented as accepted or published work.'}

## Find me

- [GitHub](${profile.github})
${base ? `- [Personal website](${base})\n- [Publications](${base}/en/publications)\n` : ''}${profile.email ? `- [Email](mailto:${profile.email})\n` : ''}${profile.scholar ? `- [Google Scholar](${profile.scholar})\n` : ''}
<!-- No live stats widgets, tracking pixels, or unverified star counts. -->
`
}

export function renderProject(project, siteUrl = '') {
  const details = project.details
  if (!details) throw new Error(`No case study: ${project.slug}`)
  const base = normalizeSiteUrl(siteUrl)
  const blocks = section => (details.contentBlocks?.[section] || []).map(renderContentBlock).join('\n\n')
  const demo = project.demo && (/^https?:\/\//.test(project.demo) ? project.demo : base ? `${base}${/\.[a-z\d]+(?:[?#]|$)/i.test(project.demo) ? '' : '/en'}${project.demo}` : '')
  const architecture = details.architecture.map((step, index) => `  n${index}["${step.title.en.replaceAll('"', '&quot;')}"]`).join('\n')
  const edges = details.architecture.slice(1).map((_, index) => `  n${index} --> n${index + 1}`).join('\n')
  const commands = project.slug === 'interactive-lab'
    ? `This module is part of the Nuxt site. In an authorized development environment with Node.js ≥ 22.13 and the locked dependencies available:\n\n\`\`\`sh\nnpm run test:lab\nnpm run generate\nnode scripts/serve-static.mjs --host 127.0.0.1 --port 4178\n\`\`\`\n\nOpen /lab or /en/lab. Do not start a local service when server-first execution is required.\n`
    : `This is a documentation draft, not a standalone code release. Do not claim that cloning this website installs the research project. A verified source version, license, authorized data, and environment-specific instructions must be supplied before a reproducible quick start can be published.\n`
  return `<!-- Generated from data/. Review release permissions before copying to another repository. -->
# ${project.title.en}

${project.description.en}

${project.description.zh}

**Status:** ${projectStatusLabels[project.status].en} · Content reviewed ${details.reviewed}

## Problem

${details.problem.en}

${details.problem.zh}

## Features and implementation scope

${bullets(details.contributions)}

${details.contributionNote.en}

## Architecture

${fence}mermaid
flowchart LR
${architecture}
${edges}
${fence}

${details.architectureNote.en}

![${project.title.en} architecture schematic](../../../public${project.cover})

This original SVG is a schematic, not a runtime screenshot. Keep the linked asset when reusing this draft.

## Implementation

${bullets(details.implementation)}

**Stack:** ${project.tags.join(' · ')}

${blocks('implementation')}

## Installation and quick start

${commands}
## Configuration and data

Use non-sensitive example configuration only. Do not add credentials, private machine paths, datasets, or checkpoints to a release. Code licensing does not grant rights to redistribute datasets or model weights.

## Evidence and limitations

${bullets(details.results)}

${bullets(details.limitations)}

No benchmark values are fabricated. This documentation refresh does not rerun research experiments.

${blocks('results')}

## Demo and source

${project.demo ? demo ? `[Open the demo](${demo})` : `The site includes an interactive demo at ${project.demo}. A confirmed public site URL is needed before an external link can be generated.` : 'No public demo is linked yet. Architecture illustrations must not be labelled as runtime screenshots.'}

${blocks('demo')}

${project.repository ? `[Verified source entry](${project.repository})` : 'A verified public source release has not been linked. This file does not grant access to private code.'}

## Next steps

${bullets(details.nextSteps)}

## Citation and license

Do not invent a citation or publication status. Add a verified public citation only after title, authors, venue, year, and status are confirmed. Preserve upstream licenses; this draft does not assign a license to another project.
`
}

export function generatedFiles(siteUrl = '') {
  return new Map([
    ['github/PROFILE_README.md', renderProfile(siteUrl)],
    ...selected.map(project => [`github/projects/${project.slug}/README.md`, renderProject(project, siteUrl)]),
  ])
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const siteArgument = process.argv.find(argument => argument.startsWith('--site-url='))
  const siteUrl = siteArgument?.slice('--site-url='.length) || ''
  const check = process.argv.includes('--check')
  const failures = []
  for (const [relative, expected] of generatedFiles(siteUrl)) {
    const output = resolve(root, relative)
    if (check) {
      try { if (readFileSync(output, 'utf8').replaceAll('\r\n', '\n') !== expected) failures.push(relative) } catch { failures.push(relative) }
    } else {
      mkdirSync(dirname(output), { recursive: true })
      writeFileSync(output, expected)
    }
  }
  if (failures.length) { console.error(`Out-of-date GitHub drafts: ${failures.join(', ')}. Run npm run docs:github.`); process.exitCode = 1 }
  else console.log(check ? 'GitHub drafts match the shared data.' : 'Generated GitHub drafts. No remote repository was modified.')
}
