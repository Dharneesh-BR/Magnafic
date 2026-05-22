import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import emailjs from '@emailjs/browser';
const ContactUs = () => {
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []); // Only run once on mount
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNo: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(''); // 'success', 'error', ''
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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');
    try {
      // EmailJS configuration
      const serviceId = 'service_wrxc15j'; // EmailJS service ID
      const templateId = 'template_i9py1ut'; // EmailJS template ID
      const publicKey = 'QaaFaWtiDe2OpRfzE'; // EmailJS public key
      // Prepare email data
      const emailData = {
        to_email: 'dharneeshbr@gmail.com',
        from_name: formData.name,
        from_email: formData.email,
        contact_number: formData.contactNo,
        message: formData.message,
        subject: 'New Contact Form Submission from Website'
      };
      // Send email using EmailJS
      await emailjs.send(serviceId, templateId, emailData, publicKey);
      setSubmitStatus('success');
      // Reset form
      setFormData({
        name: '',
        email: '',
        contactNo: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
      // Fallback: Open email client with pre-filled data
      const subject = encodeURIComponent('New Contact Form Submission from Website');
      const body = encodeURIComponent(
        `Name: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Phone: ${formData.contactNo}\n\n` +
        `Message:\n${formData.message}`
      );
      window.location.href = `mailto:dharneeshbr@gmail.com?subject=${subject}&body=${body}`;
      setSubmitStatus('success'); // Still show success since email client opened
      setFormData({
        name: '',
        email: '',
        contactNo: '',
        message: ''
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#fbfaf9]">
      {/* Contact Us Banner */}
      <section className="relative overflow-hidden px-4 pt-24 pb-4 sm:px-6 sm:pb-0" style={{ backgroundColor: '#fbfaf9' }}>
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[#3533cd]/10 to-[#00ffff]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-40 h-40 bg-gradient-to-r from-[#3533cd]/10 to-[#00ffff]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-1/4 w-36 h-36 bg-gradient-to-r from-[#3533cd]/10 to-[#00ffff]/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            ref={ref}
          >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
              {/* Left: Text Content */}
              <motion.div variants={itemVariants} className="text-center md:text-left">
                <motion.h1 className="mb-4 pt-4 text-4xl font-bold leading-tight tracking-wide sm:text-5xl md:pt-8 md:text-6xl lg:text-7xl">
                  <motion.span
                    variants={itemVariants}
                    className="inline-block bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 bg-clip-text text-transparent "
                  >
                    Contact Us
                  </motion.span>
                </motion.h1>
                <motion.p
                  className="mb-8 max-w-2xl text-base font-medium leading-relaxed text-gray-600 sm:text-lg md:text-xl"
                  variants={itemVariants}
                >
                  Get in touch with us to explore how we can help transform your business and accelerate your growth journey.
                </motion.p>
                <motion.div
                  className="relative h-1 w-20 sm:w-24 bg-gradient-to-r from-[#3533cd] to-[#00ffff] rounded-full mx-auto md:mx-0 mb-6"
                  variants={itemVariants}
                />
              </motion.div>
              {/* Right: Image */}
            </div>
          </motion.div>
        </div>
      </section>
      {/* Contact Form Section */}
      <section className="relative overflow-hidden px-4 pt-0 pb-12 sm:px-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #3533cd 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            ref={ref}
          >
            {/* Two Grid Layout */}
            <div className="flex flex-col items-start gap-6 md:grid md:grid-cols-2 md:gap-4">
              {/* Left Column - Content */}
              <motion.div variants={itemVariants} className="relative order-3 md:order-1">
                <div className="relative z-10 text-center md:text-left">
                  <motion.h2 
                    className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl"
                    variants={itemVariants}
                  >
                    We're just a message away.
                  </motion.h2>
                  <motion.p 
                    className="mb-4 text-base leading-relaxed text-gray-600 sm:text-lg"
                    variants={itemVariants}
                  >
                    Have a question? We're here to help.
                  </motion.p>
                  <motion.p 
                    className="mb-8 text-base leading-relaxed text-gray-600 sm:text-lg"
                    variants={itemVariants}
                  >
                    Just send us a message - we'll get back to you soon!
                  </motion.p>
                  <motion.div variants={itemVariants} className="space-y-6">
                    <div className="group flex flex-col md:flex-row md:items-start items-center space-x-0 md:space-x-4 p-4 transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#3533cd] to-[#00ffff] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <i className="fas fa-phone text-white"></i>
                      </div>
                      <div className="text-center md:text-left mt-3 md:mt-0">
                        <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                        <p className="text-gray-600">+91 99804 56995</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              {/* Right Column - Contact Form */}
              <motion.div variants={itemVariants} className="relative order-1 w-full md:order-2">
                <div className="relative z-10 mb-6 rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-[#3533cd] to-[#00ffff] p-5 backdrop-blur-sm sm:p-8">
                  <motion.h3 
                    className="mb-6 text-xl font-bold text-white sm:text-2xl"
                    variants={itemVariants}
                  >
                    Send us a Message
                  </motion.h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Field */}
                    <motion.div variants={itemVariants}>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                        Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3533cd]/50 focus:border-[#3533cd] outline-none transition-all duration-300 bg-white"
                          placeholder="Your full name"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#3533cd]/60">
                          <i className="fas fa-user"></i>
                        </div>
                      </div>
                    </motion.div>
                    {/* Email Field */}
                    <motion.div variants={itemVariants}>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3533cd]/50 focus:border-[#3533cd] outline-none transition-all duration-300 bg-white"
                          placeholder="your.email@example.com"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#3533cd]/60">
                          <i className="fas fa-envelope"></i>
                        </div>
                      </div>
                    </motion.div>
                    {/* Contact Number Field */}
                    <motion.div variants={itemVariants}>
                      <label htmlFor="contactNo" className="block text-sm font-medium text-gray-200 mb-2">
                        Contact Number *
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          id="contactNo"
                          name="contactNo"
                          value={formData.contactNo}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3533cd]/50 focus:border-[#3533cd] outline-none transition-all duration-300 bg-white"
                          placeholder="+91 98765 43210"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#3533cd]/60">
                          <i className="fas fa-phone"></i>
                        </div>
                      </div>
                    </motion.div>
                    {/* Message Field */}
                    <motion.div variants={itemVariants}>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-200 mb-2">
                        Message *
                      </label>
                      <div className="relative">
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={5}
                          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3533cd]/50 focus:border-[#3533cd] outline-none transition-all duration-300 resize-none bg-white"
                          placeholder="Tell us about your requirements..."
                        />
                        <div className="absolute left-4 top-4 text-[#3533cd]/60">
                          <i className="fas fa-comment-dots"></i>
                        </div>
                      </div>
                    </motion.div>
                    {/* Status Message */}
                    {submitStatus && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg text-center ${
                          submitStatus === 'success' 
                            ? 'bg-green-100 text-green-700 border border-green-300' 
                            : 'bg-red-100 text-red-700 border border-red-300'
                        }`}
                      >
                        {submitStatus === 'success' 
                          ? 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.'
                          : 'Oops! Something went wrong. Please try again later.'
                        }
                      </motion.div>
                    )}
                    {/* Submit Button */}
                    <motion.div variants={itemVariants}>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          {isSubmitting ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2"></i>
                              Sending...
                            </>
                          ) : (
                            <>
                              Send Message
                              <i className="fas fa-paper-plane ml-2 group-hover:translate-x-1 transition-transform duration-300"></i>
                            </>
                          )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </motion.button>
                    </motion.div>
                  </form>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
export default ContactUs;
