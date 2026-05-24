import { Brain, Youtube, Linkedin, Instagram, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-4">
              <img src="/Magnafic.png" alt="Magnafic" className="h-12 w-auto" />
            </div>
            <p className="text-gray-600">
              Top 1% Elite Experts for Consumer Brands
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Product</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-cyan transition-colors">Testimonials</a></li>
              <li><a href="#" className="hover:text-cyan transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Company</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-cyan transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-cyan transition-colors">Blog</a></li>
              <li><a href="/contact" className="hover:text-cyan transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Connect</h4>
            <div className="flex space-x-4">
              <a href="https://youtube.com/@magnafic?si=dqaQ-9Bud3gXvUCA" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gradient-primary transition-colors hover:shadow-glow-cyan text-gray-900">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/magnafic/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gradient-primary transition-colors hover:shadow-glow-cyan text-gray-900">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gradient-primary transition-colors hover:shadow-glow-cyan text-gray-900">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 text-center text-gray-600">
          <p>&copy; 2026 Magnafic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
