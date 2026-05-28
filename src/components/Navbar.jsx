export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-40 bg-ln-black/80 backdrop-blur-md border-b border-white/5">
      <div className="font-display font-bold text-xl tracking-tighter">
        GS<span className="text-ln-neon">.</span>DEV
      </div>
      <div className="flex gap-6 text-xs md:text-sm font-bold uppercase tracking-wider">
        <a href="#about" className="hover:text-ln-neon transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ln-neon rounded">
          Perfil
        </a>
        <a href="#stack" className="hover:text-ln-neon transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ln-neon rounded">
          Stack
        </a>
        <a href="#repos" className="hover:text-ln-neon transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ln-neon rounded">
          Proyectos
        </a>
      </div>
    </nav>
  )
}
