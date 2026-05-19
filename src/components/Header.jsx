import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Brain, Menu, X } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/Magnafic.png" alt="Mind Magna Logo" className="h-10 w-auto brightness-125" />
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/experts" className="text-gray-900 hover:text-primary transition-colors font-medium">Experts</Link>
            <Link to="/insights" className="text-gray-900 hover:text-primary transition-colors font-medium">Insights</Link>
            <Link to="/about" className="text-gray-900 hover:text-primary transition-colors font-medium">About</Link>
            <Link to="/login" className="bg-gradient-primary text-white px-6 py-2 rounded-2xl hover:shadow-glow-combined transition-all hover:scale-105 font-semibold">
              Login
            </Link>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 bg-white">
            <Link to="/experts" className="block text-gray-900 hover:text-primary font-medium">Experts</Link>
            <Link to="/insights" className="block text-gray-900 hover:text-primary font-medium">Insights</Link>
            <Link to="/about" className="block text-gray-900 hover:text-primary font-medium">About</Link>
            <Link to="/login" className="block bg-gradient-primary text-gray-900 px-6 py-2 rounded-2xl hover:shadow-glow-combined text-center font-semibold">
              Login
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
