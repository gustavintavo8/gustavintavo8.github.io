import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGithub, FiArrowUpRight, FiMapPin, FiMail, FiLayers, FiTerminal, FiCode, FiExternalLink, FiDownload, FiDatabase } from 'react-icons/fi';
import { FaLinkedin, FaBrain } from 'react-icons/fa';
import Lenis from '@studio-freight/lenis'
import { projects } from './data/projects'

// --- COMPONENTES AUXILIARES ---

const CustomCursor = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (prefersReducedMotion) return;
    const mouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", mouseMove);
    return () => window.removeEventListener("mousemove", mouseMove);
  }, []);

  if (prefersReducedMotion) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-ln-neon rounded-full pointer-events-none z-[100] mix-blend-difference"
        animate={{ x: mousePosition.x - 8, y: mousePosition.y - 8 }}
        transition={{ type: "spring", stiffness: 1000, damping: 50 }}
      />
    </>
  );
};

// --- PANTALLA DE BIENVENIDA ---
const WelcomeScreen = ({ onEnter }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-ln-black z-50 flex flex-col items-center justify-center text-center px-4"
      exit={{
        y: "-100%",
        transition: { duration: 1, ease: [0.76, 0, 0.24, 1] },
      }}
    >
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.05]"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10"
      >
        <p className="text-gray-400 font-mono text-xs md:text-sm mb-6 tracking-widest uppercase">
          EPI Gijón • Universidad de Oviedo
        </p>
        <h1 className="text-7xl md:text-9xl font-display font-bold uppercase text-white mb-8 tracking-tighter">
          Gustavo
          <br />
          <span className="text-ln-neon">Sobrado</span>
        </h1>

        <button
          onClick={onEnter}
          className="group relative px-8 py-4 bg-transparent border border-white/20 overflow-hidden rounded-full hover:border-ln-neon transition-colors duration-300"
        >
          <div className="absolute inset-0 w-0 bg-ln-neon transition-all duration-[250ms] ease-out group-hover:w-full opacity-100"></div>
          <span className="relative flex items-center gap-2 text-white group-hover:text-black font-bold uppercase tracking-widest text-sm transition-colors">
            Iniciar Sistema <FiArrowUpRight />
          </span>
        </button>
      </motion.div>

      <div className="absolute bottom-10 text-gray-600 font-mono text-[10px] md:text-xs tracking-wider">
        INGENIERÍA INFORMÁTICA EN TI • BACKEND • AI SOLUTIONS
      </div>
    </motion.div>
  );
};

// --- TARJETA DE PROYECTO ---
const ProjectCard = ({ project, index }) => {
  const [imgError, setImgError] = useState(false);

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
  );
};

