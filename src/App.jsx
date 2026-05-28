import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Lenis from '@studio-freight/lenis'
import CustomCursor from './components/CustomCursor'
import Layout from './components/Layout'
import SEO from './components/SEO'
import HeroSection from './sections/HeroSection'
import AboutSection from './sections/AboutSection'
import NowSection from './sections/NowSection'
import TrayectoriaSection from './sections/TrayectoriaSection'
import StackSection from './sections/StackSection'
import ProjectsSection from './sections/ProjectsSection'

function App() {
  const [entered, setEntered] = useState(false)
  const [hasFinePointer] = useState(() => window.matchMedia('(pointer: fine)').matches)

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!entered) return
    const lenis = new Lenis()
    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [entered])

  return (
    <div className="bg-ln-black min-h-screen text-white font-sans selection:bg-ln-neon selection:text-black">
      <SEO />
      {hasFinePointer && <CustomCursor />}
      <div className="fixed inset-0 bg-[url('/noise.svg')] opacity-5 pointer-events-none z-50" />

      <AnimatePresence>
        {!entered && <HeroSection onEnter={() => setEntered(true)} />}
      </AnimatePresence>

      {entered && (
        <Layout>
          <AboutSection />
          <NowSection />
          <TrayectoriaSection />
          <StackSection />
          <ProjectsSection />
        </Layout>
      )}
    </div>
  )
}

export default App
