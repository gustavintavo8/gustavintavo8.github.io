import { FiCode, FiDatabase, FiLayers, FiTerminal } from 'react-icons/fi'
import { FaBrain } from 'react-icons/fa'

const categories = [
  {
    icon: <FiCode className="text-ln-neon" />,
    title: 'Lenguajes',
    items: ['Python 3.11', 'TypeScript', 'Java', 'SQL', 'C++'],
  },
  {
    icon: <FiDatabase className="text-ln-neon" />,
    title: 'Backend & Datos',
    items: ['FastAPI', 'PostgreSQL', 'Supabase', 'ChromaDB', 'Docker'],
  },
  {
    icon: <FaBrain className="text-ln-neon" />,
    title: 'IA & LLMs',
    items: ['LangChain', 'RAG', 'Function calling', 'Groq', 'Vercel AI SDK'],
  },
  {
    icon: <FiLayers className="text-ln-neon" />,
    title: 'Frontend',
    items: ['React 19', 'Next.js', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    icon: <FiTerminal className="text-ln-neon" />,
    title: 'DevOps & Testing',
    items: ['Git', 'Docker', 'Playwright', 'pytest', 'Linux'],
  },
]

export default function StackSection() {
  return (
    <section id="stack" className="mb-32">
      <h3 className="text-sm font-mono text-gray-500 mb-8 uppercase tracking-widest border-b border-white/10 pb-2">
        Technical Arsenal
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <div key={category.title}>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              {category.icon} {category.title}
            </h4>
            <div className="flex flex-wrap gap-2">
              {category.items.map((t) => (
                <span
                  key={t}
                  className="bg-[#111] border border-white/10 px-3 py-1 rounded text-sm text-gray-300 hover:border-ln-neon transition"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
