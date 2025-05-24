
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Shield, 
  Users, 
  CheckCircle, 
  Smartphone 
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-green-900 from-primary/90 to-primary/70 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Modern Attendance Tracking with Biometric Verification
              </h1>
              <p className="text-lg md:text-xl opacity-90">
                Experience a secure, reliable, and easy-to-use platform for your organization's attendance management.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/login')} 
                  className="bg-yellow-600 text-white hover:bg-yellow-800/90"
                >
                  Sign In
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})} 
                  className="border-white text-green-900 hover:bg-green-300/10"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="w-72 h-72 md:w-96 md:h-96 bg-white/10 rounded-full absolute animate-pulse"></div>
                <div className="w-64 h-64 md:w-80 md:h-80 bg-white/20 rounded-full absolute top-4 left-4"></div>
                <div className="w-48 h-48 md:w-64 md:h-64 bg-white/30 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center">
                  <Clock className="w-24 h-24 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              CheckInPro offers a comprehensive set of features to make attendance tracking effortless and secure
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-10 w-10 text-green-900" />,
                title: "Biometric Verification",
                description: "Face recognition technology ensures that check-ins are legitimate and prevents buddy-punching."
              },
              {
                icon: <MapPin className="h-10 w-10 text-green-900" />,
                title: "Location Tracking",
                description: "GPS verification confirms employees are at the correct location when checking in."
              },
              {
                icon: <Users className="h-10 w-10 text-green-900" />,
                title: "Team Management",
                description: "Organize employees into teams and departments for better attendance oversight."
              },
              {
                icon: <Smartphone className="h-10 w-10 text-green-900" />,
                title: "Mobile Friendly",
                description: "Check in from anywhere using our responsive web application on any device."
              },
              {
                icon: <CheckCircle className="h-10 w-10 text-green-900" />,
                title: "Real-time Updates",
                description: "Get instant notifications and status updates for team check-ins and check-outs."
              },
              {
                icon: <Clock className="h-10 w-10 text-green-900" />,
                title: "Attendance Analytics",
                description: "Comprehensive reports and insights into attendance patterns and trends."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-5 inline-block p-3 bg-green-900/10 rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Attendance System?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join organizations worldwide that trust CheckInPro for reliable, secure attendance tracking.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/login')}>
              Get Started Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.location.href = "mailto:contact@checkinpro.com"}>
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold ml-20">CheckInPro</h2>
              <p className="text-gray-400 mt-2">Enterprise attendance tracking solution</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Product</h3>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                  <li><a href="mailto:contact@checkinpro.com" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="mailto:support@checkinpro.com" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Company</h3>
                <ul className="space-y-2">
                  <li><a href="mailto:info@checkinpro.com" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                  <li><a href="mailto:careers@checkinpro.com" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                  <li><a href="mailto:contact@checkinpro.com" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-white mt-12 pt-8 text-center text-yellow-300">
            <p>&copy; {new Date().getFullYear()} CheckInPro - A Joseik Solutions Limited Software. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
