import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import CustomCursor from './components/CustomCursor'
import Layout from './components/Layout'
import HeroSection from './sections/HeroSection'
import Home from './pages/Home'
import BlogIndex from './pages/BlogIndex'
import BlogPost from './pages/BlogPost'
import Lenis from '@studio-freight/lenis'

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
    <BrowserRouter>
      <div className="bg-ln-black min-h-screen text-white font-sans selection:bg-ln-neon selection:text-black">
        {hasFinePointer && <CustomCursor />}
        <div className="fixed inset-0 bg-[url('/noise.svg')] opacity-5 pointer-events-none z-50" />

        <AnimatePresence>
          {!entered && <HeroSection onEnter={() => setEntered(true)} />}
        </AnimatePresence>

        {entered && (
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
            </Routes>
          </Layout>
        )}
      </div>
    </BrowserRouter>
  )
}

export default App
