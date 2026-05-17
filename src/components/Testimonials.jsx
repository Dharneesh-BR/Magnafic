export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Entrepreneur',
      content: 'Mind Magna has completely transformed how I approach challenges. My focus and decision-making have improved dramatically.',
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Software Engineer',
      content: 'The cognitive training exercises are incredibly effective. I\'ve noticed significant improvements in my problem-solving abilities.',
      avatar: 'MC'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Teacher',
      content: 'As an educator, I appreciate the science-backed approach. My students have also benefited from the techniques I\'ve learned.',
      avatar: 'ER'
    }
  ]

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied users who have transformed their lives with Mind Magna.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-gray-50 p-8 rounded-2xl hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
