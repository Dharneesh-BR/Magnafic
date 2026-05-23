import { Target, Brain, Zap, Users, BookOpen, Award } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Cognitive Training',
    description: 'Enhance your memory, focus, and problem-solving skills with our scientifically-backed exercises.'
  },
  {
    icon: Target,
    title: 'Goal Setting',
    description: 'Set and achieve meaningful goals with our structured framework and progress tracking.'
  },
  {
    icon: Zap,
    title: 'Quick Sessions',
    description: 'Effective mental exercises you can complete in just 10-15 minutes per day.'
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Connect with like-minded individuals and share your journey with a supportive community.'
  },
  {
    icon: BookOpen,
    title: 'Expert Resources',
    description: 'Access a library of articles, videos, and guides from leading mental fitness experts.'
  },
  {
    icon: Award,
    title: 'Achievement System',
    description: 'Stay motivated with badges, milestones, and rewards as you progress.'
  }
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Powerful Features for Mental Growth
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Everything you need to unlock your mind's full potential and achieve lasting personal growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-gray-50 hover:bg-primary/5 transition-all duration-300 shadow-[0_0_20px_rgba(53,51,205,0.15)] hover:shadow-glow-blue border border-transparent hover:border-primary/20"
            >
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-6 shadow-glow-cyan group-hover:scale-110 transition-transform">
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
