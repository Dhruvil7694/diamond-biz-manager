
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Gem, Shield, BarChart3, Users, Layers, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-diamond-50 to-white py-12 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-diamond-300 to-diamond-600 mb-8 shadow-lg">
            <Gem className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-diamond-900 mb-6">
            Diamond Business Management System
          </h1>
          <p className="text-xl text-diamond-700 max-w-3xl mx-auto mb-10">
            Streamline your diamond inventory, client relationships, billing, and analytics with our specialized management platform
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-6 text-base bg-diamond-600 hover:bg-diamond-700">
              <Link to="/login">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base border-diamond-300 text-diamond-700 hover:bg-diamond-50">
              <a href="#features">
                Learn More
              </a>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Features Section */}
      <section id="features" className="py-16 bg-diamond-50 bg-opacity-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-diamond-900 mb-4">Key Features</h2>
            <p className="text-lg text-diamond-700 max-w-2xl mx-auto">
              Our comprehensive solution is built specifically for diamond merchants with industry-specific tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-diamond-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-diamond-100 flex items-center justify-center text-diamond-600 mb-4">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-diamond-900 mb-2">Diamond Inventory Management</h3>
              <p className="text-diamond-700">
                Track your diamonds with 4P plus/minus categorization, kapan management, and detailed inventory control
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-diamond-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-diamond-100 flex items-center justify-center text-diamond-600 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-diamond-900 mb-2">Client Relationship Management</h3>
              <p className="text-diamond-700">
                Manage client profiles, custom pricing agreements, payment terms, and complete transaction history
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-diamond-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-diamond-100 flex items-center justify-center text-diamond-600 mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-diamond-900 mb-2">Secure Multi-User Access</h3>
              <p className="text-diamond-700">
                Role-based authentication for administrators, managers, and data entry personnel with appropriate permissions
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-diamond-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-diamond-100 flex items-center justify-center text-diamond-600 mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-diamond-900 mb-2">Comprehensive Analytics</h3>
              <p className="text-diamond-700">
                Track business performance with monthly and yearly analytics, client distribution, and category-wise reports
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-diamond-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-diamond-100 flex items-center justify-center text-diamond-600 mb-4">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-diamond-900 mb-2">Automated Invoicing</h3>
              <p className="text-diamond-700">
                Generate professional invoices based on diamond entries with client-specific pricing and payment tracking
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-diamond-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-diamond-100 flex items-center justify-center text-diamond-600 mb-4">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-diamond-900 mb-2">Market Rate Tracking</h3>
              <p className="text-diamond-700">
                Keep track of market rate fluctuations and apply current rates automatically to new diamond entries
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-diamond-600 to-diamond-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to streamline your diamond business?</h2>
          <p className="text-xl mb-8 text-diamond-100 max-w-2xl mx-auto">
            Sign up now and experience the power of specialized diamond business management
          </p>
          <Button asChild size="lg" variant="secondary" className="h-12 px-6 text-base">
            <Link to="/login">
              Get Started Now
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-diamond-900 text-diamond-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Gem className="h-5 w-5 mr-2" />
              <span className="font-semibold">Diamond Business Management System</span>
            </div>
            <div className="text-sm">
              &copy; {new Date().getFullYear()} DBMS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
