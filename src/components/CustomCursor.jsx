import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function CustomCursor() {
  const prefersReducedMotion = useReducedMotion()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (prefersReducedMotion) return
    const mouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', mouseMove)
    return () => window.removeEventListener('mousemove', mouseMove)
  }, [prefersReducedMotion])

  if (prefersReducedMotion) return null

  return (
    <motion.div
      className="fixed top-0 left-0 w-4 h-4 bg-ln-neon rounded-full pointer-events-none z-[100] mix-blend-difference"
      animate={{ x: mousePosition.x - 8, y: mousePosition.y - 8 }}
      transition={{ type: 'spring', stiffness: 1000, damping: 50 }}
    />
  )
}
