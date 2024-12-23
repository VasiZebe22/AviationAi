import React from "react";
import "./Navbar.css";

const Navbar = () => {
    return (
        <header className="navbar">
            <div className="navbar-content">
                <div className="logo">Aviation AI</div>
                <div className="bubble-menu">
                    <a href="#features">Features</a>
                    <a href="#pricing">Pricing</a>
                    <a href="#faq">FAQ</a>
                    <a href="#about">About Us</a>
                </div>
                <button className="btn get-started">Get Started</button>
            </div>
        </header>
    );
};

export default Navbar;
