import { Cpu, Cloud, Database, BarChart, Shield, Zap, ArrowRight } from 'lucide-react'

export default function DigitalTransformation() {
  const services = [
    {
      icon: Cloud,
      title: 'Cloud Migration',
      description: 'Seamlessly migrate your infrastructure to the cloud with minimal disruption',
      features: ['AWS, Azure, GCP', 'Hybrid Solutions', 'Cost Optimization']
    },
    {
      icon: Cpu,
      title: 'AI & Machine Learning',
      description: 'Implement AI solutions to automate processes and gain insights',
      features: ['Predictive Analytics', 'NLP Solutions', 'Computer Vision']
    },
    {
      icon: Database,
      title: 'Data Analytics',
      description: 'Transform raw data into actionable business intelligence',
      features: ['Business Intelligence', 'Data Warehousing', 'Real-time Analytics']
    },
    {
      icon: Shield,
      title: 'Cybersecurity',
      description: 'Protect your digital assets with comprehensive security solutions',
      features: ['Threat Detection', 'Compliance', 'Security Audits']
    },
    {
      icon: Zap,
      title: 'Process Automation',
      description: 'Streamline operations with intelligent automation solutions',
      features: ['RPA Implementation', 'Workflow Optimization', 'Integration']
    },
    {
      icon: BarChart,
      title: 'Digital Strategy',
      description: 'Develop a comprehensive roadmap for your digital transformation',
      features: ['Strategic Planning', 'Change Management', 'ROI Analysis']
    }
  ]

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Digital Transformation Products & Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Accelerate your digital journey with our comprehensive suite of transformation services and cutting-edge products
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors">
                <service.icon className="h-7 w-7 text-primary-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-6">{service.description}</p>
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="flex items-center text-primary-600 font-semibold group-hover:text-primary-700">
                <span>Learn More</span>
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-3xl p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
              <p className="text-lg text-white/90 mb-6">
                Our team of experts will guide you through every step of your digital transformation journey
              </p>
              <button className="bg-white text-primary-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Schedule a Consultation
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-white/80">Projects Delivered</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-white/80">Client Satisfaction</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">15+</div>
                <div className="text-white/80">Industries Served</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-white/80">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
