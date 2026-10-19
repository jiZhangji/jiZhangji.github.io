import { profile } from './data/profile'
/** Personal information is centralized in data/profile.ts. */
export default defineAppConfig({
  site: {
    title: profile.name,
    author: profile.name,
    github: profile.github,
    email: profile.email,
    // Public contact details are opt-in — uncomment only what you want shown
    // on the About / Links pages and as social icons.
    // email: 'you@example.com',
    // qq: 'https://qm.qq.com/q/xxxxxxxx',
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://jizhangji.github.io/zhangji-blog',
  },
  // Friend links (友链) — edit this list freely.
  links: [
    { name: 'Nuxt', url: 'https://nuxt.com', desc: { zh: 'Vue 全栈框架', en: 'The Vue full-stack framework' }, avatar: 'N' },
    { name: 'Nuxt Content', url: 'https://content.nuxt.com', desc: { zh: '文件驱动的 CMS', en: 'File-based CMS' }, avatar: 'C' },
    { name: 'Tailwind CSS', url: 'https://tailwindcss.com', desc: { zh: '原子化 CSS 框架', en: 'Utility-first CSS' }, avatar: 'T' },
    { name: 'Shiki', url: 'https://shiki.style', desc: { zh: '代码高亮引擎', en: 'Syntax highlighter' }, avatar: 'S' },
  ],

  // Categories shown on /categories and used for display labels.
  categories: [
    { slug: 'experiments', name: { zh: '实验记录', en: 'Experiments' } },
    { slug: 'research', name: { zh: '研究', en: 'Research' } },
    { slug: 'notes', name: { zh: '技术笔记', en: 'Notes' } },
    { slug: 'ai', name: { zh: 'AI', en: 'AI' } },
    { slug: 'web', name: { zh: '前端', en: 'Web' } },
    { slug: 'embedded', name: { zh: '嵌入式', en: 'Embedded' } },
    { slug: 'benefits', name: { zh: '福利', en: 'Benefits' } },
    { slug: 'other', name: { zh: '其他', en: 'Other' } },
  ],
})
