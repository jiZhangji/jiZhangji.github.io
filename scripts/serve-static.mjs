import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { resolve, sep, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../.output/public/', import.meta.url))
const flag = (name, fallback) => { const at = process.argv.indexOf(name); return at >= 0 ? process.argv[at + 1] : fallback }
const host = flag('--host', '127.0.0.1')
const port = Number(flag('--port', process.env.PORT || '4178'))
if (!existsSync(join(root, 'index.html'))) throw new Error('Static output is missing. Run npm run generate first.')
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf', '.zip': 'application/zip', '.sql': 'text/plain; charset=utf-8', '.wasm': 'application/wasm' }
const server = createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return }
  let pathname
  try { pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname) } catch { res.writeHead(400); res.end('Bad request'); return }
  if (pathname.includes('\\') || pathname.includes('\0')) { res.writeHead(400); res.end('Bad path'); return }
  let file = resolve(root, `.${pathname}`)
  if (file !== resolve(root) && !file.startsWith(`${resolve(root)}${sep}`)) { res.writeHead(403); res.end('Forbidden'); return }
  try {
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
    if (!existsSync(file) && existsSync(`${file}.html`)) file += '.html'
    if (!existsSync(file) || !statSync(file).isFile()) {
      const fallback = join(root, '404.html')
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
      if (req.method === 'HEAD') res.end()
      else if (existsSync(fallback)) createReadStream(fallback).pipe(res)
      else res.end('Not found')
      return
    }
    const stat = statSync(file)
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Content-Length': stat.size, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' })
    if (req.method === 'HEAD') res.end()
    else createReadStream(file).pipe(res)
  } catch { res.writeHead(500); res.end('Read error') }
})
server.on('error', error => { console.error(`Preview failed: ${error.message}`); process.exitCode = 1 })
server.listen(port, host, () => console.log(`Zhang Ji — local preview\nhttp://${host}:${port}\nServing ${root}`))