// --- APP PRINCIPAL ---
function App() {
  const [entered, setEntered] = useState(false);
  const [hasFinePointer] = useState(() => window.matchMedia('(pointer: fine)').matches);

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!entered) return;
    const lenis = new Lenis();
    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [entered]);

  return (
    <div className="bg-ln-black min-h-screen text-white font-sans selection:bg-ln-neon selection:text-black">
      {hasFinePointer && <CustomCursor />}
      <div className="fixed inset-0 bg-[url('/noise.svg')] opacity-5 pointer-events-none z-50"></div>

      <AnimatePresence>
        {!entered && <WelcomeScreen onEnter={() => setEntered(true)} />}
      </AnimatePresence>

      {entered && (
        <main className="relative">
          {/* NAVBAR */}
          <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-40 bg-ln-black/80 backdrop-blur-md border-b border-white/5">
            <div className="font-display font-bold text-xl tracking-tighter">
              GS<span className="text-ln-neon">.</span>DEV
            </div>
            <div className="flex gap-6 text-xs md:text-sm font-bold uppercase tracking-wider">
              <a href="#about" className="hover:text-ln-neon transition-colors">
                Perfil
              </a>
              <a href="#stack" className="hover:text-ln-neon transition-colors">
                Stack
              </a>
              <a href="#repos" className="hover:text-ln-neon transition-colors">
                Proyectos
              </a>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
            {/* --- SECCIÓN 1: BIO & PERFIL --- */}
            <section
              id="about"
              className="grid lg:grid-cols-12 gap-12 mb-32 items-center"
            >
              {/* Foto Vertical */}
              <div className="lg:col-span-4 flex justify-center lg:justify-start">
                <div className="relative w-64 h-96 md:w-80 md:h-[500px] group">
                  <div className="absolute inset-0 border-2 border-ln-neon rounded-2xl transform translate-x-4 translate-y-4 transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
                  <div className="absolute inset-0 bg-ln-gray rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 shadow-2xl">
                    <img
                      src="/tufoto.jpg"
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
                      Estudio{" "}
                      <strong>
                        Ingeniería Informática en Tecnologías de la Información
                      </strong>{" "}
                      en la{" "}
                      <span className="text-white">
                        Universidad de Oviedo (EPI Gijón)
                      </span>
                      .
                    </p>
                    <p>
                      Mi filosofía es simple:{" "}
                      <strong>
                        no me basta con que el código funcione, necesito
                        entender el porqué.
                      </strong>{" "}
                      Me apasiona desgranar sistemas complejos, desde la gestión
                      de memoria en C hasta la arquitectura de microservicios.
                    </p>
                    <p>
                      Actualmente enfocado en{" "}
                      <strong>APIs con IA</strong>{" "}
                      (RAG, agentes, function calling) y aplicaciones{" "}
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
                      className="flex items-center gap-2 text-white hover:text-ln-neon transition font-bold"
                    >
                      <FiMail className="text-ln-neon" />{" "}
                      gustavintavo1202@gmail.com
                    </a>
                  </div>
                  <a
                    href="/cv-gustavo-sobrado.pdf"
                    download
                    className="inline-flex items-center gap-2 px-6 py-3 bg-ln-neon text-black font-bold uppercase text-sm tracking-wider rounded-full hover:bg-white transition-colors mt-4"
                  >
                    <FiDownload size={16} /> Descargar CV
                  </a>
                </motion.div>
              </div>
            </section>

            {/* --- SECCIÓN: AHORA MISMO --- */}
            <section id="now" className="mb-32">
              <h3 className="text-sm font-mono text-gray-500 mb-8 uppercase tracking-widest border-b border-white/10 pb-2">
                Ahora mismo
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4 text-gray-400 leading-relaxed border-l-2 border-ln-neon pl-6">
                  <p><strong className="text-white">Trabajando en:</strong> LegalDev, mi API RAG de normativa legal. Migrando a Hugging Face Spaces y mejorando la cobertura de tests.</p>
                  <p><strong className="text-white">Aprendiendo:</strong> Arquitecturas de agentes con LangGraph. TypeScript avanzado. Optimización de consultas PostgreSQL.</p>
                  <p><strong className="text-white">Cursando:</strong> 4º de Ingeniería Informática en TI, Universidad de Oviedo. Trabajando el TFG.</p>
                </div>
                <div className="space-y-4 text-gray-400 leading-relaxed border-l-2 border-white/10 pl-6">
                  <p><strong className="text-white">Enfocado en:</strong> Backend con Python y FastAPI, sistemas con IA (RAG, function calling), y aplicaciones full-stack con Next.js.</p>
                  <p><strong className="text-white">Idiomas:</strong> Español (nativo) · Inglés (B2)</p>
                  <p><strong className="text-white">Ubicación:</strong> Mieres, Asturias, España</p>
                </div>
              </div>
            </section>

            {/* --- SECCIÓN: TRAYECTORIA --- */}
            <section id="trayectoria" className="mb-32">
              <h3 className="text-sm font-mono text-gray-500 mb-8 uppercase tracking-widest border-b border-white/10 pb-2">
                Trayectoria
              </h3>
              <div className="relative border-l-2 border-white/10 pl-8 space-y-10">
                {[
                  {
                    year: "2026",
                    title: "LegalDev",
                    subtitle: "Proyecto personal · En producción",
                    desc: "API RAG de normativa legal para developers. Python, FastAPI, ChromaDB, LangChain. 69 tests, 84% cobertura.",
                  },
                  {
                    year: "2025",
                    title: "PachagasApp",
                    subtitle: "Proyecto personal · En producción",
                    desc: "Plataforma full-stack para organizar partidos de fútbol. 31 usuarios reales. Next.js, Supabase, Vercel AI SDK.",
                  },
                  {
                    year: "2025",
                    title: "Matrícula de Honor",
                    subtitle: "Universidad de Oviedo",
                    desc: "Inteligencia de Negocio & IA. Máxima calificación.",
                  },
                  {
                    year: "2020",
                    title: "Inicio del Grado",
                    subtitle: "Ingeniería Informática en TI · EPI Gijón",
                    desc: "Universidad de Oviedo. Especialización en backend, sistemas y desarrollo de software.",
                  },
                ].map((item) => (
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

            {/* --- SECCIÓN 2: STACK TÉCNICO --- */}
            <div id="stack" className="mb-32">
              <h3 className="text-sm font-mono text-gray-500 mb-8 uppercase tracking-widest border-b border-white/10 pb-2">
                Technical Arsenal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: <FiCode className="text-ln-neon" />,
                    title: "Lenguajes",
                    items: ["Python 3.11", "TypeScript", "Java", "SQL", "C++"],
                  },
                  {
                    icon: <FiDatabase className="text-ln-neon" />,
                    title: "Backend & Datos",
                    items: ["FastAPI", "Next.js", "PostgreSQL", "Supabase", "ChromaDB", "Docker"],
                  },
                  {
                    icon: <FaBrain className="text-ln-neon" />,
                    title: "IA & LLMs",
                    items: ["LangChain", "RAG", "Function calling", "Groq", "Vercel AI SDK"],
                  },
                  {
                    icon: <FiLayers className="text-ln-neon" />,
                    title: "Frontend",
                    items: ["React 19", "Next.js", "Tailwind CSS", "Framer Motion"],
                  },
                  {
                    icon: <FiTerminal className="text-ln-neon" />,
                    title: "DevOps & Testing",
                    items: ["Git", "Docker", "Playwright", "pytest", "Linux"],
                  },
                ].map((category) => (
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
            </div>

            {/* --- SECCIÓN 3: PROYECTOS --- */}
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
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-ln-neon transition-colors font-mono text-sm border border-white/10 hover:border-ln-neon/40 px-5 py-3 rounded-full"
                >
                  <FiGithub /> Más en GitHub <FiArrowUpRight />
                </a>
              </div>
            </section>
          </div>

          {/* FOOTER */}
          <footer className="border-t border-white/10 bg-[#050505] py-20 text-center">
            <h2 className="text-3xl font-display font-bold uppercase mb-8">
              ¿Hablamos?
            </h2>
            <div className="flex justify-center gap-8 mb-12 items-center">
              <a
                href="https://github.com/gustavintavo8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-ln-neon transition text-2xl"
              >
                <FiGithub />
              </a>
              <a
                href="https://www.linkedin.com/in/gustavo-sobrado-aller-a296961a7/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-ln-neon transition text-2xl"
              >
                <FaLinkedin />
              </a>
              <a
                href="mailto:gustavintavo1202@gmail.com"
                className="text-gray-400 hover:text-ln-neon transition text-2xl"
              >
                <FiMail />
              </a>
              <a
                href="/cv-gustavo-sobrado.pdf"
                download
                className="text-gray-400 hover:text-ln-neon transition text-sm font-mono"
              >
                CV.pdf
              </a>
            </div>
            <p className="text-gray-600 font-mono text-xs">
              © {new Date().getFullYear()} Gustavo Sobrado Aller. <br />
              Ingeniería Informática en Tecnologías de la Información.
            </p>
          </footer>
        </main>
      )}
    </div>
  );
}

export default App;
