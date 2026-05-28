import { FiGithub, FiArrowUpRight } from 'react-icons/fi'
import { projects } from '../data/projects'
import ProjectCard from '../components/ProjectCard'

export default function ProjectsSection() {
  return (
    <section id="repos">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="text-4xl md:text-6xl font-display font-bold uppercase">
            Proyectos <br />
            Destacados
          </h2>
          <p className="text-gray-500 font-mono text-sm mt-3">
            Proyectos reales en producción
          </p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-gray-500 font-mono text-sm">
            ENGINEERING PORTFOLIO
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={i}
          />
        ))}
      </div>

      <div className="mt-10 text-center">
        <a
          href="https://github.com/gustavintavo8"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-ln-neon transition-colors font-mono text-sm border border-white/10 hover:border-ln-neon/40 px-5 py-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ln-neon"
        >
          <FiGithub /> Más en GitHub <FiArrowUpRight />
        </a>
      </div>
    </section>
  )
}
