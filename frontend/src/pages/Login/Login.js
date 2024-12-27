import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Navbar from "../../components/Navbar/Navbar";
import Button from "../../components/Button/Button";
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed: ' + (error.message || 'Please try again'));
    }
  };

  return (
    <div className="login-page">
      <Navbar />
      <div className="login-container">
        <div className="login-card">
          <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <p className="login-subtitle">
            {isLogin 
              ? "Enter your credentials to access your account" 
              : "Fill in your details to create your account"}
          </p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="primary">
              {isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="login-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                className="switch-mode-btn"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
