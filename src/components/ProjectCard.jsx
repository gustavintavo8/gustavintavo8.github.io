import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiExternalLink, FiGithub } from 'react-icons/fi'

export default function ProjectCard({ project, index }) {
  const [imgError, setImgError] = useState(false)

  return (
    <motion.div
      className="group bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden flex flex-col hover:border-ln-neon/40 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Cover image area */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        {!imgError ? (
          <img
            src={project.cover}
            alt={project.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0f0f0f 100%)' }}
          >
            <span className="text-ln-neon font-display font-bold text-3xl uppercase tracking-tight">
              {project.name}
            </span>
          </div>
        )}
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />
        {/* Year badge */}
        <span className="absolute top-3 right-3 text-[10px] font-mono text-ln-neon bg-black/70 border border-ln-neon/30 px-2 py-1 rounded-full backdrop-blur-sm">
          {project.year}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-6 gap-4">
        {/* Name + tagline */}
        <div>
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-ln-neon transition-colors">
            {project.name}
          </h3>
          <p className="text-ln-neon text-xs font-mono opacity-80">{project.tagline}</p>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm leading-relaxed">
          {project.description}
        </p>

        {/* Highlights (max 2) */}
        <ul className="space-y-1">
          {project.highlights.slice(0, 2).map((h) => (
            <li key={h} className="flex items-start gap-2 text-xs text-gray-400">
              <span className="text-ln-neon mt-0.5 flex-shrink-0">▸</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>

        {/* Stack chips */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="bg-[#111] border border-white/10 px-2 py-1 rounded text-xs text-gray-300"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2 border-t border-white/5">
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-ln-neon text-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors duration-200"
          >
            <FiExternalLink size={12} /> Ver demo
          </a>
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded border border-white/20 text-gray-300 text-xs font-bold uppercase tracking-wider hover:border-ln-neon hover:text-ln-neon transition-colors duration-200"
          >
            <FiGithub size={12} /> Ver código
          </a>
        </div>
      </div>
    </motion.div>
  )
}
