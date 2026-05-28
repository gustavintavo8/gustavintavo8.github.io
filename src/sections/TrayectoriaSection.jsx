import { motion } from 'framer-motion'

const timeline = [
  {
    year: '2026',
    title: 'LegalDev',
    subtitle: 'Proyecto personal · En producción',
    desc: 'API RAG de normativa legal para developers. Python, FastAPI, ChromaDB, LangChain. 69 tests, 84% cobertura.',
  },
  {
    year: '2025',
    title: 'PachagasApp',
    subtitle: 'Proyecto personal · En producción',
    desc: 'Plataforma full-stack para organizar partidos de fútbol. 31 usuarios reales. Next.js, Supabase, Vercel AI SDK.',
  },
  {
    year: '2025',
    title: 'Matrícula de Honor',
    subtitle: 'Universidad de Oviedo',
    desc: 'Inteligencia de Negocio & IA. Máxima calificación.',
  },
  {
    year: '2020',
    title: 'Inicio del Grado',
    subtitle: 'Ingeniería Informática en TI · EPI Gijón',
    desc: 'Universidad de Oviedo. Especialización en backend, sistemas y desarrollo de software.',
  },
]

export default function TrayectoriaSection() {
  return (
    <section id="trayectoria" className="mb-32">
      <h3 className="text-sm font-mono text-gray-500 mb-8 uppercase tracking-widest border-b border-white/10 pb-2">
        Trayectoria
      </h3>
      <div className="relative border-l-2 border-white/10 pl-8 space-y-10">
        {timeline.map((item) => (
          <motion.div
            key={item.year + item.title}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -left-[2.85rem] top-1 w-4 h-4 rounded-full bg-ln-neon border-2 border-ln-black"></div>
            <div className="text-xs font-mono text-ln-neon mb-1">{item.year}</div>
            <h4 className="text-white font-bold text-lg">{item.title}</h4>
            <div className="text-gray-500 text-sm mb-2">{item.subtitle}</div>
            <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
