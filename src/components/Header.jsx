import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, UserCircle } from 'lucide-react'
import { clearAuthUser, getAuthUser } from '../lib/auth'
import { mentorClient } from '../lib/sanityClient'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCapabilitiesOpen, setIsCapabilitiesOpen] = useState(false)
  const [authUser, setAuthUserState] = useState(() => getAuthUser())
  const [capabilities, setCapabilities] = useState([])
  const navigate = useNavigate()
  const location = useLocation()
  const showHomeLink = location.pathname !== '/'

  useEffect(() => {
    const syncAuth = () => setAuthUserState(getAuthUser())

    window.addEventListener('magnafic-auth-change', syncAuth)
    window.addEventListener('storage', syncAuth)

    return () => {
      window.removeEventListener('magnafic-auth-change', syncAuth)
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        const query = `*[_type == "capabilities"] | order(coalesce(displayOrder, 9999) asc, title asc) {
          _id,
          "slug": slug.current,
          title,
          subtitle
        }`
        const data = await mentorClient.fetch(query)
        setCapabilities(data || [])
      } catch (error) {
        console.error('Error fetching capabilities:', error)
      }
    }

    fetchCapabilities()
  }, [])

  const handleLogout = async () => {
    await clearAuthUser()
    setIsMenuOpen(false)
    navigate('/')
  }

  const handleCapabilitySelect = (slug) => {
    navigate(`/capabilities/${slug}`)
    setIsCapabilitiesOpen(false)
    setIsMenuOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCapabilitiesOpen && !event.target.closest('.capabilities-dropdown')) {
        setIsCapabilitiesOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isCapabilitiesOpen])

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid h-16 grid-cols-[3rem_minmax(0,1fr)_3.75rem] items-center md:flex md:justify-between">
          <button
            className="justify-self-start p-2 text-[#000047] transition hover:text-primary-700 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link to="/" className="flex items-center justify-center space-x-2 md:justify-start">
            <img src="/Magnafic.png" alt="Mind Magna Logo" className="h-6 w-auto brightness-125 sm:h-7" />
          </Link>

          {authUser ? (
            <Link
              to="/dashboard"
              className="justify-self-end p-2 text-[#000047] transition hover:text-primary-700 md:hidden"
              aria-label="Go to dashboard"
            >
              <UserCircle className="h-7 w-7" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="justify-self-end p-2 text-[#000047] transition hover:text-primary-700 md:hidden"
              aria-label="Login"
            >
              <UserCircle className="h-7 w-7" />
            </Link>
          )}
          
          <div className="hidden md:flex items-center space-x-4 xl:space-x-6">
            {showHomeLink && (
              <Link to="/" className="text-gray-900 hover:text-primary transition-colors font-medium">Home</Link>
            )}
            <div className="relative capabilities-dropdown">
              <button
                onClick={() => setIsCapabilitiesOpen(!isCapabilitiesOpen)}
                className="flex items-center space-x-1 text-gray-900 hover:text-primary transition-colors font-medium"
              >
                <span>Expert Services</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isCapabilitiesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCapabilitiesOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white shadow-xl shadow-gray-200/50 ring-1 ring-gray-100 overflow-hidden z-50">
                  <div className="max-h-96 overflow-y-auto py-2">
                    {capabilities.map((capability) => (
                      <button
                        key={capability._id}
                        onClick={() => handleCapabilitySelect(capability.slug || capability._id)}
                        className="w-full border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-primary-50"
                      >
                        <div className="font-medium text-gray-950">{capability.title}</div>
                      </button>
                    ))}
                    {capabilities.length === 0 && (
                      <div className="px-4 py-3 text-gray-500">No Expert services available</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Link to="/programs" className="text-gray-900 hover:text-primary transition-colors font-medium">Programs</Link>
            <Link to="/insights" className="text-gray-900 hover:text-primary transition-colors font-medium">Insights</Link>
            <Link to="/about" className="text-gray-900 hover:text-primary transition-colors font-medium">About</Link>
            <Link
              to="/founder-community"
              className="whitespace-nowrap rounded-full border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-extrabold text-primary-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:bg-white hover:shadow-glow-blue xl:px-4 xl:text-sm"
            >
              Join Founder Community
            </Link>
            <Link
              to="/join-experts-hub"
              className="whitespace-nowrap rounded-full border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-extrabold text-primary-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:bg-white hover:shadow-glow-blue xl:px-4 xl:text-sm"
            >
              Top 1% Expert Club
            </Link>

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

        </div>

        {isMenuOpen && (
          <div className="space-y-3 border-t border-gray-100 bg-white py-4 md:hidden">
            {showHomeLink && (
              <Link onClick={() => setIsMenuOpen(false)} to="/" className="block rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium">Home</Link>
            )}
            <div className="capabilities-dropdown">
              <button
                onClick={() => setIsCapabilitiesOpen(!isCapabilitiesOpen)}
                className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium"
              >
                <span>Expert Services</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isCapabilitiesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCapabilitiesOpen && (
                <div className="mt-2 ml-4 space-y-1">
                  {capabilities.map((capability) => (
                    <button
                      key={capability._id}
                      onClick={() => handleCapabilitySelect(capability.slug || capability._id)}
                      className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-700 transition-colors last:border-b-0 hover:bg-primary-50 hover:text-primary"
                    >
                      <div className="font-medium">{capability.title}</div>
                    </button>
                  ))}
                  {capabilities.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">No Expert services available</div>
                  )}
                </div>
              )}
            </div>
            <Link onClick={() => setIsMenuOpen(false)} to="/programs" className="block rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium">Programs</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/insights" className="block rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium">Insights</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/about" className="block rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium">About</Link>
            <Link
              onClick={() => setIsMenuOpen(false)}
              to="/founder-community"
              className="block rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-center font-extrabold text-primary-700 shadow-sm"
            >
              Join Founder Community
            </Link>
            <Link
              onClick={() => setIsMenuOpen(false)}
              to="/join-experts-hub"
              className="block rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-center font-extrabold text-primary-700 shadow-sm"
            >
              Join Top 1% Expert Club
            </Link>

            {authUser ? (
              <>
                <Link onClick={() => setIsMenuOpen(false)} to="/dashboard" className="block rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium">Dashboard</Link>
                <button onClick={handleLogout} className="block w-full rounded-2xl bg-gradient-primary px-6 py-3 text-center font-semibold text-white hover:shadow-glow-combined">
                  Logout
                </button>
              </>
            ) : null}
          </div>
        )}
      </nav>
    </header>
  )
}
