import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <main className="relative">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {children}
      </div>
      <Footer />
    </main>
  )
}
