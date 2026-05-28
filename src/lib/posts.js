import matter from 'gray-matter'

const postFiles = import.meta.glob('/src/content/posts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

export function loadPosts() {
  return Object.entries(postFiles)
    .map(([filepath, raw]) => {
      const { data, content } = matter(raw)
      return {
        slug: data.slug,
        title: data.title,
        date: data.date,
        tags: data.tags || [],
        summary: data.summary || '',
        readingTime: data.readingTime || 5,
        cover: data.cover || null,
        content,
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function getPostBySlug(slug) {
  return loadPosts().find((p) => p.slug === slug)
}
