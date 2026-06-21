import { Award, Users, Zap } from 'lucide-react'

export default function ExpertiseSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          {/* Left Grid - Copilot and expert network */}
          <div className="relative mx-auto min-h-[430px] w-full max-w-[580px] sm:min-h-[500px] lg:min-h-[540px]">
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

            <div className="absolute bottom-[12%] left-1/2 z-10 -translate-x-1/2">
              <div className="absolute inset-x-[18%] bottom-3 h-12 rounded-full bg-primary-900/10 blur-xl" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[85%] w-[135%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,255,255,0.5)_0%,rgba(108,70,255,0.3)_38%,transparent_72%)] blur-2xl" />
              <img
                src="/Copilot 2.png"
                alt="Magnafic AI Copilot connecting businesses with expert operators"
                className="relative w-32 object-contain drop-shadow-[0_0_18px_rgba(0,255,255,0.4)] sm:w-40 lg:w-44"
              />
            </div>

            <div className="float-1 absolute left-[4%] top-[11%] z-20 sm:left-[6%]">
              <img src="/Profile Images/1.png" alt="Magnafic expert" className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-lg sm:h-20 sm:w-20" />
            </div>

            <div className="float-3 absolute left-[2%] top-[28%] z-20 sm:left-[4%]">
              <img src="/Profile Images/3.png" alt="Magnafic expert" className="h-20 w-20 rounded-full border-2 border-white object-cover shadow-lg sm:h-24 sm:w-24" />
            </div>

            <div className="float-2 absolute left-[45%] top-[3%] z-20 -translate-x-1/2">
              <img src="/Profile Images/2.png" alt="Magnafic expert" className="mx-auto h-14 w-14 rounded-full border-2 border-white object-cover shadow-lg sm:h-16 sm:w-16" />
              <div className="mt-2 w-24 rounded-lg bg-white p-2 shadow-lg sm:w-28">
                <div className="mb-2 h-1.5 rounded-full bg-slate-300" />
                <div className="h-1.5 w-1/2 rounded-full bg-slate-200" />
              </div>
            </div>

            <div className="float-4 absolute left-[33%] top-[29%] z-20">
              <img src="/Profile Images/5.png" alt="Magnafic expert" className="mx-auto h-16 w-16 rounded-full border-2 border-white object-cover shadow-lg sm:h-20 sm:w-20" />
              <div className="mt-2 w-24 rounded-lg bg-white p-2 shadow-lg sm:w-28">
                <div className="mb-2 h-1.5 rounded-full bg-slate-300" />
                <div className="mb-2 h-1.5 rounded-full bg-slate-300" />
                <div className="h-1.5 w-2/3 rounded-full bg-slate-200" />
              </div>
            </div>

            <div className="float-6 absolute right-[10%] top-[7%] z-20">
              <img src="/Profile Images/6.png" alt="Magnafic expert" className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-lg sm:h-16 sm:w-16" />
              <div className="mt-1 flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-2.5 w-2.5 fill-current text-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.896l-7.416 3.817 1.48-8.279L0 9.306l8.332-1.151L12 .587z" />
                  </svg>
                ))}
              </div>
            </div>

            <div className="float-4 absolute right-[1%] top-[24%] z-20 sm:right-[3%]">
              <img src="/Profile Images/4.png" alt="Magnafic expert" className="mx-auto h-20 w-20 rounded-full border-2 border-white object-cover shadow-lg sm:h-24 sm:w-24" />
              <div className="ml-3 mt-2 w-24 rounded-lg bg-white p-2 shadow-lg sm:w-28">
                <div className="mb-2 h-1.5 rounded-full bg-slate-300" />
                <div className="h-1.5 w-2/3 rounded-full bg-slate-200" />
              </div>
              <div className="mt-1 flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-2.5 w-2.5 fill-current text-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.896l-7.416 3.817 1.48-8.279L0 9.306l8.332-1.151L12 .587z" />
                  </svg>
                ))}
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

            

            <div className="grid gap-4 md:grid-cols-2 md:gap-0 lg:gap-0">
              <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-primary-50/50 p-5 text-center shadow-lg shadow-primary-900/5 shadow-[0_0_20px_rgba(0,255,255,0.3)] md:rounded-none md:border-y-0 md:border-l-0 md:border-r md:border-gray-400 md:bg-transparent md:p-0 md:px-6 md:shadow-none md:shadow-[0_0_0px_rgba(0,0,0,0)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow-cyan">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="mb-2 text-2xl font-extrabold text-primary">Real Experts</div>
                <p className="font-semibold leading-6 text-gray-700">Leaders with 20+ years of experience in scaling brands & building systems</p>
              </div>

              <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-cyan-50/40 p-5 text-center shadow-lg shadow-primary-900/5 shadow-[0_0_20px_rgba(0,255,255,0.3)] md:rounded-none md:border-0 md:bg-transparent md:p-0 md:pl-6 md:shadow-none md:shadow-[0_0_0px_rgba(0,0,0,0)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow-cyan">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="mb-2 text-2xl font-extrabold text-primary">Intelligent AI Ecosystem</div>
                <p className="font-semibold leading-6 text-gray-700">Deploy AI agents & automation solutions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
