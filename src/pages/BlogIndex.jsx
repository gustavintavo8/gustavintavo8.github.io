import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { loadPosts } from '../lib/posts'
import SEO from '../components/SEO'

export default function BlogIndex() {
  const posts = loadPosts()

  return (
    <>
      <SEO title="Blog" description="Artículos sobre backend, IA y proyectos reales de software." />
      <section className="mb-16">
        <h2 className="text-4xl md:text-6xl font-display font-bold uppercase mb-4">
          Blog
        </h2>
        <p className="text-gray-500 font-mono text-sm">
          Post-mortems, decisiones técnicas y cosas que aprendí construyendo software.
        </p>
      </section>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-gray-500 font-mono">Próximamente...</p>
        ) : (
          posts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group border border-white/10 rounded-xl p-6 hover:border-ln-neon/40 transition-colors bg-[#0a0a0a]"
            >
              <Link to={`/blog/${post.slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ln-neon rounded-lg">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-gray-500">{post.date}</span>
                  <span className="text-xs font-mono text-gray-600">·</span>
                  <span className="text-xs font-mono text-gray-500">{post.readingTime} min</span>
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-ln-neon transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{post.summary}</p>
              </Link>
            </motion.article>
          ))
        )}
      </div>
    </>
  )
}
