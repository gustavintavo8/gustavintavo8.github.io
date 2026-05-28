import matter from 'gray-matter'

const postFiles = import.meta.glob('/src/content/posts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

let _cachedPosts = null

function parseDate(d) {
  if (d instanceof Date) return d.toISOString().split('T')[0]
  return String(d)
}

export function loadPosts() {
  if (_cachedPosts) return _cachedPosts
  _cachedPosts = Object.entries(postFiles)
    .map(([, raw]) => {
      const { data, content } = matter(raw)
      return {
        slug: data.slug,
        title: data.title,
        date: parseDate(data.date),
        tags: data.tags || [],
        summary: data.summary || '',
        readingTime: data.readingTime || 5,
        cover: data.cover || null,
        content,
      }
    })
    .filter((p) => p.slug)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  return _cachedPosts
}

export function getPostBySlug(slug) {
  return loadPosts().find((p) => p.slug === slug)
}
