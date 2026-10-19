// RSS feed for the English locale → /en/feed.xml
export default defineEventHandler(async (event) => {
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')
  return await buildRss(event, 'en')
})
