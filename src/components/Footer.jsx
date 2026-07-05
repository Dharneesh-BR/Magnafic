import { Link } from 'react-router-dom'
import { Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#000047] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-8 mb-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Link to="/" aria-label="Go to home">
                <img src="/Magnafic final.png" alt="Magnafic" className="h-6 w-auto sm:h-7" />
              </Link>
            </div>
            <p className="text-gray-300">
              Top 1% Business Consulting.
            </p>
          </div>

          

          <div className="order-2 md:order-none">
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/about" className="hover:text-cyan transition-colors">About Us</Link></li>
              <li><Link to="/insights" className="hover:text-cyan transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-cyan transition-colors">Contact</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-cyan transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-cyan transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund-cancellation-policy" className="hover:text-cyan transition-colors">Refund & Cancellation</Link></li>
            </ul>
          </div>

          <div className="order-4 col-span-2 md:order-none md:col-span-1">
            <h4 className="font-semibold mb-4 text-white">Connect</h4>
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com/company/magnafic/" target="_blank" rel="noopener noreferrer" aria-label="Visit Magnafic on LinkedIn" className="flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/magnafic.global?utm_source=qr&igsh=d2RtbGR1dzc5bmRq"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Magnafic on Instagram"
                className="flex items-center justify-center text-white transition-opacity hover:opacity-80"
              >
                <Instagram className="h-7 w-7" />
              </a>
              <a
                href="https://youtube.com/@magnafic?si=yNoCSOQJ2ad-Bfd9"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Magnafic on YouTube"
                className="flex items-center justify-center text-white transition-opacity hover:opacity-80"
              >
                <Youtube className="h-7 w-7" />
              </a>
            </div>
          </div>

          <div className="order-3 mt-6 flex items-start justify-center md:order-none md:mt-0 md:-translate-x-6">
            <img src="/favicon.png" alt="Magnafic icon" className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
          </div>
        </div>

        <div className="border-t border-white/15 pt-8 text-center text-gray-300">
          <p>&copy; 2026 Magnafic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
