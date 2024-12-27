import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signUp, logout as firebaseLogout, onAuthChange } from '../services/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((userInfo) => {
      setCurrentUser(userInfo);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const { user, token } = await signIn(email, password);
      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email, password) => {
    try {
      const { user, token } = await signUp(email, password);
      return { user, token };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseLogout();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--background-color)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid var(--primary-color)',
          borderTop: '5px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
