import { Brain, Twitter, Linkedin, Instagram, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#000047] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-cyan">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white">Mind Magna</span>
            </div>
            <p className="text-gray-300">
              Unlock your mind's full potential with our science-backed mental fitness platform.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-cyan transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-cyan transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-cyan transition-colors">Testimonials</a></li>
              <li><a href="#" className="hover:text-cyan transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-cyan transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-cyan transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-cyan transition-colors">Blog</a></li>
              <li><a href="/contact" className="hover:text-cyan transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gradient-primary transition-colors hover:shadow-glow-cyan text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gradient-primary transition-colors hover:shadow-glow-cyan text-white">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gradient-primary transition-colors hover:shadow-glow-cyan text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gradient-primary transition-colors hover:shadow-glow-cyan text-white">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Mind Magna. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
