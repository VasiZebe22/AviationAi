import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  signIn, 
  signUp, 
  logout,
  onAuthChange, 
  resendVerificationEmail,
  isLegacyUser,
  monitorSession
} from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const navigate = useNavigate();

  // Handle session invalidation
  const handleSessionInvalid = useCallback(() => {
    // Only show toast and navigate if we actually had a user
    if (currentUser) {
      toast.error('Your session has expired. Please log in again.');
      setCurrentUser(null);
      setSessionId(null);
      navigate('/login');
    }
  }, [navigate, currentUser]);

  useEffect(() => {
    let mounted = true;
    let sessionUnsubscribe = null;
    
    const unsubscribe = onAuthChange((userInfo) => {
      if (!mounted) return;
      
      // Allow legacy accounts or verified accounts
      if (userInfo?.user && (isLegacyUser(userInfo.user) || userInfo.user.emailVerified)) {
        setCurrentUser(userInfo);
      } else {
        setCurrentUser(null);
        setSessionId(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
      if (sessionUnsubscribe) {
        sessionUnsubscribe();
      }
    };
  }, []);

  // Set up session monitoring when user or sessionId changes
  useEffect(() => {
    let sessionUnsubscribe = null;

    if (currentUser?.user?.uid && sessionId) {
      sessionUnsubscribe = monitorSession(
        currentUser.user.uid,
        sessionId,
        handleSessionInvalid
      );
    }

    return () => {
      if (sessionUnsubscribe) {
        sessionUnsubscribe();
      }
    };
  }, [currentUser?.user?.uid, sessionId, handleSessionInvalid]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await signIn(email, password);
      setSessionId(result.sessionId);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password) => {
    try {
      const result = await signUp(email, password);
      return {
        ...result,
        requiresVerification: true
      };
    } catch (error) {
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
      setCurrentUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout: logoutUser,
    resendVerification: resendVerificationEmail,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
