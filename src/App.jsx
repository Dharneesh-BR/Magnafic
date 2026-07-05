import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Experts from './pages/Experts'
import ExpertDetail from './pages/ExpertDetail'
import ExpertEngagement from './pages/ExpertEngagement'
import DigitalTransformation from './pages/DigitalTransformation'
import Insights from './pages/Insights'
import BlogDetail from './pages/BlogDetail'
import JoinExpertsHub from './pages/JoinExpertsHub'
import FounderCommunity from './pages/FounderCommunity'
import About from './pages/About'
import Login from './pages/Login'
import ClientSignup from './pages/ClientSignup'
import ClientAccountSignup from './pages/ClientAccountSignup'
import Academy from './pages/Academy'
import Programs from './pages/Programs'
import Products from './pages/Products'
import AdPage from './pages/AdPage'
import Contact from './pages/Contact'
import DescribeProblem from './pages/DescribeProblem'
import CapabilityDetail from './pages/CapabilityDetail'
import ServiceDetail from './pages/ServiceDetail'
import PolicyPage from './pages/PolicyPage'
import SEO from './components/SEO'
import ConsultantDashboard from './pages/ConsultantDashboard'
import ClientDashboard from './pages/ClientDashboard'
import DashboardRedirect from './pages/DashboardRedirect'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function AppContent() {
  const location = useLocation()
  const isDashboardPage = location.pathname.startsWith('/dashboard/')
  const isAddPage = location.pathname === '/add'
  const isAdPage = location.pathname.startsWith('/ads/')
  const isMasterclassPage = location.pathname === '/magna-business-masterclass'

  if (location.pathname.startsWith('/admin')) {
    return (
      <ErrorBoundary resetKey={location.pathname}>
        <Routes>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </ErrorBoundary>
    )
  }

  return (
    <div className="min-h-screen">
      <SEO />
      {!isDashboardPage && !isAddPage && !isAdPage && !isMasterclassPage && <Header />}
      <main>
        <ErrorBoundary resetKey={location.pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/experts" element={<Experts />} />
            <Route path="/experts/:slug" element={<ExpertDetail />} />
            <Route path="/experts/:slug/:section" element={<ExpertEngagement />} />
            <Route path="/digital-transformation" element={<DigitalTransformation />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/:slug" element={<BlogDetail />} />
            <Route path="/join-experts-hub" element={<JoinExpertsHub />} />
            <Route path="/founder-community" element={<FounderCommunity />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<ClientSignup />} />
            <Route path="/client-signup" element={<ClientAccountSignup />} />
            <Route path="/describe-your-problem" element={<DescribeProblem />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/dashboard/client" element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/consultant" element={<ProtectedRoute role="consultant"><ConsultantDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/consultant/enquiry/:enquiryId" element={<ProtectedRoute role="consultant"><ConsultantDashboard /></ProtectedRoute>} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/programs/:slug" element={<Programs />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<Products />} />
            <Route path="/magna-business-masterclass" element={<AdPage slugOverride="magna-business-masterclass" pathOverride="/magna-business-masterclass" />} />
            <Route path="/ads/business-growth-masterclass" element={<AdPage slugOverride="magna-business-masterclass" />} />
            <Route path="/ads/:slug" element={<AdPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/capabilities/:id" element={<CapabilityDetail />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/terms-and-conditions" element={<PolicyPage type="terms" />} />
            <Route path="/privacy-policy" element={<PolicyPage type="privacy" />} />
            <Route path="/refund-cancellation-policy" element={<PolicyPage type="refund" />} />
          </Routes>
        </ErrorBoundary>
      </main>
      {!isDashboardPage && !isAddPage && !isAdPage && !isMasterclassPage && <Footer />}
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
