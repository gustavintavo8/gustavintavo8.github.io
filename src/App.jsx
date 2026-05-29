import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Lenis from '@studio-freight/lenis'

const BlogIndex = lazy(() => import('./pages/BlogIndex'))
const BlogPost = lazy(() => import('./pages/BlogPost'))

function App() {
  useEffect(() => {
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
  }, [])

  return (
    <BrowserRouter>
      <div className="bg-ln-black min-h-screen text-white font-sans selection:bg-ln-neon selection:text-black">
        <div className="fixed inset-0 bg-[url('/noise.svg')] opacity-5 pointer-events-none z-50" />
        <Layout>
          <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-gray-500 font-mono text-sm">Cargando...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
            </Routes>
          </Suspense>
        </Layout>
      </div>
    </BrowserRouter>
  )
}

export default App
