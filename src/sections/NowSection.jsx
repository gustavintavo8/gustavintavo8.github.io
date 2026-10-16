import { motion } from 'framer-motion'

export default function NowSection() {
  return (
    <section id="now" className="mb-32">
      <h3 className="text-sm font-mono text-gray-500 mb-8 uppercase tracking-widest border-b border-white/10 pb-2">
        Ahora mismo
      </h3>
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          className="space-y-4 text-gray-400 leading-relaxed border-l-2 border-ln-neon pl-6"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <p><strong className="text-white">Trabajando en:</strong> Kirey España, como desarrollador backend .NET en el proyecto Sportian: la identidad digital de los fans (OAuth 2.0 / OpenID Connect, CIAM) sobre Azure. En octubre de 2026, nombrado integrador de la plataforma de identidad.</p>
          <p><strong className="text-white">Aprendiendo:</strong> Arquitecturas de agentes con LangGraph. TypeScript avanzado. Optimización de consultas PostgreSQL.</p>
          <p><strong className="text-white">Cursando:</strong> 4º de Ingeniería Informática en TI, Universidad de Oviedo (fin previsto: junio de 2027). Trabajando el TFG.</p>
        </motion.div>
        <motion.div
          className="space-y-4 text-gray-400 leading-relaxed border-l-2 border-white/10 pl-6"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <p><strong className="text-white">Enfocado en:</strong> Backend con C# y .NET e identidad digital en el trabajo; Python, FastAPI y sistemas con IA (RAG, function calling) en mis proyectos.</p>
          <p><strong className="text-white">Idiomas:</strong> Español (nativo) · Inglés (B2)</p>
          <p><strong className="text-white">Ubicación:</strong> Mieres, Asturias, España</p>
        </motion.div>
      </div>
    </section>
  )
}
