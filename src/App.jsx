import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGithub, FiArrowUpRight, FiCpu, FiMapPin, FiMail, FiGitBranch, FiUser, FiLayers, FiTerminal, FiDatabase, FiCode } from 'react-icons/fi';
import { FaJava, FaPython, FaLinux, FaDocker, FaLinkedin, FaBrain } from 'react-icons/fa'; 
import Lenis from '@studio-freight/lenis'

// --- COMPONENTES AUXILIARES ---

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const mouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", mouseMove);
    return () => window.removeEventListener("mousemove", mouseMove);
  }, []);

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
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>

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
          className="group relative px-8 py-4 bg-transparent border border-white/20 overflow-hidden rounded-full hover:border-ln-neon transition-colors duration-300 cursor-none"
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
const ProjectCard = ({ repo, index, isHighlight }) => {
  return (
    <motion.a
      href={repo.html_url}
      target="_blank"
      className={`group bg-[#0a0a0a] border border-white/10 p-8 rounded-xl hover:border-ln-neon/50 transition-all duration-300 flex flex-col h-full cursor-none relative overflow-hidden ${
        isHighlight ? "md:col-span-2 bg-[#0f0f0f]" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      {isHighlight && (
        <div className="absolute top-0 right-0 bg-ln-neon text-black text-xs font-bold px-3 py-1 rounded-bl-lg z-20">
          DESTACADO
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div
          className={`p-3 rounded-lg ${
            isHighlight ? "bg-ln-neon text-black" : "bg-white/5 text-ln-neon"
          }`}
        >
          {repo.icon || <FiGitBranch size={24} />}
        </div>
        <span className="text-xs font-mono text-gray-500 uppercase border border-white/10 px-2 py-1 rounded-full">
          {repo.language || "Dev"}
        </span>
      </div>

      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-ln-neon transition-colors">
        {repo.name}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-grow">
        {repo.description}
      </p>

      <div className="flex items-center gap-2 text-sm text-white font-medium group-hover:translate-x-1 transition-transform mt-auto">
        {repo.html_url !== "#" ? "Ver en GitHub" : "Proyecto Privado"}{" "}
        <FiArrowUpRight className="text-ln-neon" />
      </div>
    </motion.a>
  );
};

// --- APP PRINCIPAL ---
function App() {
  const [entered, setEntered] = useState(false);
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    if (entered) {
      const lenis = new Lenis();
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Aquí mezclamos tus datos reales con el fetch de GitHub
    const manualProjects = [
      {
        id: "highlight-1",
        name: "AI World Cup Predictor 2026",
        language: "Python / AI",
        description:
          "Modelo predictivo basado en Machine Learning para pronosticar resultados del Mundial 2026. Análisis de datasets históricos y estadísticas de jugadores.",
        html_url: "#", // Si no tienes link, pon #
        icon: <FaBrain size={24} />,
      },
    ];

    fetch(
      "https://api.github.com/users/gustavintavo8/repos?sort=updated&per_page=4"
    )
      .then((res) => res.json())
      .then((data) => {
        // Combinamos el manual con los de la API
        setRepos([...manualProjects, ...data]);
      })
      .catch(() => {
        // Fallback si falla la API
        setRepos([
          ...manualProjects,
          {
            id: 1,
            name: "Data-Structures-CPP",
            language: "C++",
            description: "Implementación optimizada de Árboles AVL y Grafos.",
            html_url: "https://github.com/gustavintavo8",
          },
          {
            id: 2,
            name: "Business-Intelligence",
            language: "SQL",
            description:
              "Minería de datos y análisis para toma de decisiones (Matrícula de Honor).",
            html_url: "https://github.com/gustavintavo8",
          },
        ]);
      });
  }, [entered]);

  return (
    <div className="bg-ln-black min-h-screen text-white font-sans selection:bg-ln-neon selection:text-black">
      <CustomCursor />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none z-50"></div>

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
                      Actualmente enfocado en el desarrollo{" "}
                      <strong>Backend, IA</strong> y la{" "}
                      <strong>Gestión Técnica de Proyectos</strong>. Busco ser
                      el puente entre la necesidad del cliente y la solución
                      tecnológica perfecta.
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
                      <FiMapPin className="text-ln-neon" /> Gijón, España
                    </div>
                    <a
                      href="mailto:gustavintavo1202@gmail.com"
                      className="flex items-center gap-2 text-white hover:text-ln-neon transition font-bold"
                    >
                      <FiMail className="text-ln-neon" />{" "}
                      gustavintavo1202@gmail.com
                    </a>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* --- SECCIÓN 2: STACK TÉCNICO --- */}
            <div id="stack" className="mb-32">
              <h3 className="text-sm font-mono text-gray-500 mb-8 uppercase tracking-widest border-b border-white/10 pb-2">
                Technical Arsenal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Lenguajes */}
                <div>
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <FiCode className="text-ln-neon" /> Core Languages
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {["Java (Advanced)", "Python", "C++", "SQL"].map((t) => (
                      <span
                        key={t}
                        className="bg-[#111] border border-white/10 px-3 py-1 rounded text-sm text-gray-300 hover:border-ln-neon transition cursor-none"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Sistemas */}
                <div>
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <FiTerminal className="text-ln-neon" /> Systems & DevOps
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {["Linux", "Docker", "Git", "Bash Scripting"].map((t) => (
                      <span
                        key={t}
                        className="bg-[#111] border border-white/10 px-3 py-1 rounded text-sm text-gray-300 hover:border-ln-neon transition cursor-none"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Áreas de Interés */}
                <div>
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <FiLayers className="text-ln-neon" /> Focus Areas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Backend Dev",
                      "Fullstack",
                      "Team Leading",
                      "AI Solutions",
                    ].map((t) => (
                      <span
                        key={t}
                        className="bg-[#111] border border-white/10 px-3 py-1 rounded text-sm text-gray-300 hover:border-ln-neon transition cursor-none"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
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
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-gray-500 font-mono text-sm">
                    ENGINEERING PORTFOLIO
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {repos.length > 0 ? (
                  repos.map((repo, i) => (
                    <ProjectCard
                      key={repo.id || i}
                      repo={repo}
                      index={i}
                      isHighlight={repo.id === "highlight-1"} // Destacamos el de IA
                    />
                  ))
                ) : (
                  <div className="text-gray-500 font-mono">
                    Cargando proyectos...
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* FOOTER */}
          <footer className="border-t border-white/10 bg-[#050505] py-20 text-center">
            <h2 className="text-3xl font-display font-bold uppercase mb-8">
              ¿Hablamos?
            </h2>
            <div className="flex justify-center gap-8 mb-12">
              <a
                href="https://github.com/gustavintavo8"
                target="_blank"
                className="text-gray-400 hover:text-ln-neon transition text-2xl cursor-none"
              >
                <FiGithub />
              </a>
              <a
                href="https://www.linkedin.com/in/gustavo-sobrado-aller-a296961a7/"
                target="_blank"
                className="text-gray-400 hover:text-ln-neon transition text-2xl cursor-none"
              >
                <FaLinkedin />
              </a>
              <a
                href="mailto:gustavintavo1202@gmail.com"
                className="text-gray-400 hover:text-ln-neon transition text-2xl cursor-none"
              >
                <FiMail />
              </a>
            </div>
            <p className="text-gray-600 font-mono text-xs">
              © 2025 Gustavo Sobrado Aller. <br />
              Ingeniería Informática en Tecnologías de la Información.
            </p>
          </footer>
        </main>
      )}
    </div>
  );
}

export default App;
