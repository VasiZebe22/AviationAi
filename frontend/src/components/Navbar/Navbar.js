import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigateToLogin = () => {
        navigate('/login');
    };

    const handleNavigateToHome = () => {
        navigate('/');
    };

    const handleNavigation = (sectionId) => {
        if (location.pathname !== '/') {
            // If not on homepage, first navigate to homepage
            navigate('/', { state: { scrollTo: sectionId } });
        } else {
            // If already on homepage, scroll to section
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <header className="navbar">
            <div className="navbar-content">
                <div className="logo" onClick={handleNavigateToHome} style={{ cursor: 'pointer' }}>
                    Aviation AI
                </div>
                <div className="bubble-menu">
                    <button className="nav-link" onClick={() => handleNavigation('features')}>Features</button>
                    <button className="nav-link" onClick={() => handleNavigation('pricing')}>Pricing</button>
                    <button className="nav-link" onClick={() => handleNavigation('faq')}>FAQ</button>
                    <button className="nav-link" onClick={() => handleNavigation('about')}>About Us</button>
                </div>
                <button className="btn get-started" onClick={handleNavigateToLogin}>Get Started</button>
            </div>
        </header>
    );
};

export default Navbar;
