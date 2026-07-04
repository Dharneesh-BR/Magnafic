import { Link } from 'react-router-dom'
import { Brain, Search, MessageSquare, ChevronRight, Sparkles } from 'lucide-react'
import Hero from '../components/Hero'
import ValueProp from '../components/ValueProp'
import AboutMagna from '../components/AboutMagna'
import HomeCapabilities from '../components/HomeCapabilities'
import HomeMentors from '../components/HomeMentors'
import HomeInsightsCarousel from '../components/HomeInsightsCarousel'
import DescribeProblemCTA from '../components/DescribeProblemCTA'
import ExpertiseSection from '../components/ExpertiseSection'
import CompanyLogos from '../components/CompanyLogos'
import FaqSection from '../components/FaqSection'



export default function Home() {
  return (
    <div className="pt-16">
      <Hero />
      <ExpertiseSection />
      <HomeMentors />
      <CompanyLogos />
      <ValueProp />
      <HomeCapabilities />
      <AboutMagna />
      <DescribeProblemCTA />
      <HomeInsightsCarousel />
      <FaqSection />
    </div>
  )
}
