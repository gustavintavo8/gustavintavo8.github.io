import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `hover:text-ln-neon transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ln-neon rounded ${isActive ? 'text-ln-neon' : ''}`

  return (
    <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-40 bg-ln-black/80 backdrop-blur-md border-b border-white/5">
      <NavLink to="/" className="font-display font-bold text-xl tracking-tighter hover:text-ln-neon transition-colors">
        GS<span className="text-ln-neon">.</span>DEV
      </NavLink>
      <div className="flex gap-6 text-xs md:text-sm font-bold uppercase tracking-wider">
        <NavLink to="/" end className={linkClass}>
          Inicio
        </NavLink>
        <a href="/#stack" className="hover:text-ln-neon transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ln-neon rounded">
          Stack
        </a>
        <a href="/#repos" className="hover:text-ln-neon transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ln-neon rounded">
          Proyectos
        </a>
        <NavLink to="/blog" className={linkClass}>
          Blog
        </NavLink>
      </div>
    </nav>
  )
}
