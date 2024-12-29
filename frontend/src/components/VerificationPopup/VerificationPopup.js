import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const VerificationPopup = ({ email, onClose }) => {
  const { resendVerification } = useAuth();
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    try {
      await resendVerification();
      // Toast notification is handled by the auth context
    } catch (error) {
      console.error('Error resending verification:', error);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-surface-dark rounded-lg p-6 max-w-md w-full mx-4"
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent-lilac bg-opacity-20 mb-4">
              <svg className="h-6 w-6 text-accent-lilac" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-100 mb-2">Verify your email</h3>
            <p className="text-sm text-gray-400 mb-4">
              We've sent a verification email to <span className="text-gray-300">{email}</span>.
              Please check your inbox and click the verification link to complete your registration.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <button
                onClick={handleResendVerification}
                className="w-full px-4 py-2 text-sm font-medium text-accent-lilac bg-accent-lilac bg-opacity-10 rounded-md hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-lilac"
              >
                Resend verification email
              </button>
              <button
                onClick={handleGoToLogin}
                className="w-full px-4 py-2 text-sm font-medium text-gray-400 bg-surface-DEFAULT rounded-md hover:bg-surface-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Go to login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VerificationPopup;
