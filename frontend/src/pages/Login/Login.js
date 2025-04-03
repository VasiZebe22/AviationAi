import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify'; // Import react-toastify directly

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  // Remove useToast hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      // console.log('Login.js caught error:', error); // Remove debug log
      let message = 'Failed to log in. Please try again.'; // Default message
      let type = 'error'; // Default type

      // Check for the specific verification error message first
      if (error.message && error.message.startsWith('Please verify your email address')) {
        message = 'Please verify your email address. Check your inbox for the verification link.';
        type = 'warning'; // Use 'warning' type for verification notice
      } else {
        // Handle other specific Firebase auth errors
        if (error.code === 'auth/invalid-email') {
          message = 'Invalid email format.';
        } else if (error.code === 'auth/wrong-password') {
          message = 'Incorrect password.';
        } else if (error.code === 'auth/user-not-found') {
          message = 'No account found with this email.';
        } else if (error.code === 'auth/too-many-requests') {
          message = 'Access temporarily disabled due to too many failed login attempts. Please try again later.';
        }
        // Type remains 'error' for these cases
      }
      // Call react-toastify directly
      if (type === 'warning') {
        toast.warning(message);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Link to="/">
          <img
            className="mx-auto h-12 w-auto"
            src={process.env.PUBLIC_URL + '/images/logo.png'}
            alt="Aviation AI"
          />
        </Link>
        <h2 className="mt-6 text-center text-2xl font-medium text-gray-100">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-accent-lilac hover:text-accent-lilac-dark transition-colors duration-200"
          >
            Sign up
          </Link>
        </p>
      </motion.div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-surface-dark py-8 px-4 shadow-xl rounded-lg sm:px-10"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-300"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-dark-lightest rounded-md shadow-sm bg-dark-lighter text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lilac focus:border-transparent text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-300"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-dark-lightest rounded-md shadow-sm bg-dark-lighter text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-lilac focus:border-transparent text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-dark-lightest bg-dark-lighter text-accent-lilac focus:ring-accent-lilac"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-xs text-gray-400"
                >
                  Remember me
                </label>
              </div>

              <div className="text-xs">
                <Link
                  to="/forgot-password"
                  className="font-medium text-accent-lilac hover:text-accent-lilac-dark transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-lilac hover:bg-accent-lilac-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-lilac transition-colors duration-200 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-lightest" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-dark text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2.5 px-4 rounded-md shadow-sm bg-dark-lighter text-sm font-medium text-gray-300 hover:bg-dark-lightest transition-colors duration-200"
              >
                <span className="sr-only">Sign in with Google</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.607,1.972-2.101,3.467-4.26,3.467c-2.624,0-4.747-2.124-4.747-4.747s2.124-4.747,4.747-4.747c1.107,0,2.125,0.379,2.927,1.013l1.944-1.944C16.844,5.778,14.811,5,12.545,5C8.586,5,5.364,8.222,5.364,12.181c0,3.959,3.222,7.181,7.181,7.181c4.119,0,7.181-3.062,7.181-7.181H12.545z" />
                </svg>
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2.5 px-4 rounded-md shadow-sm bg-dark-lighter text-sm font-medium text-gray-300 hover:bg-dark-lightest transition-colors duration-200"
              >
                <span className="sr-only">Sign in with GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
