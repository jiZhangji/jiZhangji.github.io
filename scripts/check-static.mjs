import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { projects } from '../data/projects.ts'
import { normalizeBase, stripBase } from './static-paths.mjs'

const root = fileURLToPath(new URL('../.output/public/', import.meta.url))
if (!existsSync(root)) throw new Error('Run npm run generate before checking static output.')
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)])
const allFiles = walk(root)
const pages = allFiles.filter(path => path.endsWith('.html') && !path.includes(`${sep}experiments${sep}`) && !/[/\\](200|404)\.html$/.test(path))
const failures = []
let linksChecked = 0
const base = normalizeBase(process.env.NUXT_APP_BASE_URL || '/')
function fileFor(pathname) {
  const file = resolve(root, `.${pathname}`)
  if (!file.startsWith(resolve(root) + sep) && file !== resolve(root)) return null
  if (existsSync(file) && statSync(file).isFile()) return file
  if (existsSync(join(file, 'index.html'))) return join(file, 'index.html')
  if (existsSync(file + '.html')) return file + '.html'
  return null
}
for (const page of pages) {
  const html = readFileSync(page, 'utf8')
  for (const [, href] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"<>]*)"/g)) {
    let clean
    try { clean = stripBase(decodeURIComponent(href.split(/[?#]/)[0].replace(/&amp;/g, '&')), base) }
    catch { failures.push(`${page.slice(root.length)}: invalid URL encoding`); continue }
    linksChecked++
    if (clean === null || !fileFor(clean)) failures.push(`${page.slice(root.length)} -> ${href}`)
  }
  if (!/<html[^>]+lang="(?:zh-CN|en-US|en)"/.test(html)) failures.push(`${page.slice(root.length)}: missing page language`)
  if (!/<title>[^<]+<\/title>/.test(html)) failures.push(`${page.slice(root.length)}: missing title`)
  if (!/<link[^>]+rel="canonical"/.test(html)) failures.push(`${page.slice(root.length)}: missing canonical`)
  if (!/<meta[^>]+name="description"[^>]+content="[^"]+"/.test(html)) failures.push(`${page.slice(root.length)}: missing description`)
}
for (const project of projects) {
  for (const locale of ['', '/en']) {
    const path = `${locale}/projects/${project.slug}`
    const page = fileFor(path)
    if (!page) { failures.push(`Required project missing: ${path}`); continue }
    const html = readFileSync(page, 'utf8')
    if (project.details && !html.includes('id="architecture"')) failures.push(`Case study missing: ${path}`)
  }
}
for (const required of ['/', '/research', '/publications', '/projects', '/projects/pelican-lab', '/about', '/contact', '/cv', '/blog', '/en', '/en/research', '/en/projects', '/feed.xml', '/en/feed.xml', '/sitemap.xml', '/robots.txt', '/experiments/pelican/frontier/index.html', '/experiments/pelican/codex/index.html', '/experiments/pelican/workbuddy/index.html']) {
  if (!fileFor(required)) failures.push(`Required route missing: ${required}`)
}
const mathPage = fileFor('/blog/notes/building-a-research-notebook')
for (const route of ['/lab', '/en/lab']) {
  const page = fileFor(route)
  if (!page || !readFileSync(page, 'utf8').includes('connect-four')) failures.push(`Interactive lab missing: ${route}`)
}
if (!mathPage || !readFileSync(mathPage, 'utf8').includes('katex')) failures.push('KaTeX output missing from the example article')
for (const path of ['feed.xml', 'en/feed.xml', 'sitemap.xml', 'search.json']) {
  const text = readFileSync(join(root, path), 'utf8')
  if (/codehack-jetbrains|embedded-100-days|ai-logo-generation/.test(text)) failures.push(`Reference content leaked into ${path}`)
}
const report = { basePath: base, htmlPages: pages.length, localLinksChecked: linksChecked, failures: [...new Set(failures)] }
console.log(JSON.stringify(report, null, 2))
if (report.failures.length) process.exitCode = 1
