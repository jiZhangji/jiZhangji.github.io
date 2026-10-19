// Client-side search index → /search.json?locale=zh|en
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const locale = query.locale === 'en' ? 'en' : 'zh'

  const posts = await fetchPosts(event, locale)

  setHeader(event, 'content-type', 'application/json; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=600')

  return posts.map((post) => ({
    title: post.title || post.path,
    description: post.description || '',
    path: routePath(post.path, locale),
    date: post.date || '',
    category: post.category || '',
    tags: post.tags || [],
  }))
})
