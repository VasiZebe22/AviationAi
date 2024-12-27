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
                        <button 
                            className="text-gray-300 hover:text-white transition-colors duration-200"
                            onClick={() => handleNavigation('faq')}
                        >
                            FAQ
                        </button>
                        <button 
                            className="text-gray-300 hover:text-white transition-colors duration-200"
                            onClick={() => handleNavigation('about')}
                        >
                            About Us
                        </button>
                    </nav>

                    <button
                        onClick={handleButtonClick}
                        className="bg-accent-lilac hover:bg-accent-lilac-dark text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    >
                        {currentUser ? "Dashboard" : "Get Started"}
                    </button>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            type="button"
                            className="text-gray-300 hover:text-white p-2"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className="md:hidden bg-surface-DEFAULT border-t border-dark-lightest" id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1">
                    <button
                        className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-dark-lighter rounded-md"
                        onClick={() => handleNavigation('features')}
                    >
                        Features
                    </button>
                    <button
                        className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-dark-lighter rounded-md"
                        onClick={() => handleNavigation('pricing')}
                    >
                        Pricing
                    </button>
                    <button
                        className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-dark-lighter rounded-md"
                        onClick={() => handleNavigation('faq')}
                    >
                        FAQ
                    </button>
                    <button
                        className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-dark-lighter rounded-md"
                        onClick={() => handleNavigation('about')}
                    >
                        About Us
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
