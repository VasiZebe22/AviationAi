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
import "./Homepage.css";
import Navbar from "../../components/Navbar/Navbar";
import Button from "../../components/Button/Button";

const Homepage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        // Check if we have a section to scroll to
        if (location.state?.scrollTo) {
            const element = document.getElementById(location.state.scrollTo);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

    const handleNavigateToSignup = () => {
        navigate('/signup');
    };

    return (
        <div className="homepage">
            <Navbar />

            {/* Hero Section
             * Main landing section with:
             * - Main headline
             * - Short description
             * - Call-to-action buttons
             */}
            <div className="hero">
                <div className="section-container">
                    <h1>Revolutionize Aviation Learning with AI</h1>
                    <p>Your personal AI-powered pilot instructor.</p>
                    <div className="hero-buttons">
                        <Button className="custom-button--primary" onClick={handleNavigateToSignup}>Sign Up</Button>
                        <Button className="custom-button--secondary">Learn More</Button>
                    </div>
                </div>
            </div>

            {/* Features Section
             * Grid layout showcasing main platform features
             * Each feature has:
             * - Icon (to be added)
             * - Title
             * - Short description
             */}
            <section className="features" id="features">
                <div className="section-container">
                    <h2>Our Features</h2>
                    <div className="features-grid">
                        <div className="feature-item">
                            <h3>AI-Powered Queries</h3>
                            <p>Get instant answers to aviation-related questions.</p>
                        </div>
                        <div className="feature-item">
                            <h3>Expert Training Materials</h3>
                            <p>Based on trusted aviation content for precision and reliability.</p>
                        </div>
                        <div className="feature-item">
                            <h3>24/7 Accessibility</h3>
                            <p>Learn anytime, anywhere.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section
             * Display subscription tiers
             * Each pricing card contains:
             * - Plan name
             * - Monthly cost
             * - Feature list
             * - Action button
             */}
            <section className="pricing" id="pricing">
                <div className="section-container">
                    <h2>Simple Pricing</h2>
                    <div className="pricing-options">
                        <div className="pricing-card">
                            <h3>Free</h3>
                            <p className="price">$0</p>
                            <ul>
                                <li>5 Credits</li>
                                <li>Basic AI Analysis</li>
                                <li>No Real-Time Support</li>
                            </ul>
                            <Button className="custom-button--primary" onClick={handleNavigateToSignup}>Get Started</Button>
                        </div>
                        <div className="pricing-card">
                            <h3>Premium</h3>
                            <p className="price">$7.99/month</p>
                            <ul>
                                <li>Unlimited Credits</li>
                                <li>Advanced AI Tools</li>
                                <li>24/7 Support</li>
                            </ul>
                            <Button className="custom-button--secondary">Upgrade</Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section
             * Common questions and answers
             * Expandable items (functionality to be added)
             */}
            <section className="faq" id="faq">
                <div className="section-container">
                    <h2>Frequently Asked Questions</h2>
                    <div className="faq-item">
                        <h3>How does Aviation AI work?</h3>
                        <p>Answer: It uses AI to answer aviation-related questions.</p>
                    </div>
                    <div className="faq-item">
                        <h3>Is my data secure?</h3>
                        <p>Answer: Yes, we follow industry standards for data security.</p>
                    </div>
                </div>
            </section>

            {/* About Section
             * Company information and mission statement
             */}
            <section className="about" id="about">
                <div className="section-container">
                    <h2>About Us</h2>
                    <p>Aviation AI is a cutting-edge platform designed to assist aviation enthusiasts and professionals with AI-powered learning tools.</p>
                </div>
            </section>

            {/* Footer
             * Copyright information
             * Important links
             */}
            <footer className="footer">
                <div className="section-container">
                    <p>&copy; 2024 Aviation AI. All rights reserved.</p>
                    <p>
                        <a href="/privacy">Privacy Policy</a> | <a href="/contact">Contact Us</a>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Homepage;
