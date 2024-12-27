import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar/Navbar';

const FeatureCard = ({ icon, title, description }) => (
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

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Advanced AI Chat',
      description: 'Engage with our sophisticated aviation AI for real-time assistance and expert guidance.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      title: 'Weather Analysis',
      description: 'Get detailed weather interpretations and forecasts tailored for aviation purposes.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      title: 'Navigation Tools',
      description: 'Access comprehensive navigation calculations and route planning assistance.',
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
              Your AI Aviation Assistant
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto mb-8">
              Experience the future of aviation with our advanced AI-powered platform. 
              Get instant access to expert knowledge, weather analysis, and navigation assistance.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2.5 bg-accent-lilac hover:bg-accent-lilac-dark text-white text-xs font-medium rounded-md transition-colors duration-200"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/features')}
                className="px-6 py-2.5 bg-dark-lighter hover:bg-dark-lightest text-gray-300 text-xs font-medium rounded-md transition-colors duration-200"
              >
                Learn More
              </button>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="py-12">
          <h2 className="text-sm font-medium tracking-wide text-gray-300 uppercase text-center mb-8">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16">
          <motion.div
            className="bg-surface-dark rounded-lg p-8 text-center hover:bg-surface-light transition-colors duration-300"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-medium text-gray-100 mb-3">
              Ready to Elevate Your Aviation Experience?
            </h2>
            <p className="text-xs text-gray-400 mb-6 max-w-2xl mx-auto">
              Join thousands of aviation professionals who trust our AI-powered platform for their daily operations.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-3 bg-accent-lilac hover:bg-accent-lilac-dark text-white text-xs font-medium rounded-md transition-colors duration-200"
            >
              Start Free Trial
            </button>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '1M+', label: 'Queries Answered' },
              { value: '99.9%', label: 'Accuracy Rate' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-surface-dark rounded-lg p-6 text-center hover:bg-surface-light transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="text-2xl font-semibold text-accent-lilac">{stat.value}</div>
                <div className="text-xs font-medium text-gray-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-lightest mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-xs text-gray-500">
            {' '}
            {new Date().getFullYear()} Aviation AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
