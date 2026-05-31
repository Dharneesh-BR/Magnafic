import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Experts from './pages/Experts'
import ExpertDetail from './pages/ExpertDetail'
import DigitalTransformation from './pages/DigitalTransformation'
import Insights from './pages/Insights'
import BlogDetail from './pages/BlogDetail'
import JoinExpertsHub from './pages/JoinExpertsHub'
import About from './pages/About'
import Login from './pages/Login'
import ClientSignup from './pages/ClientSignup'
import Academy from './pages/Academy'
import Contact from './pages/Contact'
import DescribeProblem from './pages/DescribeProblem'
import CapabilityDetail from './pages/CapabilityDetail'
import ServiceDetail from './pages/ServiceDetail'
import SEO from './components/SEO'
import ClientDashboard from './pages/ClientDashboard'
import ConsultantDashboard from './pages/ConsultantDashboard'
import DashboardRedirect from './pages/DashboardRedirect'
import ProtectedRoute from './components/ProtectedRoute'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function AppContent() {
  const location = useLocation()

  return (
    <div className="min-h-screen">
      <SEO />
      <Header />
      <main>
        <ErrorBoundary resetKey={location.pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/experts" element={<Experts />} />
            <Route path="/experts/:slug" element={<ExpertDetail />} />
            <Route path="/digital-transformation" element={<DigitalTransformation />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/:slug" element={<BlogDetail />} />
            <Route path="/join-experts-hub" element={<JoinExpertsHub />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<ClientSignup />} />
            <Route path="/describe-your-problem" element={<DescribeProblem />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/dashboard/client" element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/consultant" element={<ProtectedRoute role="consultant"><ConsultantDashboard /></ProtectedRoute>} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/capabilities/:id" element={<CapabilityDetail />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  )
}

export default App
