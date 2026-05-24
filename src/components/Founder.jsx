import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const About = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  
  const aboutContent = {
  title: "Growth Begins in the Mind. Scale Begins in Consciousness.",
  introduction: "Hi, I'm Dharneesh.",
  mainContent: [
    "Over the past <span style='color: #FFFFFF; font-weight: 700;'>23+ years</span>, I've built systems, scaled products, and created measurable business impact working with global giants like <span style='color: #FFFFFF; font-weight: 700;'>Samsung, Philips, Unilever, and GlaxoSmithKline</span>, and later founding ventures like <span style='color: #FFFFFF; font-weight: 700;'>Recibo.AI, EAZY.AI, Magnafic and Eterno</span>, now serving <span style='color: #FFFFFF; font-weight: 700;'>650+ brands across 8 countries</span>.",
    "I work at the intersection of <span style='color: #FFFFFF; font-weight: 700;'>Brand Strategy</span>, <span style='color: #FFFFFF; font-weight: 700;'>Business Coaching</span>, and <span style='color: #FFFFFF; font-weight: 700;'>Human Transformation</span>.",
    "I believe better businesses are built at the intersection of clear thinking, aligned energy and intelligent systems.",
    "My work sits where conscious brand building, AI-powered growth, founder performance and human potential meet, because lasting scale comes from optimizing both the business and the builder.",
    "<span style='color: #FFFFFF; font-weight: 700;'>Iconic brands are built when scalable systems, conscious leadership and human optimization come together.</span>"
  ]
};

  return (
    <section id="about" className="pt-16 pb-16 px-6 rounded-3xl" style={{ backgroundColor: '#000047' }} ref={ref}>
      <div className="container mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Title */}
          <motion.h2 
            className="text-4xl font-bold text-center mb-12 text-white"
            variants={itemVariants}
          >
            About the Founder
          </motion.h2>

          {/* Two Column Grid */}
          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center"
            variants={containerVariants}
          >
            {/* Left Column - Content */}
            <motion.div variants={itemVariants}>
              <motion.h3 
                className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-md"
                variants={itemVariants}
              >
                {aboutContent.title}
              </motion.h3>
              
              <motion.p 
                className="text-lg text-white mb-8 leading-relaxed"
                variants={itemVariants}
              >
                {aboutContent.introduction}
              </motion.p>
              
              <div className="space-y-6">
                {aboutContent.mainContent.map((paragraph, index) => (
                  <motion.p 
                    key={`content-${index}`}
                    className="text-lg text-white leading-relaxed"
                    variants={itemVariants}
                    custom={index}
                    dangerouslySetInnerHTML={{ __html: paragraph }}
                  />
                ))}
              </div>
              
              {/* Signature Image */}
              <motion.div 
                className="mt-8 flex justify-end"
                variants={itemVariants}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <motion.img
                  src="/bold signature.png"
                  alt="Dharneesh Signature"
                  className="h-16 w-auto"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>
            </motion.div>

            {/* Right Column - Image */}
            <motion.div variants={itemVariants}>
              <motion.div 
                className="relative overflow-hidden rounded-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.img
                  src="/About.png"
                  alt="About Dharneesh"
                  className="w-3/4 h-auto object-cover rounded-full mx-auto"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
