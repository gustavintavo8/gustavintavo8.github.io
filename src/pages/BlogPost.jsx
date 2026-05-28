import { useParams, Link, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPostBySlug } from '../lib/posts'
import SEO from '../components/SEO'

export default function BlogPost() {
  const { slug } = useParams()
  const post = getPostBySlug(slug)

  if (!post) return <Navigate to="/blog" replace />

  return (
    <>
      <SEO
        title={post.title}
        description={post.summary}
        url={`https://gustavintavo8.github.io/blog/${slug}`}
      />

      <div className="max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-ln-neon transition-colors font-mono text-sm mb-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ln-neon rounded"
        >
          ← Volver al blog
        </Link>

        <header className="mb-12">
          <div className="flex flex-wrap gap-3 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-500 font-mono text-sm border-t border-white/10 pt-4">
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readingTime} min de lectura</span>
          </div>
        </header>

        <div className="prose prose-invert prose-sm max-w-none
          prose-headings:font-display prose-headings:uppercase prose-headings:text-white
          prose-p:text-gray-400 prose-p:leading-relaxed
          prose-a:text-ln-neon prose-a:no-underline hover:prose-a:underline
          prose-code:text-ln-neon prose-code:bg-white/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-white/10
          prose-strong:text-white
          prose-li:text-gray-400
          prose-hr:border-white/10
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </div>
    </>
  )
}
