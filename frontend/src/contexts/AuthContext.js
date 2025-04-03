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
  monitorSession,
  // fetchSessionId // No longer needed here
  createSession // Import createSession
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
  // Modify handleSessionInvalid to accept the unsubscribe function
  const handleSessionInvalid = useCallback((unsubscribeListener) => {
    // const currentSessionIdBeforeClear = sessionId; // Removed log variable
    // console.log(`[RE-DEBUG] handleSessionInvalid: Called. User: ${currentUser?.user?.uid}, SessionId before clear: ${currentSessionIdBeforeClear}`); // Removed log
    
    // Immediately unsubscribe the listener that triggered this invalidation
    // Immediately unsubscribe the listener that triggered this invalidation
    if (unsubscribeListener) {
        unsubscribeListener();
    } else {
        // This case shouldn't happen with the current logic, but keep warn just in case
        console.warn(`handleSessionInvalid: No unsubscribe function provided.`);
    }

    // Only show toast and navigate if we actually had a user (prevents issues if called multiple times)
    if (currentUser) {
      toast.error('Your session has expired. Please log in again.');
      setCurrentUser(null);
      setSessionId(null);
      navigate('/login');
    }
  }, [navigate, currentUser, sessionId]); // Keep sessionId dependency for logging consistency

  useEffect(() => {
    let mounted = true;
    let sessionUnsubscribe = null;
    
    // onAuthChange now only handles setting the currentUser state based on Firebase auth state
    const unsubscribe = onAuthChange((userInfo) => { // Removed async
      if (!mounted) return;

      if (userInfo?.user) {
        // User object exists. Check if they are valid (legacy or verified).
        if (isLegacyUser(userInfo.user) || userInfo.user.emailVerified) {
          // Valid user, set current user
          setCurrentUser(userInfo);
          // SessionId state is handled by the login function
        }
        // If user exists but is not verified/legacy, do nothing here.
        // The signOut in firebase.js's signIn function will trigger another onAuthChange with userInfo=null shortly.
      } else {
        // User object is null (either initial state or after explicit signOut)
        setCurrentUser(null);
        setSessionId(null); // Clear session ID when user is definitively null
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
    // Define sessionUnsubscribe *outside* the if block so cleanup can access it
    // let sessionUnsubscribe = null; // REMOVED Redundant declaration

    const userId = currentUser?.user?.uid;
    
    // Define sessionUnsubscribe *outside* the if block so cleanup can access it
    let sessionUnsubscribe = null;

    if (userId && sessionId) {
      
      // Create a wrapper callback that includes the unsubscribe function
      const onInvalidCallback = () => {
          // Pass the specific unsubscribe function for *this* listener instance
          handleSessionInvalid(sessionUnsubscribe);
      };

      // Attach the listener and store its specific unsubscribe function
      sessionUnsubscribe = monitorSession(
        userId,
        sessionId,
        onInvalidCallback // Use the wrapper callback
      );
    }

    // Return the cleanup function
    return () => {
      const cleanupUserId = userId;
      const cleanupSessionId = sessionId;
      // Standard cleanup
      if (sessionUnsubscribe) {
        sessionUnsubscribe();
      } else {
      }
    };
  }, [currentUser?.user?.uid, sessionId, handleSessionInvalid]);

  // Modified login function: Calls signIn, then createSession, then sets state
  const login = async (email, password) => {
    setLoading(true);
    try {
      // 1. Authenticate with Firebase
      const userCredential = await signIn(email, password);
      // If signIn throws (e.g., wrong password, unverified email), it will be caught below

      // 2. Create session in Realtime Database
      const newSessionId = await createSession(userCredential.user.uid);

      // 3. Set session ID state (currentUser will be set by onAuthChange listener)
      setSessionId(newSessionId);

      // Return something indicating success, maybe user info if needed immediately,
      // though relying on onAuthChange is cleaner
      return { user: userCredential.user, sessionId: newSessionId };

    } catch (error) {
      console.error(`AuthContext login failed:`, error); // Keep error log
      // Only clear state for actual login failures, not for verification required error
      if (!(error.message && error.message.startsWith('Please verify your email address'))) {
        // Clear potentially inconsistent state if login fails midway for other reasons
        setCurrentUser(null);
        setSessionId(null);
      }
      throw error; // Re-throw for the UI component to handle regardless
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
