import React from 'react';

const CompanyLogos = () => {
  const logos = [
    '/Company Logos/1-2.png',
    '/Company Logos/2.png',
    '/Company Logos/3.png',
    '/Company Logos/4.png',
    '/Company Logos/5.png',
    '/Company Logos/6.png',
    '/Company Logos/7.png',
    '/Company Logos/8-2.png',
    '/Company Logos/9.png',
  ];

  return (
    <div className="mb-16 rounded-3xl bg-white p-8 sm:p-12 shadow-lg">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column - Content */}
        <div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            Trusted by small, medium and large CPG businesses
          </h2>
          <p className="text-lg text-gray-600">
            We partner with businesses of all sizes to drive transformation and deliver measurable results. Our expertise spans across sectors, helping businesses scale and innovate.
          </p>
        </div>

        {/* Right Column - Logo Grid */}
        <div className="grid grid-cols-3 gap-6">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="flex items-center justify-center rounded-none bg-transparent p-0 sm:rounded-lg sm:bg-white sm:p-4 transition-all duration-300 hover:bg-white/90"
            >
              <img
                src={logo}
                alt={`Company Logo ${index + 1}`}
                className="h-16 sm:h-12 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyLogos;
