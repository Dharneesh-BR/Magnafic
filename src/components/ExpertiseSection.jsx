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
            <div className="absolute top-[8%] left-[5%] float-1">
              <img src="/Profile Images/1.png" alt="Profile 1" className="h-16 w-16 rounded-full object-cover shadow-lg sm:h-24 sm:w-24" />
            </div>

            {/* Profile 2 - Top Right with stars */}
            <div className="absolute top-[8%] right-[5%] float-2">
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
            <div className="absolute top-[25%] left-[3%] float-3">
              <img src="/Profile Images/3.png" alt="Profile 3" className="h-20 w-20 rounded-full object-cover shadow-lg sm:h-28 sm:w-28" />
            </div>

            {/* Profile 4 - Middle Right with speech bubble and stars */}
            <div className="absolute top-[25%] right-[3%] float-4">
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

            {/* Profile 5 - Center with speech bubble */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="float-5">
                <img src="/Profile Images/5.png" alt="Profile 5" className="h-16 w-16 rounded-full object-cover shadow-lg sm:h-24 sm:w-24" />
                <div className="mt-2 w-24 rounded-lg bg-white p-2 shadow-md sm:w-36 sm:p-3">
                  <div className="h-2 bg-gray-300 rounded mb-2"></div>
                  <div className="h-2 bg-gray-300 rounded mb-2"></div>
                  <div className="h-2 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            </div>

            {/* Profile 6 - Bottom Right with speech bubble */}
            <div className="absolute bottom-[8%] right-[8%] float-6">
              <img src="/Profile Images/6.png" alt="Profile 6" className="h-14 w-14 rounded-full object-cover shadow-lg sm:h-20 sm:w-20" />
              <div className="ml-2 mt-2 w-20 rounded-lg bg-white p-2 shadow-md sm:ml-4 sm:w-28 sm:p-3">
                <div className="h-2 bg-gray-300 rounded mb-2"></div>
                <div className="h-2 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          
          {/* Right Grid - Content */}
          <div className="expertise-running-border relative overflow-hidden rounded-2xl border border-primary-100/80 bg-white px-5 py-7 shadow-xl shadow-primary-900/10 ring-1 ring-cyan/20 sm:px-7 sm:py-8 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:ring-0">
            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent lg:hidden" />
            <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent lg:hidden" />

            <div className="mb-5 text-center lg:mb-2">
              
              <h2 className="mt-6 mb-5 text-3xl font-extrabold leading-tight text-blue-900 sm:mt-0 sm:text-3xl lg:mb-6">
                Modern business challenges require modern expertise
              </h2>
              <p className="mx-auto my-8 max-w-2xl text-xl font-semibold leading-7 text-gray-700 sm:text-xl lg:text-2xl">
                Why hire large consulting teams when you can access focused expertise and AI-enabled execution built around your needs?
              </p>
            </div>

            

            <div className="grid gap-4 md:grid-cols-3 md:gap-0 lg:gap-0">
              <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-cyan-50/40 p-5 text-center shadow-lg shadow-primary-900/5 shadow-[0_0_20px_rgba(0,255,255,0.3)] md:rounded-none md:border-y-0 md:border-l-0 md:border-r md:border-gray-400 md:bg-transparent md:p-0 md:pr-6 md:shadow-none md:shadow-[0_0_0px_rgba(0,0,0,0)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow-cyan">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="mb-2 text-3xl font-extrabold text-primary">20+</div>
                <p className="font-semibold leading-6 text-gray-700">Average years of experience</p>
              </div>

              <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-primary-50/50 p-5 text-center shadow-lg shadow-primary-900/5 shadow-[0_0_20px_rgba(0,255,255,0.3)] md:rounded-none md:border-y-0 md:border-l-0 md:border-r md:border-gray-400 md:bg-transparent md:p-0 md:px-6 md:shadow-none md:shadow-[0_0_0px_rgba(0,0,0,0)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow-cyan">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="mb-2 text-2xl font-extrabold text-primary">Real Operators</div>
                <p className="font-semibold leading-6 text-gray-700">Leaders who've scaled brands & built systems</p>
              </div>

              <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-cyan-50/40 p-5 text-center shadow-lg shadow-primary-900/5 shadow-[0_0_20px_rgba(0,255,255,0.3)] md:rounded-none md:border-0 md:bg-transparent md:p-0 md:pl-6 md:shadow-none md:shadow-[0_0_0px_rgba(0,0,0,0)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow-cyan">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="mb-2 text-2xl font-extrabold text-primary">Agile Approach</div>
                <p className="font-semibold leading-6 text-gray-700">Access experts, teams, & partnerships</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}