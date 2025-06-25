import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Shield, 
  Users, 
  CheckCircle, 
  Smartphone,
  ArrowRight,
  Mail,
  CalendarCheck,
  Fingerprint
} from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-800 to-green-600 text-white py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/20 blur-xl"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-white/10 blur-xl"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="lg:w-1/2 space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500">
                  Modern Attendance
                </span><br />
                With Biometric Verification
              </h1>
              <p className="text-xl text-green-100 max-w-2xl">
                Secure, reliable, and effortless attendance management for organizations of all sizes.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-yellow-500/30 transition-all"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}
                  className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                >
                  Explore Features
                </Button>
              </div>
              
              <div className="flex items-center gap-4 pt-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30"></div>
                  ))}
                </div>
                <div className="text-green-100">
                  <p className="font-medium">Trusted by 500+ organizations</p>
                  <div className="flex items-center gap-1 text-yellow-300">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1">5.0</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 flex justify-center relative">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-green-400/10 rounded-full blur-xl"></div>
                
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-green-400"></div>
                  
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="p-4 bg-green-500/10 rounded-full">
                      <Fingerprint className="w-12 h-12 text-yellow-400" />
                    </div>
                    <h3 className="text-2xl font-bold">Biometric Check-In</h3>
                    <p className="text-green-100">Fast, secure verification with facial recognition</p>
                    
                    <div className="w-full bg-black/20 rounded-lg overflow-hidden">
                      <div className="h-48 bg-gradient-to-b from-black/30 to-black/50 flex items-center justify-center">
                        <CalendarCheck className="w-16 h-16 text-white/50" />
                      </div>
                    </div>
                    
                    <Button 
                      size="lg"
                      onClick={() => navigate('/demo')}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    >
                      Try Demo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
              KEY FEATURES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for <span className="text-green-600">Modern Attendance</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              CheckInPro combines cutting-edge technology with intuitive design for seamless attendance management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8 text-green-600" />,
                title: "Biometric Verification",
                description: "Advanced face recognition prevents buddy-punching and ensures accurate attendance records."
              },
              {
                icon: <MapPin className="h-8 w-8 text-green-600" />,
                title: "Location Tracking",
                description: "GPS verification confirms employees are at the correct location during check-in."
              },
              {
                icon: <Users className="h-8 w-8 text-green-600" />,
                title: "Team Management",
                description: "Organize employees into teams and departments with customized access levels."
              },
              {
                icon: <Smartphone className="h-8 w-8 text-green-600" />,
                title: "Mobile Friendly",
                description: "Full functionality on any device with our responsive web application."
              },
              {
                icon: <CheckCircle className="h-8 w-8 text-green-600" />,
                title: "Real-time Updates",
                description: "Instant notifications and live status updates for all attendance activities."
              },
              {
                icon: <Clock className="h-8 w-8 text-green-600" />,
                title: "Advanced Analytics",
                description: "Comprehensive reports and insights into attendance patterns and trends."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100"
              >
                <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-50">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              TRUSTED BY INDUSTRY LEADERS
            </div>
            <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 mb-8">
              "CheckInPro revolutionized our attendance tracking, reducing time theft by 78% and saving us over $200k annually in payroll discrepancies."
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div>
                <p className="font-medium text-gray-900">John Doe</p>
                <p className="text-gray-600">HR Director, TechCorp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white blur-xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-white blur-xl"></div>
            </div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Attendance System?</h2>
              <p className="text-xl text-green-100 mb-8">
                Join thousands of organizations worldwide that trust CheckInPro for reliable, secure attendance tracking.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/login')}
                  className="bg-white text-green-700 hover:bg-gray-100 shadow-lg px-8"
                >
                  Get Started Free
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => window.location.href = "mailto:contact@checkinpro.com"}
                  className="border-white text-white hover:bg-white/10 px-8"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between gap-12">
            <div className="lg:w-1/3">
              <h2 className="text-2xl font-bold mb-4">CheckInPro</h2>
              <p className="text-gray-400 mb-6">
                The most advanced biometric attendance system for modern organizations.
              </p>
              <div className="flex space-x-4">
                {['Twitter', 'Facebook', 'LinkedIn', 'Instagram'].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:w-2/3">
              <div>
                <h3 className="text-lg font-semibold mb-4">Product</h3>
                <ul className="space-y-3">
                  {['Features', 'Pricing', 'Demo', 'Integrations'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-3">
                  {['About', 'Careers', 'Blog', 'Contact'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <ul className="space-y-3">
                  {['Documentation', 'Help Center', 'API Status', 'Webinars'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} CheckInPro. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;