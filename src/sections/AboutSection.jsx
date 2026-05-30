import { motion } from 'framer-motion'
import { FiMapPin, FiMail, FiTerminal, FiDownload } from 'react-icons/fi'
import { FaBrain } from 'react-icons/fa'

export default function AboutSection() {
  return (
    <section id="about" className="grid lg:grid-cols-12 gap-12 mb-32 items-center">
      {/* Foto Vertical */}
      <div className="lg:col-span-4 flex justify-center lg:justify-start">
        <div className="relative w-64 h-96 md:w-80 md:h-[500px] group">
          <div className="absolute inset-0 border-2 border-ln-neon rounded-2xl transform translate-x-4 translate-y-4 transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
          <div className="absolute inset-0 bg-ln-gray rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 shadow-2xl">
            <img
              src="/tufoto.png"
              alt="Gustavo Sobrado"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </div>

      {/* Texto Narrativo */}
      <div className="lg:col-span-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ln-neon/10 text-ln-neon text-xs font-mono mb-6 border border-ln-neon/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ln-neon opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-ln-neon"></span>
            </span>
            Disponible para proyectos
          </div>

          <h2 className="text-5xl md:text-7xl font-display font-bold uppercase leading-[0.9] mb-6">
            Ingeniero <br />
            <span className="text-ln-neon">Full Stack & AI</span>
          </h2>

          <div className="space-y-4 text-gray-400 text-lg leading-relaxed max-w-2xl border-l-2 border-white/10 pl-6">
            <p>
              Estudio{' '}
              <strong>
                Ingeniería Informática en Tecnologías de la Información
              </strong>{' '}
              en la{' '}
              <span className="text-white">
                Universidad de Oviedo (EPI Gijón)
              </span>
              .
            </p>
            <p>
              Mi filosofía es simple:{' '}
              <strong>
                no me basta con que el código funcione, necesito
                entender el porqué.
              </strong>{' '}
              Me apasiona desgranar sistemas complejos, desde la gestión
              de memoria en C hasta la arquitectura de microservicios.
            </p>
            <p>
              Actualmente enfocado en{' '}
              <strong>APIs con IA</strong>{' '}
              (RAG, agentes, function calling) y aplicaciones{' '}
              <strong>full-stack</strong> con Python y Next.js. Busco
              proyectos donde la IA aporte valor real, no solo como
              hype.
            </p>
          </div>

          {/* Datos Académicos Destacados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-[#111] p-4 rounded border border-white/5 flex items-center gap-3">
              <FaBrain className="text-ln-neon text-xl" />
              <div>
                <div className="text-white font-bold text-sm">
                  Matrícula de Honor
                </div>
                <div className="text-gray-500 text-xs">
                  Inteligencia de Negocio & IA
                </div>
              </div>
            </div>
            <div className="bg-[#111] p-4 rounded border border-white/5 flex items-center gap-3">
              <FiTerminal className="text-ln-neon text-xl" />
              <div>
                <div className="text-white font-bold text-sm">
                  Top Performance
                </div>
                <div className="text-gray-500 text-xs">
                  Arquitectura & Estructuras de Datos
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-white/10 font-mono text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <FiMapPin className="text-ln-neon" /> Mieres, Asturias, España
            </div>
            <a
              href="mailto:gustavintavo1202@gmail.com"
              className="flex items-center gap-2 text-white hover:text-ln-neon transition font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ln-neon rounded"
            >
              <FiMail className="text-ln-neon" />{' '}
              gustavintavo1202@gmail.com
            </a>
          </div>
          <a
            href="/cv-gustavo-sobrado.pdf"
            download
            className="inline-flex items-center gap-2 px-6 py-3 bg-ln-neon text-black font-bold uppercase text-sm tracking-wider rounded-full hover:bg-white transition-colors mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ln-neon"
          >
            <FiDownload size={16} /> Descargar CV
          </a>
        </motion.div>
      </div>
    </section>
  )
}
