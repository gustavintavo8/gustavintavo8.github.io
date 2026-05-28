import { motion } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'

export default function HeroSection({ onEnter }) {
  return (
    <motion.div
      className="fixed inset-0 bg-ln-black z-50 flex flex-col items-center justify-center text-center px-4"
      exit={{ y: '-100%', transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }}
    >
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.05]" />
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
          Gustavo<br />
          <span className="text-ln-neon">Sobrado</span>
        </h1>
        <button
          onClick={onEnter}
          className="group relative px-8 py-4 bg-transparent border border-white/20 overflow-hidden rounded-full hover:border-ln-neon transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ln-neon"
        >
          <div className="absolute inset-0 w-0 bg-ln-neon transition-all duration-[250ms] ease-out group-hover:w-full opacity-100" />
          <span className="relative flex items-center gap-2 text-white group-hover:text-black font-bold uppercase tracking-widest text-sm transition-colors">
            Iniciar Sistema <FiArrowUpRight />
          </span>
        </button>
      </motion.div>
      <div className="absolute bottom-10 text-gray-600 font-mono text-[10px] md:text-xs tracking-wider">
        INGENIERÍA INFORMÁTICA EN TI • BACKEND • AI SOLUTIONS
      </div>
    </motion.div>
  )
}
