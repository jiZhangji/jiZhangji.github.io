import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    /**
     * Every markdown file under `content/` is a page document.
     * Files are organised per locale: `content/zh/...` and `content/en/...`
     */
    content: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string().optional(),
        updated: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional().default([]),
        author: z.string().optional(),
        cover: z.string().optional(),
        draft: z.boolean().optional().default(false),
      }),
    }),
  },
})
