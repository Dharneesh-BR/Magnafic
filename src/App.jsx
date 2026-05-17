import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Experts from './pages/Experts'
import DigitalTransformation from './pages/DigitalTransformation'
import Insights from './pages/Insights'
import JoinExpertsHub from './pages/JoinExpertsHub'
import About from './pages/About'
import Login from './pages/Login'
import Academy from './pages/Academy'
import Contact from './pages/Contact'

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/experts" element={<Experts />} />
            <Route path="/digital-transformation" element={<DigitalTransformation />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/join-experts-hub" element={<JoinExpertsHub />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
