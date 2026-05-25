import { Link } from 'react-router-dom'
import { Brain, Search, MessageSquare, ChevronRight, Sparkles } from 'lucide-react'
import Hero from '../components/Hero'
import ValueProp from '../components/ValueProp'
import MagnaFramework from '../components/MagnaFramework'
import AboutMagna from '../components/AboutMagna'
import HomeCapabilities from '../components/HomeCapabilities'
import ExpertiseSection from '../components/ExpertiseSection'



export default function Home() {
  return (
    <div className="pt-16">
      <Hero />
      <ExpertiseSection />
      <AboutMagna />
      <HomeCapabilities />
      <ValueProp />
      <MagnaFramework />
      
      
      
    </div>
  )
}
