import { Award, Users, Zap } from 'lucide-react'

export default function ExpertiseSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Grid - Floating Images */}
          <div className="relative flex min-h-[360px] items-center justify-center sm:min-h-[440px] lg:min-h-[500px]">
            <style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
              }
              @keyframes float-delayed {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-15px); }
              }
              .float-1 { animation: float 3s ease-in-out infinite; }
              .float-2 { animation: float-delayed 4s ease-in-out infinite; }
              .float-3 { animation: float 3.5s ease-in-out infinite; }
              .float-4 { animation: float-delayed 4.5s ease-in-out infinite; }
              .float-5 { animation: float 3.2s ease-in-out infinite; }
              .float-6 { animation: float-delayed 3.8s ease-in-out infinite; }
            `}</style>
            
            {/* Profile 1 - Top Left */}
            <div className="absolute top-[10%] left-[10%] float-1">
              <img src="/Profile Images/1.png" alt="Profile 1" className="h-16 w-16 rounded-full object-cover shadow-lg sm:h-24 sm:w-24" />
            </div>

            {/* Profile 2 - Top Right with stars */}
            <div className="absolute top-[5%] right-[15%] float-2">
              <img src="/Profile Images/2.png" alt="Profile 2" className="h-14 w-14 rounded-full object-cover shadow-lg sm:h-20 sm:w-20" />
              <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.896l-7.416 3.817 1.48-8.279L0 9.306l8.332-1.151L12 .587z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Profile 3 - Middle Left */}
            <div className="absolute top-[40%] left-[5%] float-3">
              <img src="/Profile Images/3.png" alt="Profile 3" className="h-20 w-20 rounded-full object-cover shadow-lg sm:h-28 sm:w-28" />
            </div>

            {/* Profile 4 - Middle Right with speech bubble and stars */}
            <div className="absolute top-[35%] right-[10%] float-4">
              <img src="/Profile Images/4.png" alt="Profile 4" className="h-16 w-16 rounded-full object-cover shadow-lg sm:h-24 sm:w-24" />
              <div className="ml-4 mt-2 w-24 rounded-lg bg-white p-2 shadow-md sm:ml-8 sm:w-32 sm:p-3">
                <div className="h-2 bg-gray-300 rounded mb-2"></div>
                <div className="h-2 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.896l-7.416 3.817 1.48-8.279L0 9.306l8.332-1.151L12 .587z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Profile 5 - Bottom Left with speech bubble */}
            <div className="absolute bottom-[15%] left-[15%] float-5">
              <img src="/Profile Images/5.png" alt="Profile 5" className="h-16 w-16 rounded-full object-cover shadow-lg sm:h-24 sm:w-24" />
              <div className="mt-2 w-24 rounded-lg bg-white p-2 shadow-md sm:w-36 sm:p-3">
                <div className="h-2 bg-gray-300 rounded mb-2"></div>
                <div className="h-2 bg-gray-300 rounded mb-2"></div>
                <div className="h-2 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>

            {/* Profile 6 - Bottom Right with speech bubble */}
            <div className="absolute bottom-[10%] right-[20%] float-6">
              <img src="/Profile Images/6.png" alt="Profile 6" className="h-14 w-14 rounded-full object-cover shadow-lg sm:h-20 sm:w-20" />
              <div className="ml-2 mt-2 w-20 rounded-lg bg-white p-2 shadow-md sm:ml-4 sm:w-28 sm:p-3">
                <div className="h-2 bg-gray-300 rounded mb-2"></div>
                <div className="h-2 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          
          {/* Right Grid - Content */}
          <div>
            <div className="mb-2">
              <h2 className="text-2xl text-center sm:text-3xl font-extrabold text-gray-900 mb-6">
                Modern business challenges require modern expertise
              </h2>
              <p className="text-xl text-center text-gray-700 font-medium leading-relaxed">
                Traditional consulting firms rely on layered teams and generalized frameworks. Magnafic is building a flexible ecosystem of experienced operators, strategic thinkers, and AI-enabled specialists designed for modern consumer businesses.
              </p>
            </div>

            <h3 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">
              Expertise that works inside the business, not outside it
            </h3>

            <div className="grid gap-6 md:grid-cols-3 md:gap-0">
              <div className="flex flex-col items-center text-center md:border-r md:border-gray-400 md:pr-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-cyan mb-4">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-extrabold text-primary mb-2">20+</div>
                <p className="text-gray-700 font-medium">Average years of experience</p>
              </div>

              <div className="flex flex-col items-center text-center md:border-r md:border-gray-400 md:px-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-cyan mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-extrabold text-primary mb-2">Real Operators</div>
                <p className="text-gray-700 font-medium">Leaders who've scaled brands & built systems</p>
              </div>

              <div className="flex flex-col items-center text-center md:pl-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-cyan mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-extrabold text-primary mb-2">Agile Approach</div>
                <p className="text-gray-700 font-medium">Access experts, teams, & partnerships</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
