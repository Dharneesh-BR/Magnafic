import { ChevronRight, Sparkles } from 'lucide-react'

export default function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-primary">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/30">
          <Sparkles className="h-4 w-4" />
          <span>Limited Time Offer</span>
        </div>
        
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
          Ready to Transform Your Mind?
        </h2>
        
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Join Mind Magna today and start your journey to mental excellence. 
          Get 50% off your first month with code MIND50.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-primary px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-100 transition-all hover:shadow-glow-combined hover:scale-105 flex items-center justify-center space-x-2">
            <span>Start Your Free Trial</span>
            <ChevronRight className="h-5 w-5" />
          </button>
          <button className="border-2 border-white text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/10 transition-all hover:shadow-glow-cyan">
            Schedule a Demo
          </button>
        </div>
      </div>
    </section>
  )
}
