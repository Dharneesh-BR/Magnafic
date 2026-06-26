import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  Crown,
  Globe2,
  Home,
  Info,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  Network,
  Newspaper,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  User,
  UserCircle,
  Users,
  X,
} from 'lucide-react'
import { clearAuthUser, getAuthUser } from '../lib/auth'
import { mentorClient } from '../lib/sanityClient'

const capabilityIcons = {
  sparkles: Sparkles,
  'trending-up': TrendingUp,
  target: Target,
  'brain-circuit': BrainCircuit,
  'shopping-bag': ShoppingBag,
  network: Network,
  briefcase: BriefcaseBusiness,
  'bar-chart': BarChart3,
  'shopping-cart': ShoppingCart,
  lightbulb: Lightbulb,
  globe: Globe2,
  user: User,
  bot: Bot,
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCapabilitiesOpen, setIsCapabilitiesOpen] = useState(false)
  const [isProductsOpen, setIsProductsOpen] = useState(false)
  const [authUser, setAuthUserState] = useState(() => getAuthUser())
  const [capabilities, setCapabilities] = useState([])
  const [products, setProducts] = useState([])
  const navigate = useNavigate()
  const location = useLocation()
  const showHomeLink = location.pathname !== '/'
  const hasDashboardAccess = authUser?.role === 'client' || authUser?.role === 'consultant' || authUser?.role === 'admin' || authUser?.isAdmin === true

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
    const fetchNavigationItems = async () => {
      try {
        const [capabilityData, productData] = await Promise.all([
          mentorClient.fetch(`*[_type == "capabilities"] | order(coalesce(displayOrder, 9999) asc, title asc) {
            _id,
            "slug": slug.current,
            title,
            subtitle,
            icon
          }`),
          mentorClient.fetch(`*[_type == "products" && status == "published"] | order(coalesce(displayOrder, 9999) asc, title asc) {
            _id,
            "slug": slug.current,
            title
          }`),
        ])
        setCapabilities(capabilityData || [])
        setProducts(productData || [])
      } catch (error) {
        console.error('Error fetching navigation items:', error)
      }
    }

    fetchNavigationItems()
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

  const handleProductSelect = (slug) => {
    navigate(`/products/${slug}`)
    setIsProductsOpen(false)
    setIsMenuOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCapabilitiesOpen && !event.target.closest('.capabilities-dropdown')) {
        setIsCapabilitiesOpen(false)
      }
      if (isProductsOpen && !event.target.closest('.products-dropdown')) {
        setIsProductsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isCapabilitiesOpen, isProductsOpen])

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

          {hasDashboardAccess ? (
            <Link
              to="/dashboard"
              className="justify-self-end p-2 text-[#000047] transition hover:text-primary-700 md:hidden"
              aria-label="Go to dashboard"
            >
              <UserCircle className="h-7 w-7" />
            </Link>
          ) : authUser ? (
            <button
              type="button"
              onClick={handleLogout}
              className="justify-self-end p-2 text-[#000047] transition hover:text-primary-700 md:hidden"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-7 w-7" />
            </button>
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
                onClick={() => {
                  setIsCapabilitiesOpen(!isCapabilitiesOpen)
                  setIsProductsOpen(false)
                }}
                className="flex items-center space-x-1 text-gray-900 hover:text-primary transition-colors font-medium"
              >
                <span>Expert Services</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isCapabilitiesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCapabilitiesOpen && (
                <div className="absolute left-0 mt-2 inline-grid min-w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-xl shadow-gray-200/50 ring-1 ring-gray-100 overflow-hidden z-50">
                  <div className="grid max-h-96 overflow-x-hidden overflow-y-auto py-2">
                    {capabilities.map((capability) => {
                      const Icon = capabilityIcons[capability.icon] || Sparkles

                      return (
                        <button
                          key={capability._id}
                          onClick={() => handleCapabilitySelect(capability.slug || capability._id)}
                          className="group border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-primary-50"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 shrink-0 text-primary-600" aria-hidden="true" />
                            <span className="whitespace-nowrap font-medium text-gray-950 transition-colors group-hover:text-primary-700">
                              {capability.title}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                    {capabilities.length === 0 && (
                      <div className="px-4 py-3 text-gray-500">No Expert services available</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative products-dropdown">
              <button
                onClick={() => {
                  setIsProductsOpen(!isProductsOpen)
                  setIsCapabilitiesOpen(false)
                }}
                className="flex items-center space-x-1 text-gray-900 hover:text-primary transition-colors font-medium"
              >
                <span>Solutions</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProductsOpen && (
                <div className="absolute left-0 z-50 mt-2 min-w-64 overflow-hidden rounded-2xl bg-white shadow-xl shadow-gray-200/50 ring-1 ring-gray-100">
                  <div className="grid max-h-96 overflow-y-auto py-2">
                    {products.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleProductSelect(product.slug || product._id)}
                        className="group border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-primary-50"
                      >
                        <span className="flex items-center gap-3 whitespace-nowrap font-medium text-gray-950 group-hover:text-primary-700">
                          <ShoppingBag className="h-5 w-5 shrink-0 text-primary-600" />
                          {product.title}
                        </span>
                      </button>
                    ))}
                    {products.length === 0 && (
                      <div className="px-4 py-3 text-gray-500">No products available</div>
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
                {hasDashboardAccess && (
                  <Link to="/dashboard" className="text-gray-900 hover:text-primary transition-colors font-medium">Dashboard</Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Logout"
                  title="Logout"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-white shadow-md shadow-primary-900/15 transition-all hover:scale-105 hover:shadow-glow-combined"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                aria-label="Login"
                title="Login"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-white shadow-md shadow-primary-900/15 transition-all hover:scale-105 hover:shadow-glow-combined"
              >
                <UserCircle className="h-7 w-7" />
              </Link>
            )}
          </div>

        </div>

        {isMenuOpen && (
          <div className="space-y-3 border-t border-gray-100 bg-white py-4 md:hidden">
            {showHomeLink && (
              <Link onClick={() => setIsMenuOpen(false)} to="/" className="flex items-center gap-3 rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium">
                <Home className="h-5 w-5 shrink-0 text-primary-600" />
                <span>Home</span>
              </Link>
            )}
            <div className="capabilities-dropdown">
              <button
                onClick={() => {
                  setIsCapabilitiesOpen(!isCapabilitiesOpen)
                  setIsProductsOpen(false)
                }}
                className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium"
              >
                <span className="flex items-center gap-3">
                  <BriefcaseBusiness className="h-5 w-5 shrink-0 text-primary-600" />
                  <span>Expert Services</span>
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isCapabilitiesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCapabilitiesOpen && (
                <div className="mt-2 ml-4 space-y-1">
                  {capabilities.map((capability) => {
                    const Icon = capabilityIcons[capability.icon] || Sparkles

                    return (
                      <button
                        key={capability._id}
                        onClick={() => handleCapabilitySelect(capability.slug || capability._id)}
                        className="group block w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-700 transition-colors last:border-b-0 hover:bg-primary-50 hover:text-primary"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 shrink-0 text-primary-600" aria-hidden="true" />
                          <span className="whitespace-nowrap font-medium">{capability.title}</span>
                        </div>
                      </button>
                    )
                  })}
                  {capabilities.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">No Expert services available</div>
                  )}
                </div>
              )}
            </div>
            <div className="products-dropdown">
              <button
                onClick={() => {
                  setIsProductsOpen(!isProductsOpen)
                  setIsCapabilitiesOpen(false)
                }}
                className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium"
              >
                <span className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 shrink-0 text-primary-600" />
                  <span>Products</span>
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProductsOpen && (
                <div className="ml-4 mt-2 space-y-1">
                  <Link
                    to="/products"
                    onClick={() => {
                      setIsProductsOpen(false)
                      setIsMenuOpen(false)
                    }}
                    className="block border-b border-gray-100 px-3 py-2 text-sm font-bold text-primary-700 hover:bg-primary-50"
                  >
                    View All Products
                  </Link>
                  {products.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handleProductSelect(product.slug || product._id)}
                      className="group block w-full border-b border-gray-100 px-3 py-2 text-left text-sm font-medium text-gray-700 transition last:border-b-0 hover:bg-primary-50 hover:text-primary"
                    >
                      <span className="flex items-center gap-3">
                        <ShoppingBag className="h-5 w-5 shrink-0 text-primary-600" aria-hidden="true" />
                        <span>{product.title}</span>
                      </span>
                    </button>
                  ))}
                  {products.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">No products available</div>
                  )}
                </div>
              )}
            </div>
            <Link onClick={() => setIsMenuOpen(false)} to="/programs" className="flex items-center gap-3 rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium">
              <CalendarDays className="h-5 w-5 shrink-0 text-primary-600" />
              <span>Programs</span>
            </Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/insights" className="flex items-center gap-3 rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium">
              <Newspaper className="h-5 w-5 shrink-0 text-primary-600" />
              <span>Insights</span>
            </Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/about" className="flex items-center gap-3 rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium">
              <Info className="h-5 w-5 shrink-0 text-primary-600" />
              <span>About</span>
            </Link>
            <Link
              onClick={() => setIsMenuOpen(false)}
              to="/founder-community"
              className="flex items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-center font-extrabold text-primary-700 shadow-sm"
            >
              <Users className="h-5 w-5 shrink-0" />
              <span>Join Founder Community</span>
            </Link>
            <Link
              onClick={() => setIsMenuOpen(false)}
              to="/join-experts-hub"
              className="flex items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-center font-extrabold text-primary-700 shadow-sm"
            >
              <Crown className="h-5 w-5 shrink-0" />
              <span>Join Top 1% Expert Club</span>
            </Link>

            {authUser ? (
              <>
                {hasDashboardAccess && (
                  <Link onClick={() => setIsMenuOpen(false)} to="/dashboard" className="flex items-center gap-3 rounded-xl px-2 py-2 text-gray-900 hover:bg-gray-50 hover:text-primary font-medium">
                    <LayoutDashboard className="h-5 w-5 shrink-0 text-primary-600" />
                    <span>Dashboard</span>
                  </Link>
                )}
                <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-6 py-3 text-center font-semibold text-white hover:shadow-glow-combined">
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span>Logout</span>
                </button>
              </>
            ) : null}
          </div>
        )}
      </nav>
    </header>
  )
}
