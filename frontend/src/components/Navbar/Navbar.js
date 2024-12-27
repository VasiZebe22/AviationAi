import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Navbar.css";

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
        <header className="navbar">
            <div className="navbar-content">
                <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    Aviation AI
                </div>
                <div className="bubble-menu">
                    <button className="nav-link" onClick={() => handleNavigation('features')}>Features</button>
                    <button className="nav-link" onClick={() => handleNavigation('pricing')}>Pricing</button>
                    <button className="nav-link" onClick={() => handleNavigation('faq')}>FAQ</button>
                    <button className="nav-link" onClick={() => handleNavigation('about')}>About Us</button>
                </div>
                <button className="get-started" onClick={handleButtonClick}>
                    {currentUser ? "Dashboard" : "Get Started"}
                </button>
            </div>
        </header>
    );
};

export default Navbar;
