/** Syntax / Vue template checks, not a substitute for Nuxt typecheck or build. */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import ts from 'typescript'

const root = fileURLToPath(new URL('../', import.meta.url))
const dirs = ['components', 'composables', 'data', 'layouts', 'lib', 'pages', 'plugins', 'scripts', 'server', 'utils', 'workers']
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)])
const files = [...dirs.flatMap(dir => walk(join(root, dir))), ...['app.vue', 'app.config.ts', 'nuxt.config.ts', 'content.config.ts', 'tailwind.config.ts'].map(file => join(root, file))]
const errors = []
let vueFiles = 0
let codeFiles = 0
for (const filename of files) {
  const source = readFileSync(filename, 'utf8')
  const name = relative(root, filename)
  if (filename.endsWith('.vue')) {
    vueFiles++
    try {
      const parsed = parse(source, { filename })
      for (const error of parsed.errors) errors.push(`${name}: ${String(error)}`)
      const descriptor = parsed.descriptor
      const script = descriptor.script || descriptor.scriptSetup ? compileScript(descriptor, { id: name }) : null
      if (descriptor.template) {
        const template = compileTemplate({ source: descriptor.template.content, filename, id: name, compilerOptions: { bindingMetadata: script?.bindings } })
        for (const error of template.errors) errors.push(`${name}: ${String(error)}`)
      }
    } catch (error) { errors.push(`${name}: ${error.message}`) }
  } else if (/\.(ts|mjs)$/.test(filename)) {
    codeFiles++
    const parsed = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, filename.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JS)
    for (const error of parsed.parseDiagnostics) errors.push(`${name}: ${ts.flattenDiagnosticMessageText(error.messageText, ' ')}`)
  }
}
console.log(JSON.stringify({ scope: 'syntax-and-vue-template-compilation-only', vueFiles, codeFiles, errors }, null, 2))
if (errors.length) process.exitCode = 1
