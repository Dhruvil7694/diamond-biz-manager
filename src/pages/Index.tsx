import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Gem, 
  Shield, 
  BarChart3, 
  Users, 
  Layers, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  TrendingUp,
  Sparkles,
  Globe,
  Phone,
  Mail,
  ChevronRight,
  ArrowUpRight,
  Menu,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useViewport, Breakpoint } from '@/contexts/ViewportContext';
import { cn } from '@/lib/utils';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useViewport();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Handle scroll for navbar effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Close mobile menu when navigating to a section via anchor link
  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-diamond-50">
      {/* Responsive Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-2 sm:py-3' : 'bg-transparent py-3 sm:py-6'}`}>
        <div className="container-responsive mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-diamond-500 to-diamond-700 rounded-lg p-1.5 sm:p-2 shadow-md">
              <Gem className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl text-diamond-900">DBMS</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a href="#features" className="text-diamond-700 hover:text-diamond-900 font-medium transition-colors">Features</a>
            <a href="#testimonials" className="text-diamond-700 hover:text-diamond-900 font-medium transition-colors">Testimonials</a>
            <a href="#pricing" className="text-diamond-700 hover:text-diamond-900 font-medium transition-colors">Pricing</a>
            <a href="#contact" className="text-diamond-700 hover:text-diamond-900 font-medium transition-colors">Contact</a>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button asChild variant="outline" className="hidden sm:flex border-diamond-300 text-diamond-700 hover:bg-diamond-50 px-3 sm:px-4 py-1 sm:py-2 h-auto">
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild className="bg-diamond-600 hover:bg-diamond-700 shadow-lg shadow-diamond-300/30 px-3 sm:px-4 py-1 sm:py-2 h-auto text-sm sm:text-base">
              <Link to="/signup">Sign Up Free</Link>
            </Button>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-1.5 rounded-md text-diamond-700 hover:bg-diamond-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-diamond-100 shadow-lg">
            <div className="container-responsive mx-auto py-4 px-4">
              <div className="flex flex-col space-y-3">
                <a 
                  href="#features" 
                  className="text-diamond-700 hover:text-diamond-900 font-medium transition-colors py-2 px-3 rounded-md hover:bg-diamond-50"
                  onClick={handleMobileNavClick}
                >
                  Features
                </a>
                <a 
                  href="#testimonials" 
                  className="text-diamond-700 hover:text-diamond-900 font-medium transition-colors py-2 px-3 rounded-md hover:bg-diamond-50"
                  onClick={handleMobileNavClick}
                >
                  Testimonials
                </a>
                <a 
                  href="#pricing" 
                  className="text-diamond-700 hover:text-diamond-900 font-medium transition-colors py-2 px-3 rounded-md hover:bg-diamond-50"
                  onClick={handleMobileNavClick}
                >
                  Pricing
                </a>
                <a 
                  href="#contact" 
                  className="text-diamond-700 hover:text-diamond-900 font-medium transition-colors py-2 px-3 rounded-md hover:bg-diamond-50"
                  onClick={handleMobileNavClick}
                >
                  Contact
                </a>
                <Link 
                  to="/login"
                  className="block sm:hidden text-diamond-700 hover:text-diamond-900 font-medium transition-colors py-2 px-3 rounded-md hover:bg-diamond-50"
                  onClick={handleMobileNavClick}
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-diamond-50 via-white to-diamond-100 pt-24 sm:pt-32 md:pt-40 pb-16 sm:pb-24 md:pb-32 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 right-0 w-64 md:w-96 h-64 md:h-96 bg-diamond-300/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-48 md:w-72 h-48 md:h-72 bg-diamond-200/30 rounded-full filter blur-3xl"></div>
        
        <div className="container-responsive mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            <motion.div 
              className="lg:w-1/2 text-center lg:text-left"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-diamond-100 text-diamond-700 font-medium text-xs sm:text-sm mb-4 sm:mb-6">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Next-Generation Diamond Management
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-diamond-900 mb-4 sm:mb-6 leading-tight">
                Diamond Business <span className="bg-clip-text text-transparent bg-gradient-to-r from-diamond-600 to-diamond-800">Management System</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-diamond-700 mb-6 sm:mb-10 max-w-xl mx-auto lg:mx-0">
                Streamline your diamond inventory, client relationships, billing, and analytics with our specialized platform built for modern diamond merchants.
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4">
                <Button asChild size="lg" className="h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 text-sm sm:text-base bg-gradient-to-r from-diamond-600 to-diamond-800 hover:opacity-90 shadow-xl shadow-diamond-300/30 transition-all duration-300">
                  <Link to="/login" className="flex items-center">
                    Get Started Now
                    <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 text-sm sm:text-base border-diamond-300 text-diamond-700 hover:bg-diamond-50 hover:border-diamond-400 transition-all duration-300">
                  <a href="#features" className="flex items-center">
                    Watch Demo
                    <svg className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                </Button>
              </div>
              
              <div className="mt-6 sm:mt-10 flex items-center justify-center lg:justify-start space-x-4 sm:space-x-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-diamond-${i*100 + 200} flex items-center justify-center text-white text-xs font-bold`}>
                      {i === 4 ? '+' : ''}
                    </div>
                  ))}
                </div>
                <div className="text-diamond-700 text-sm sm:text-base">
                  <span className="font-bold text-diamond-900">500+</span> diamond merchants trust us
                </div>
              </div>
              
              <div className="mt-4 sm:mt-6 flex items-center justify-center lg:justify-start">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="ml-2 text-diamond-700 text-sm sm:text-base">
                  <span className="font-bold text-diamond-900">4.9/5</span> from 200+ reviews
                </span>
              </div>
            </motion.div>
            
            <motion.div 
              className="w-full lg:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                {/* Dashboard preview mockup */}
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-diamond-100">
                  <div className="bg-diamond-900 h-8 sm:h-12 flex items-center px-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="p-2 sm:p-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <div className="w-full sm:w-64 bg-diamond-50 rounded-lg p-2 sm:p-3">
                        <div className="font-medium text-diamond-900 text-sm sm:text-base mb-1 sm:mb-2">Diamond Inventory</div>
                        <div className="h-20 sm:h-36 bg-white rounded border border-diamond-200 mb-1 sm:mb-2"></div>
                        <div className="flex justify-between text-xs sm:text-sm text-diamond-700">
                          <span>Total: 1,289</span>
                          <span className="text-diamond-500">+12% ↑</span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-diamond-50 rounded-lg">
                          <div className="font-medium text-diamond-900 text-sm sm:text-base mb-1 sm:mb-2">Sales Overview</div>
                          <div className="grid grid-cols-3 gap-1 sm:gap-2">
                            <div className="p-1 sm:p-2 bg-white rounded border border-diamond-200 h-6 sm:h-auto"></div>
                            <div className="p-1 sm:p-2 bg-white rounded border border-diamond-200 h-6 sm:h-auto"></div>
                            <div className="p-1 sm:p-2 bg-white rounded border border-diamond-200 h-6 sm:h-auto"></div>
                          </div>
                        </div>
                        <div className="p-2 sm:p-3 bg-diamond-50 rounded-lg">
                          <div className="font-medium text-diamond-900 text-sm sm:text-base mb-1 sm:mb-2">Client Activity</div>
                          <div className="h-8 sm:h-14 bg-white rounded border border-diamond-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating features badges - Hidden on mobile, visible on tablet+ */}
                <div className="hidden sm:flex absolute -right-4 lg:-right-12 top-20 bg-white p-2 sm:p-3 rounded-lg shadow-xl border border-diamond-100 items-center max-w-[160px] lg:max-w-none">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-diamond-100 rounded-full flex items-center justify-center text-diamond-600 mr-2 sm:mr-3 flex-shrink-0">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-diamond-900 text-sm sm:text-base">Sales +24%</div>
                    <div className="text-xs text-diamond-600">vs. last month</div>
                  </div>
                </div>
                
                <div className="hidden sm:block absolute -left-4 lg:-left-6 -bottom-4 lg:-bottom-6 bg-white p-2 sm:p-3 rounded-lg shadow-xl border border-diamond-100 max-w-[200px] lg:max-w-none">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <div className="font-medium text-diamond-900 text-xs sm:text-sm">Client Payment Received</div>
                  </div>
                  <div className="bg-diamond-50 rounded p-1 sm:p-2 text-xs sm:text-sm text-diamond-700">
                    Ace Diamond Co. paid $143,500
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Brands Section */}
        <div className="container-responsive mx-auto px-4 mt-16 sm:mt-24">
          <div className="text-center text-xs sm:text-sm text-diamond-500 font-medium uppercase tracking-wider mb-4 sm:mb-6">
            Trusted by leading diamond companies worldwide
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 md:gap-16 opacity-70">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 sm:h-12 w-20 sm:w-32 bg-diamond-200/50 rounded-md flex items-center justify-center">
                <span className="text-diamond-700 text-xs sm:text-sm font-semibold">BRAND {i}</span>
              </div>
            ))}
          </div>
        </div>
      </header>
      
      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 relative">
        <div className="absolute inset-0 bg-diamond-50 bg-opacity-60 skew-y-3 transform -translate-y-16 z-0"></div>
        
        <div className="container-responsive mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-diamond-100 text-diamond-700 font-medium text-xs sm:text-sm mb-3 sm:mb-4">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Powerful Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-diamond-900 mb-3 sm:mb-4">Everything You Need to Thrive</h2>
            <p className="text-base sm:text-lg md:text-xl text-diamond-700 max-w-2xl mx-auto">
              Our comprehensive solution is built specifically for diamond merchants with industry-specific tools to optimize every aspect of your business
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                icon: <Layers className="h-5 w-5 sm:h-6 sm:w-6" />,
                title: "Diamond Inventory Management",
                description: "Track your diamonds with 4P plus/minus categorization, kapan management, and detailed inventory control with full history tracking",
                color: "bg-blue-500"
              },
              {
                icon: <Users className="h-5 w-5 sm:h-6 sm:w-6" />,
                title: "Client Relationship Management",
                description: "Manage client profiles, custom pricing agreements, payment terms, and complete transaction history with intuitive interface",
                color: "bg-green-500"
              },
              {
                icon: <Shield className="h-5 w-5 sm:h-6 sm:w-6" />,
                title: "Secure Multi-User Access",
                description: "Role-based authentication for administrators, managers, and data entry personnel with appropriate permissions and audit logs",
                color: "bg-purple-500"
              },
              {
                icon: <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />,
                title: "Comprehensive Analytics",
                description: "Track business performance with monthly and yearly analytics, client distribution, and category-wise reports with beautiful visualizations",
                color: "bg-orange-500"
              },
              {
                icon: <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>,
                title: "Automated Invoicing",
                description: "Generate professional invoices based on diamond entries with client-specific pricing, payment tracking and automated reminders",
                color: "bg-red-500"
              },
              {
                icon: <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                </svg>,
                title: "Market Rate Tracking",
                description: "Keep track of market rate fluctuations and apply current rates automatically to new diamond entries with predictive analytics",
                color: "bg-cyan-500"
              },
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-diamond-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                variants={fadeInUp}
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${feature.color} flex items-center justify-center text-white mb-4 sm:mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-diamond-900 mb-3 sm:mb-4">{feature.title}</h3>
                <p className="text-sm sm:text-base text-diamond-700 mb-4 sm:mb-6">
                  {feature.description}
                </p>
                <a href="#" className="inline-flex items-center text-diamond-600 font-medium hover:text-diamond-800 transition-colors text-sm sm:text-base">
                  Learn more
                  <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Feature highlight */}
          <div className="mt-16 sm:mt-24 bg-white rounded-2xl shadow-xl overflow-hidden border border-diamond-100">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-100 text-blue-700 font-medium text-xs sm:text-sm mb-4 sm:mb-6 w-max">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Featured Highlight
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-diamond-900 mb-4 sm:mb-6">
                  Advanced Diamond Tracking System
                </h3>
                <p className="text-base sm:text-lg text-diamond-700 mb-6 sm:mb-8">
                  Our innovative tracking system allows you to monitor every diamond in your inventory with unparalleled precision and detail.
                </p>
                
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {[
                    "Real-time location and status updates",
                    "Complete chain-of-custody documentation",
                    "Integration with certification authorities",
                    "Custom categorization and tagging"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2 sm:mr-3">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                      <span className="text-sm sm:text-base text-diamond-700">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <Button asChild className="w-max bg-diamond-600 hover:bg-diamond-700 text-sm sm:text-base py-2 px-4 sm:py-3 sm:px-6 h-auto">
                  <a href="#" className="flex items-center">
                    Explore This Feature
                    <ArrowUpRight className="ml-1.5 sm:ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
              
              <div className="lg:w-1/2 bg-diamond-900 p-4 sm:p-8 flex items-center justify-center">
                <div className="relative w-full aspect-video bg-diamond-800 rounded-lg overflow-hidden">
                  {/* This would be an image or video in production */}
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                      <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-24 bg-gradient-to-br from-diamond-900 to-diamond-800 text-white">
        <div className="container-responsive mx-auto px-4">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 text-diamond-100 font-medium text-xs sm:text-sm mb-3 sm:mb-4">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 fill-yellow-400 text-yellow-400" />
              Client Testimonials
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">What Our Clients Say</h2>
            <p className="text-base sm:text-lg md:text-xl text-diamond-100 max-w-2xl mx-auto">
              Don't just take our word for it — hear from some of our satisfied customers
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                quote: "This system has completely transformed how we manage our diamond inventory. The tracking features alone have saved us countless hours every month.",
                name: "Michael Roberts",
                title: "CEO, Global Diamond Trading",
                avatar: "M"
              },
              {
                quote: "The client management system is intuitive and powerful. We can now track all customer interactions and preferences in one place, which has improved our sales process dramatically.",
                name: "Sarah Johnson",
                title: "Sales Director, Prestige Diamonds",
                avatar: "S"
              },
              {
                quote: "The analytics dashboard gives us insights we never had before. We can now make data-driven decisions that have increased our profitability by 22% in just six months.",
                name: "David Chen",
                title: "Operations Manager, Diamond Exchange",
                avatar: "D"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <svg className="h-6 w-6 sm:h-8 sm:w-8 text-diamond-500 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-sm sm:text-base text-diamond-100 mb-6 sm:mb-8 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-diamond-700 flex items-center justify-center text-white font-bold mr-3 sm:mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm sm:text-base">{testimonial.name}</h4>
                    <p className="text-diamond-300 text-xs sm:text-sm">{testimonial.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Stats */}
          <div className="mt-16 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { number: "500+", label: "Active Users" },
              { number: "1.2M+", label: "Diamonds Tracked" },
              { number: "98%", label: "Customer Satisfaction" },
              { number: "24/7", label: "Expert Support" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-sm sm:text-base text-diamond-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 bg-diamond-50">
        <div className="container-responsive mx-auto px-4">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-diamond-100 text-diamond-700 font-medium text-xs sm:text-sm mb-3 sm:mb-4">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Simple Pricing
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-diamond-900 mb-3 sm:mb-4">Plans for Businesses of All Sizes</h2>
            <p className="text-base sm:text-lg md:text-xl text-diamond-700 max-w-2xl mx-auto">
              Choose the perfect plan for your needs with transparent pricing and no hidden fees
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$99",
                description: "Perfect for small diamond businesses",
                features: [
                  "Up to 500 diamond entries",
                  "Basic inventory management",
                  "5 user accounts",
                  "Standard reports",
                  "Email support"
                ],
                cta: "Get Started",
                popular: false
              },
              {
                name: "Professional",
                price: "$249",
                description: "For growing diamond businesses",
                features: [
                  "Unlimited diamond entries",
                  "Advanced inventory tracking",
                  "20 user accounts",
                  "Advanced analytics dashboard",
                  "Priority email & phone support",
                  "API access",
                  "Custom client portal"
                ],
                cta: "Start 14-Day Trial",
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large diamond corporations",
                features: [
                  "Everything in Professional",
                  "Unlimited users",
                  "Custom integrations",
                  "Dedicated account manager",
                  "24/7 premium support",
                  "Advanced security features",
                  "On-premise deployment option"
                ],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, index) => (
              <motion.div 
                key={index}
                className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                  plan.popular ? 
                  'bg-white border-2 border-diamond-600 shadow-2xl shadow-diamond-300/30 md:scale-105 relative z-10' : 
                  'bg-white border border-diamond-100 shadow-xl'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                {plan.popular && (
                  <div className="bg-diamond-600 text-white text-center py-1.5 sm:py-2 font-medium text-xs sm:text-sm">
                    Most Popular
                  </div>
                )}
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-diamond-900 mb-2">{plan.name}</h3>
                  <div className="flex items-end mb-4 sm:mb-6">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-diamond-900">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-diamond-600 ml-2 text-sm sm:text-base">/month</span>}
                  </div>
                  <p className="text-sm sm:text-base text-diamond-700 mb-6 sm:mb-8">{plan.description}</p>
                  
                  <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2 sm:mr-3">
                          <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </div>
                        <span className="text-sm sm:text-base text-diamond-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button asChild 
                    className={`w-full h-auto py-2 sm:py-3 text-sm sm:text-base ${
                      plan.popular 
                        ? 'bg-diamond-600 hover:bg-diamond-700 text-white' 
                        : 'bg-white border border-diamond-300 hover:bg-diamond-50 text-diamond-700'
                    }`}
                  >
                    <a href="#contact">{plan.cta}</a>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* FAQ Section */}
          <div className="mt-16 sm:mt-24 max-w-3xl mx-auto">
            <motion.div 
              className="text-center mb-8 sm:mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-diamond-900 mb-3 sm:mb-4">Frequently Asked Questions</h3>
              <p className="text-sm sm:text-base text-diamond-700">
                Find answers to common questions about our diamond management system
              </p>
            </motion.div>
            
            <motion.div 
              className="space-y-4 sm:space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {[
                {
                  question: "How secure is your diamond management system?",
                  answer: "Our system employs bank-level security with 256-bit encryption, two-factor authentication, and regular security audits. All data is backed up in real-time to multiple secure servers."
                },
                {
                  question: "Can I import my existing diamond inventory?",
                  answer: "Yes, we offer a seamless import process for your existing inventory from Excel, CSV, or most other diamond management solutions. Our support team can assist with the migration process."
                },
                {
                  question: "Is there a mobile app available?",
                  answer: "Yes, we offer native mobile apps for iOS and Android devices, allowing you to manage your diamond inventory on the go, capture images, scan barcodes, and more."
                },
                {
                  question: "What kind of support do you offer?",
                  answer: "We provide comprehensive support including detailed documentation, video tutorials, email support, and phone support for higher-tier plans. Enterprise customers receive a dedicated account manager."
                }
              ].map((faq, index) => (
                <motion.div 
                  key={index} 
                  className="bg-white rounded-xl shadow-md border border-diamond-100 overflow-hidden"
                  variants={fadeInUp}
                >
                  <details className="group">
                    <summary className="flex items-center justify-between p-4 sm:p-6 text-base sm:text-lg font-medium text-diamond-900 cursor-pointer">
                      {faq.question}
                      <span className="transition group-open:rotate-180">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 text-sm sm:text-base text-diamond-700">
                      {faq.answer}
                    </div>
                  </details>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-24 bg-white">
        <div className="container-responsive mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-diamond-100 text-diamond-700 font-medium text-xs sm:text-sm mb-3 sm:mb-4">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Contact Us
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-diamond-900 mb-3 sm:mb-4">Get in Touch</h2>
                <p className="text-base sm:text-lg md:text-xl text-diamond-700">
                  Have questions about our diamond management system? Our team is here to help you find the perfect solution for your business.
                </p>
              </div>
              
              <form className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="first_name" className="block text-xs sm:text-sm font-medium text-diamond-700 mb-1 sm:mb-2">First Name</label>
                    <input
                      type="text"
                      id="first_name"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-diamond-300 focus:outline-none focus:ring-2 focus:ring-diamond-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-xs sm:text-sm font-medium text-diamond-700 mb-1 sm:mb-2">Last Name</label>
                    <input
                      type="text"
                      id="last_name"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-diamond-300 focus:outline-none focus:ring-2 focus:ring-diamond-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-diamond-700 mb-1 sm:mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-diamond-300 focus:outline-none focus:ring-2 focus:ring-diamond-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-xs sm:text-sm font-medium text-diamond-700 mb-1 sm:mb-2">Company Name</label>
                  <input
                    type="text"
                    id="company"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-diamond-300 focus:outline-none focus:ring-2 focus:ring-diamond-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Diamond Trading Co."
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-diamond-700 mb-1 sm:mb-2">Message</label>
                  <textarea
                    id="message"
                    rows={isMobile ? 3 : 4}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-diamond-300 focus:outline-none focus:ring-2 focus:ring-diamond-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Tell us about your needs..."
                  ></textarea>
                </div>
                
                <Button size="lg" className="w-full bg-diamond-600 hover:bg-diamond-700 h-auto py-2 sm:py-3 text-sm sm:text-base">
                  Send Message
                </Button>
              </form>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="bg-diamond-50 p-6 sm:p-8 rounded-2xl h-full">
                <h3 className="text-xl sm:text-2xl font-bold text-diamond-900 mb-4 sm:mb-6">Contact Information</h3>
                
                <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                  <div className="flex items-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-diamond-100 flex items-center justify-center text-diamond-600 mr-3 sm:mr-4 flex-shrink-0">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-diamond-900 mb-1 text-sm sm:text-base">Email Us</h4>
                      <a href="mailto:contact@dbms.com" className="text-diamond-700 hover:text-diamond-600 text-sm sm:text-base">
                        contact@dbms.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-diamond-100 flex items-center justify-center text-diamond-600 mr-3 sm:mr-4 flex-shrink-0">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-diamond-900 mb-1 text-sm sm:text-base">Call Us</h4>
                      <a href="tel:+11234567890" className="text-diamond-700 hover:text-diamond-600 text-sm sm:text-base">
                        +1 (123) 456-7890
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-diamond-100 flex items-center justify-center text-diamond-600 mr-3 sm:mr-4 flex-shrink-0">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-diamond-900 mb-1 text-sm sm:text-base">Visit Us</h4>
                      <address className="text-diamond-700 not-italic text-sm sm:text-base">
                        Diamond Tower<br />
                        123 Gem Street<br />
                        New York, NY 10001
                      </address>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-diamond-900 mb-3 sm:mb-4">Business Hours</h3>
                <div className="space-y-2 text-diamond-700 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>Closed</span>
                  </div>
                </div>
                
                <div className="mt-8 sm:mt-12">
                  <h3 className="text-lg sm:text-xl font-bold text-diamond-900 mb-3 sm:mb-4">Follow Us</h3>
                  <div className="flex space-x-3 sm:space-x-4">
                    {['facebook', 'twitter', 'instagram', 'linkedin'].map((social, index) => (
                      <a 
                        key={index}
                        href="#" 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-diamond-600 hover:bg-diamond-600 hover:text-white transition-colors border border-diamond-200"
                      >
                        <span className="sr-only">{social}</span>
                        {/* Social icons would go here */}
                        <div className="w-4 h-4 sm:w-5 sm:h-5">{social[0].toUpperCase()}</div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-diamond-600 to-diamond-800 text-white">
        <div className="container-responsive mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Ready to transform your diamond business?</h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-diamond-100 max-w-2xl mx-auto">
              Join hundreds of diamond merchants already using our platform to streamline operations and boost profitability
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Button asChild size="lg" variant="secondary" className="h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 text-sm sm:text-base bg-white text-diamond-800 hover:bg-diamond-50">
                <Link to="/signup" className="flex items-center justify-center">
                  Start Free Trial
                  <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 text-sm sm:text-base border-white text-white hover:bg-white/10">
                <a href="#contact" className="flex items-center justify-center">
                  Contact Sales
                </a>
              </Button>
            </div>
            
            <div className="mt-6 sm:mt-8 md:mt-12 text-diamond-100 text-sm sm:text-base flex items-center justify-center">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
              <span>No credit card required for trial</span>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-diamond-900 text-diamond-100 pt-12 sm:pt-16 pb-6 sm:pb-8">
        <div className="container-responsive mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                <div className="bg-gradient-to-r from-diamond-500 to-diamond-700 rounded-lg p-1.5 sm:p-2">
                  <Gem className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="font-bold text-lg sm:text-xl text-white">DBMS</span>
              </div>
              <p className="text-sm sm:text-base text-diamond-300 mb-4 sm:mb-6">
                The ultimate business management system designed specifically for diamond merchants and traders.
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((social, index) => (
                  <a 
                    key={index}
                    href="#" 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-diamond-800 flex items-center justify-center text-diamond-300 hover:bg-diamond-600 hover:text-white transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    {/* Social icons would go here */}
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4">{social[0].toUpperCase()}</div>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white text-base sm:text-lg mb-4 sm:mb-6">Quick Links</h4>
              <ul className="space-y-2 sm:space-y-3">
                {['Home', 'Features', 'Pricing', 'Testimonials', 'Contact', 'Blog'].map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-diamond-300 hover:text-white transition-colors text-sm sm:text-base">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white text-base sm:text-lg mb-4 sm:mb-6">Resources</h4>
              <ul className="space-y-2 sm:space-y-3">
                {['Help Center', 'Documentation', 'API', 'Status', 'Terms of Service', 'Privacy Policy'].map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-diamond-300 hover:text-white transition-colors text-sm sm:text-base">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white text-base sm:text-lg mb-4 sm:mb-6">Subscribe</h4>
              <p className="text-diamond-300 mb-4 text-sm sm:text-base">
                Subscribe to our newsletter for the latest updates and features
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-3 sm:px-4 py-2 rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-diamond-500 w-full text-sm sm:text-base"
                />
                <button className="bg-diamond-600 hover:bg-diamond-700 text-white px-3 sm:px-4 py-2 rounded-r-lg transition-colors">
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </form>
            </div>
          </div>
          
          <div className="pt-6 sm:pt-8 border-t border-diamond-800 flex flex-col md:flex-row justify-between items-center">
            <div className="text-diamond-400 mb-4 md:mb-0 text-sm sm:text-base text-center md:text-left">
              &copy; {new Date().getFullYear()} Diamond Business Management System. All rights reserved.
            </div>
            <div className="flex space-x-4 sm:space-x-6 text-sm sm:text-base">
              <a href="#" className="text-diamond-400 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-diamond-400 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-diamond-400 hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;