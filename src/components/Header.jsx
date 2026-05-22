import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { clearAuthUser, getAuthUser } from '../lib/auth'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [authUser, setAuthUserState] = useState(() => getAuthUser())

  useEffect(() => {
    const syncAuth = () => setAuthUserState(getAuthUser())

    window.addEventListener('magnafic-auth-change', syncAuth)
    window.addEventListener('storage', syncAuth)

    return () => {
      window.removeEventListener('magnafic-auth-change', syncAuth)
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  const handleLogout = () => {
    clearAuthUser()
    setIsMenuOpen(false)
  }

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
            {authUser ? (
              <>
                <Link to="/dashboard" className="text-gray-900 hover:text-primary transition-colors font-medium">Dashboard</Link>
                <button onClick={handleLogout} className="bg-gradient-primary text-white px-6 py-2 rounded-2xl hover:shadow-glow-combined transition-all hover:scale-105 font-semibold">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-gradient-primary text-white px-6 py-2 rounded-2xl hover:shadow-glow-combined transition-all hover:scale-105 font-semibold">
                Login
              </Link>
            )}
          </div>

          <button
            className="rounded-lg p-2 text-gray-900 transition hover:bg-gray-100 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="space-y-3 border-t border-gray-100 bg-white py-4 md:hidden">
            <Link onClick={() => setIsMenuOpen(false)} to="/experts" className="block rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium">Experts</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/insights" className="block rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium">Insights</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/about" className="block rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium">About</Link>
            {authUser ? (
              <>
                <Link onClick={() => setIsMenuOpen(false)} to="/dashboard" className="block rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium">Dashboard</Link>
                <button onClick={handleLogout} className="block w-full rounded-2xl bg-gradient-primary px-6 py-3 text-center font-semibold text-white hover:shadow-glow-combined">
                  Logout
                </button>
              </>
            ) : (
              <Link onClick={() => setIsMenuOpen(false)} to="/login" className="block rounded-2xl bg-gradient-primary px-6 py-3 text-center font-semibold text-white hover:shadow-glow-combined">
                Login
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
