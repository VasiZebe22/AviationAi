/* Main Homepage Component
 * Renders the landing page with multiple sections:
 * - Hero: Main banner with call-to-action
 * - Features: Platform capabilities
 * - Pricing: Subscription options
 * - FAQ: Common questions
 * - About: Company information
 */
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { motion } from 'framer-motion';

const FeatureCard = ({ title, description, icon }) => (
  <motion.div
    className="bg-surface-dark rounded-lg p-6 hover:bg-surface-light transition-colors duration-300"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="text-accent-lilac mb-4">{icon}</div>
    <h3 className="text-sm font-medium text-gray-100 mb-2">{title}</h3>
    <p className="text-xs leading-relaxed text-gray-400">{description}</p>
  </motion.div>
);

const PricingCard = ({ title, price, features, isPopular }) => (
  <motion.div
    className={`bg-surface-dark rounded-lg p-6 ${isPopular ? 'ring-2 ring-accent-lilac' : ''}`}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="mb-4">
      {isPopular && (
        <span className="bg-accent-lilac text-white text-xs font-medium px-2.5 py-1 rounded-full">
          Most Popular
        </span>
      )}
    </div>
    <h3 className="text-lg font-medium text-gray-100">{title}</h3>
    <div className="mt-2 mb-4">
      <span className="text-2xl font-bold text-gray-100">${price}</span>
      {price > 0 && <span className="text-gray-400 text-xs">/month</span>}
    </div>
    <ul className="space-y-3 mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center text-sm text-gray-400">
          <svg className="w-4 h-4 text-accent-lilac mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {feature}
        </li>
      ))}
    </ul>
    <button
      className={`w-full py-2.5 rounded-md text-sm font-medium transition-colors duration-200 
        ${isPopular 
          ? 'bg-accent-lilac hover:bg-accent-lilac-dark text-white' 
          : 'bg-dark-lighter hover:bg-dark-lightest text-gray-300'}`}
    >
      Get Started
    </button>
  </motion.div>
);

const Homepage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'AI-Powered Queries',
      description: 'Get instant, accurate answers to your aviation-related questions using our advanced AI system.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Expert Training Materials',
      description: 'Access comprehensive training content curated by aviation professionals.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: '24/7 Accessibility',
      description: 'Learn and practice at your own pace with unlimited access to our platform.',
    },
  ];

  const pricingPlans = [
    {
      title: 'Free',
      price: 0,
      features: [
        '5 AI Credits per month',
        'Basic query support',
        'Access to documentation',
        'Community support',
      ],
    },
    {
      title: 'Pro',
      price: 29,
      features: [
        '100 AI Credits per month',
        'Priority query support',
        'Advanced analytics',
        'Email support',
        'Custom training paths',
      ],
      isPopular: true,
    },
    {
      title: 'Enterprise',
      price: 99,
      features: [
        'Unlimited AI Credits',
        'Premium support',
        'Custom integrations',
        '24/7 phone support',
        'Team collaboration',
        'Custom training',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="py-16 sm:py-24">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-gray-100 mb-4">
              Revolutionize Aviation Learning with AI
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto mb-8">
              Experience the future of aviation training with our AI-powered platform. 
              Get instant access to expert knowledge and personalized learning paths.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2.5 bg-accent-lilac hover:bg-accent-lilac-dark text-white text-xs font-medium rounded-md transition-colors duration-200"
              >
                Get Started
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('features');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-2.5 bg-dark-lighter hover:bg-dark-lightest text-gray-300 text-xs font-medium rounded-md transition-colors duration-200"
              >
                Learn More
              </button>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="py-16" id="features">
          <h2 className="text-sm font-medium tracking-wide text-gray-300 uppercase text-center mb-8">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-16" id="pricing">
          <div className="text-center mb-12">
            <h2 className="text-sm font-medium tracking-wide text-gray-300 uppercase mb-2">
              Pricing Plans
            </h2>
            <p className="text-xs text-gray-400">
              Choose the perfect plan for your aviation journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <PricingCard key={index} {...plan} />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16">
          <motion.div
            className="bg-surface-dark rounded-lg p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-medium text-gray-100 mb-3">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xs text-gray-400 mb-6 max-w-2xl mx-auto">
              Join thousands of aviation professionals who trust our AI-powered platform for their training needs.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-3 bg-accent-lilac hover:bg-accent-lilac-dark text-white text-xs font-medium rounded-md transition-colors duration-200"
            >
              Start Free Trial
            </button>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-lightest mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Aviation AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
