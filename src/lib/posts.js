import yaml from 'js-yaml'

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

// Parser de frontmatter compatible con navegador (gray-matter usa Buffer/fs de Node
// y revienta en el cliente). js-yaml es JS puro.
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/

function parseMarkdown(raw) {
  const match = FRONTMATTER_RE.exec(raw)
  if (!match) return { data: {}, content: raw }
  return { data: yaml.load(match[1]) || {}, content: match[2] }
}

export function loadPosts() {
  if (_cachedPosts) return _cachedPosts
  _cachedPosts = Object.entries(postFiles)
    .map(([, raw]) => {
      const { data, content } = parseMarkdown(raw)
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
