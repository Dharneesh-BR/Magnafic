import SEO from '../components/SEO'
import IntelligenceOS from '../components/IntelligenceOS'

export default function ClientDashboard() {
  return (
    <>
      <SEO
        title="Magnafic Copilot"
        description="Market intelligence and research workspace."
        path="/dashboard/client"
        noIndex
      />
      <IntelligenceOS />
    </>
  )
}
