import { Link } from 'react-router-dom'
import { Brain, Search, MessageSquare, ChevronRight, Sparkles } from 'lucide-react'
import Hero from '../components/Hero'
import ValueProp from '../components/ValueProp'
import MagnaFramework from '../components/MagnaFramework'
import AboutMagna from '../components/AboutMagna'
import ExpertiseSection from '../components/ExpertiseSection'
import Testimonials from '../components/Testimonials'


export default function Home() {
  return (
    <div className="pt-16">
      <Hero />
      <ValueProp />
      <MagnaFramework />
      <AboutMagna />
      <ExpertiseSection />
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <Testimonials />
      </section>
      
    </div>
  )
}
