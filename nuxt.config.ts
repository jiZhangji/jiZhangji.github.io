// Normalised deployment base path, e.g. `/` or `/my-repo/`.
// Set NUXT_APP_BASE_URL when the site is NOT served from the domain root
// (GitHub Pages uses `/<repo>/`).
const baseURL = `${(process.env.NUXT_APP_BASE_URL || '/').replace(/^\/?/, '/').replace(/\/?$/, '/')}`

import { guideChapters } from './data/guide'
import { projects } from './data/projects'

// The guide is Chinese-only; enumerate its routes for prerendering (the crawler
// will find them too, but listing them explicitly keeps the build deterministic).
const guideRoutes = ['/guide', ...guideChapters.map(c => `/guide/${c.slug}`)]
const projectRoutes = projects.flatMap(project => [`/projects/${project.slug}`, `/en/projects/${project.slug}`])

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['katex/dist/katex.min.css'],

  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
  ],

  tailwindcss: {
    cssPath: '~/assets/css/research.css',
    viewer: false,
  },

  content: {
    // Use Node.js built-in `node:sqlite` (Node >= 22.13) instead of better-sqlite3,
    // so the project installs with zero native compilation.
    experimental: { sqliteConnector: 'native' },
    renderer: {
      // Adds visible anchor links + stable `id`s to headings (used by the TOC).
      anchorLinks: { h2: true, h3: true, h4: false },
    },
    build: {
      markdown: {
        remarkPlugins: { 'remark-math': {} },
        rehypePlugins: { 'rehype-katex': { strict: 'ignore', throwOnError: false } },
        toc: { depth: 3, searchDepth: 3 },
        highlight: {
          // Shiki — themed for light & dark mode
          theme: { default: 'github-light', dark: 'github-dark' },
          langs: ['js', 'ts', 'tsx', 'vue', 'json', 'bash', 'yaml', 'md', 'mdx', 'css', 'html', 'python', 'cpp', 'diff'],
        },
      },
    },
  },

  i18n: {
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://jizhangji.github.io',
    locales: [
      { code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'zh',
    strategy: 'prefix_except_default',
    restructureDir: 'i18n',
    langDir: 'locales',
    detectBrowserLanguage: false,
    // Content is read per-locale from `content/<locale>/...`, so no
    // experimental filesystem routing is needed here.
  },

  app: {
    baseURL,
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { name: 'theme-color', content: '#ffffff' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: `${baseURL}favicon.svg` },
        { rel: 'alternate', type: 'application/rss+xml', title: 'RSS', href: `${baseURL}feed.xml` },
      ],
      // Applied before first paint to avoid a flash of the wrong theme.
      script: [
        {
          innerHTML:
            "(function(){try{var t=localStorage.getItem('theme')||'system';" +
            "var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);" +
            "var e=document.documentElement;e.classList.toggle('dark',d);" +
            "e.style.colorScheme=d?'dark':'light';}catch(e){}})();",
          tagPosition: 'head',
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      // Tag routes whose slug contains a dot (e.g. `Three.js`) are skipped by the
      // link crawler because they look like file assets; list them explicitly so
      // they are still prerendered. Add new dotted tags here as content grows.
      routes: ['/', '/en', '/blog', '/en/blog', '/research', '/en/research', '/publications', '/en/publications', '/projects', '/en/projects', '/lab', '/en/lab', '/contact', '/en/contact', '/cv', '/en/cv', '/categories', '/en/categories', '/tags', '/en/tags', '/archive', '/en/archive', '/about', '/en/about', '/links', '/en/links', '/feed.xml', '/en/feed.xml', '/sitemap.xml', '/robots.txt', '/search.json', '/tags/Three.js', '/en/tags/Three.js', ...projectRoutes, ...guideRoutes],
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://jizhangji.github.io',
    },
  },
})
