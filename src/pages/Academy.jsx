import { GraduationCap, BookOpen, Video, Award, Users, TrendingUp, Clock, Star, Play } from 'lucide-react'

export default function Academy() {
  const courses = [
    {
      title: 'Digital Transformation Fundamentals',
      instructor: 'Dr. Sarah Johnson',
      duration: '8 weeks',
      lessons: 24,
      rating: 4.9,
      students: 1250,
      level: 'Beginner',
      price: '$299',
      category: 'Digital Transformation',
      image: 'bg-gradient-to-br from-blue-500 to-cyan-500'
    },
    {
      title: 'Advanced Cloud Architecture',
      instructor: 'Michael Chen',
      duration: '10 weeks',
      lessons: 32,
      rating: 4.8,
      students: 890,
      level: 'Advanced',
      price: '$499',
      category: 'Cloud',
      image: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    {
      title: 'AI & Machine Learning for Business',
      instructor: 'Emily Rodriguez',
      duration: '12 weeks',
      lessons: 40,
      rating: 5.0,
      students: 2100,
      level: 'Intermediate',
      price: '$599',
      category: 'AI & ML',
      image: 'bg-gradient-to-br from-orange-500 to-red-500'
    },
    {
      title: 'Cybersecurity Essentials',
      instructor: 'James Wilson',
      duration: '6 weeks',
      lessons: 18,
      rating: 4.7,
      students: 760,
      level: 'Beginner',
      price: '$199',
      category: 'Security',
      image: 'bg-gradient-to-br from-green-500 to-teal-500'
    },
    {
      title: 'Data Analytics Masterclass',
      instructor: 'Lisa Thompson',
      duration: '8 weeks',
      lessons: 28,
      rating: 4.9,
      students: 1580,
      level: 'Intermediate',
      price: '$349',
      category: 'Analytics',
      image: 'bg-gradient-to-br from-indigo-500 to-blue-500'
    },
    {
      title: 'Business Strategy & Innovation',
      instructor: 'David Kim',
      duration: '6 weeks',
      lessons: 20,
      rating: 4.8,
      students: 920,
      level: 'Advanced',
      price: '$399',
      category: 'Strategy',
      image: 'bg-gradient-to-br from-rose-500 to-orange-500'
    }
  ]

  const features = [
    {
      icon: Video,
      title: 'Expert-Led Video Courses',
      description: 'Learn from industry experts with high-quality video content'
    },
    {
      icon: Award,
      title: 'Certified Programs',
      description: 'Earn recognized certificates upon course completion'
    },
    {
      icon: Users,
      title: 'Community Learning',
      description: 'Connect with fellow learners and instructors'
    },
    {
      icon: Clock,
      title: 'Self-Paced Learning',
      description: 'Learn at your own pace with lifetime access'
    }
  ]

  return (
    <div className="px-4 pt-24 pb-16 sm:px-6 sm:pb-20 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <GraduationCap className="h-4 w-4" />
            <span>Mind Magna Academy</span>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">Upskill with Expert-Led Courses</h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl">
            Master the skills you need to succeed in the digital age. Our academy offers 
            comprehensive courses taught by industry experts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {courses.map((course, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div className={`h-48 ${course.image} flex items-center justify-center relative`}>
                <GraduationCap className="h-20 w-20 text-white/80" />
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
                  {course.level}
                </div>
              </div>
              <div className="p-6">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-primary-600 font-medium">{course.category}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4">by {course.instructor}</p>
                <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}
                  </span>
                  <span className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {course.lessons} lessons
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.students}
                  </span>
                </div>
                <div className="flex flex-col gap-4 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-2xl font-bold text-gray-900">{course.price}</span>
                  <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    <Play className="h-4 w-4" />
                    <span>Enroll Now</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-purple-600 p-6 text-white sm:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="mb-4 text-2xl font-bold sm:text-3xl">Become an Instructor</h2>
              <p className="text-lg text-white/90 mb-6">
                Share your expertise with a global audience. Join our team of instructors and 
                help shape the future of digital education.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Reach thousands of students worldwide',
                  'Earn competitive revenue sharing',
                  'Access to teaching resources and support',
                  'Build your personal brand'
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <button className="bg-white text-primary-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Apply to Teach
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="rounded-xl bg-white/10 p-4 text-center sm:p-6">
                <div className="mb-2 text-3xl font-bold sm:text-4xl">50+</div>
                <div className="text-white/80">Expert Instructors</div>
              </div>
              <div className="rounded-xl bg-white/10 p-4 text-center sm:p-6">
                <div className="mb-2 text-3xl font-bold sm:text-4xl">100+</div>
                <div className="text-white/80">Courses Available</div>
              </div>
              <div className="rounded-xl bg-white/10 p-4 text-center sm:p-6">
                <div className="mb-2 text-3xl font-bold sm:text-4xl">25K+</div>
                <div className="text-white/80">Students Enrolled</div>
              </div>
              <div className="rounded-xl bg-white/10 p-4 text-center sm:p-6">
                <div className="mb-2 text-3xl font-bold sm:text-4xl">95%</div>
                <div className="text-white/80">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
