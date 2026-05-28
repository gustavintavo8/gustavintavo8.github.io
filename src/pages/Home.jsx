import AboutSection from '../sections/AboutSection'
import NowSection from '../sections/NowSection'
import TrayectoriaSection from '../sections/TrayectoriaSection'
import StackSection from '../sections/StackSection'
import ProjectsSection from '../sections/ProjectsSection'
import SEO from '../components/SEO'

export default function Home() {
  return (
    <>
      <SEO />
      <AboutSection />
      <NowSection />
      <TrayectoriaSection />
      <StackSection />
      <ProjectsSection />
    </>
  )
}
