import { FiGithub, FiMail, FiDownload } from 'react-icons/fi'
import { FaLinkedin } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050505] py-20 text-center">
      <h2 className="text-3xl font-display font-bold uppercase mb-8">
        ¿Hablamos?
      </h2>
      <div className="flex justify-center gap-8 mb-12 items-center">
        <a
          href="https://github.com/gustavintavo8"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="text-gray-400 hover:text-ln-neon transition text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ln-neon rounded"
        >
          <FiGithub />
        </a>
        <a
          href="https://www.linkedin.com/in/gustavo-sobrado-aller-a296961a7/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="text-gray-400 hover:text-ln-neon transition text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ln-neon rounded"
        >
          <FaLinkedin />
        </a>
        <a
          href="mailto:gustavintavo1202@gmail.com"
          aria-label="Email"
          className="text-gray-400 hover:text-ln-neon transition text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ln-neon rounded"
        >
          <FiMail />
        </a>
        <a
          href="/cv-gustavo-sobrado.pdf"
          download
          className="text-gray-400 hover:text-ln-neon transition text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ln-neon rounded"
        >
          CV.pdf
        </a>
      </div>
      <p className="text-gray-600 font-mono text-xs">
        © {new Date().getFullYear()} Gustavo Sobrado Aller. <br />
        Ingeniería Informática en Tecnologías de la Información.
      </p>
    </footer>
  )
}
