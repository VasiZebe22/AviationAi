import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();

    const handleButtonClick = () => {
        if (currentUser) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    const handleNavigation = (sectionId) => {
        if (location.pathname !== '/') {
            navigate('/', { state: { scrollTo: sectionId } });
        } else {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-surface-DEFAULT border-b border-dark-lightest">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div 
                        className="text-2xl font-bold text-accent-lilac hover:text-accent-lilac-light cursor-pointer transition-colors duration-200"
                        onClick={() => navigate('/')}
                    >
                        Aviation AI
                    </div>
                    
                    <nav className="hidden md:flex space-x-8">
                        {!currentUser ? (
                            <>
                                <button 
                                    className="text-gray-300 hover:text-white transition-colors duration-200"
                                    onClick={() => handleNavigation('features')}
                                >
                                    Features
                                </button>
                                <button 
                                    className="text-gray-300 hover:text-white transition-colors duration-200"
                                    onClick={() => handleNavigation('pricing')}
                                >
                                    Pricing
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    className="text-gray-300 hover:text-white transition-colors duration-200"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Dashboard
                                </button>
                                <button 
                                    className="text-gray-300 hover:text-white transition-colors duration-200"
                                    onClick={() => navigate('/chat')}
                                >
                                    AI Chat
                                </button>
                                <button 
                                    className="text-gray-300 hover:text-white transition-colors duration-200"
                                    onClick={() => navigate('/profile')}
                                >
                                    Profile
                                </button>
                            </>
                        )}
                    </nav>

                    <div className="flex items-center">
                        <button
                            onClick={handleButtonClick}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent-lilac hover:bg-accent-lilac-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-lilac transition-colors duration-200"
                        >
                            {currentUser ? 'Go to Dashboard' : 'Get Started'}
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Icon when menu is closed */}
                            <svg
                                className="block h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
