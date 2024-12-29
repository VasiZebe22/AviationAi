import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendEmailVerification
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase, ref, set, onValue, remove } from 'firebase/database';

// Firebase configuration with all required fields
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    console.error('Error initializing Firebase:', error);
    console.log('Firebase config:', {
        ...firebaseConfig,
        apiKey: firebaseConfig.apiKey ? '***' : undefined
    });
}

const auth = getAuth(app);
const db = getFirestore(app);
const firebaseDatabase = getDatabase(app);

// Generate a unique session ID
const generateSessionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Create a new session
const createSession = async (userId) => {
    const sessionId = generateSessionId();
    const sessionRef = ref(firebaseDatabase, `sessions/${userId}`);
    
    // Store session data
    await set(sessionRef, {
        sessionId,
        lastActive: Date.now(),
        userAgent: navigator.userAgent
    });
    
    return sessionId;
};

// Monitor and maintain session
const monitorSession = (userId, currentSessionId, onSessionInvalid) => {
    const sessionRef = ref(firebaseDatabase, `sessions/${userId}`);
    
    return onValue(sessionRef, (snapshot) => {
        const sessionData = snapshot.val();
        
        // If session data doesn't exist or session ID doesn't match
        if (!sessionData || sessionData.sessionId !== currentSessionId) {
            // Call the callback to handle session invalidation
            onSessionInvalid();
        }
    });
};

// Remove session on logout
const removeSession = async (userId) => {
    const sessionRef = ref(firebaseDatabase, `sessions/${userId}`);
    await remove(sessionRef);
};

// Authentication functions
export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Wait for auth state to be fully updated
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a new session
        const sessionId = await createSession(userCredential.user.uid);
        
        // For legacy accounts, consider them verified
        const creationTime = new Date(userCredential.user.metadata.creationTime);
        const cutoffDate = new Date('2024-12-29');
        
        if (creationTime < cutoffDate) {
            const idToken = await userCredential.user.getIdToken();
            return { 
                user: userCredential.user, 
                token: idToken,
                sessionId 
            };
        }
        
        // For new accounts, check email verification
        if (!userCredential.user.emailVerified) {
            try {
                await sendEmailVerification(userCredential.user);
            } catch (verificationError) {
                console.error('Error sending verification email:', verificationError);
            }
            
            // Remove session and sign out if email is not verified
            await removeSession(userCredential.user.uid);
            await signOut(auth);
            throw new Error('Please verify your email address before signing in. A new verification link has been sent to your email.');
        }
        
        const idToken = await userCredential.user.getIdToken();
        return { 
            user: userCredential.user, 
            token: idToken,
            sessionId 
        };
    } catch (error) {
        // Handle specific Firebase auth errors
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            throw new Error('Invalid email or password');
        } else if (error.code === 'auth/too-many-requests') {
            throw new Error('Too many failed login attempts. Please try again later.');
        } else if (error.code === 'auth/network-request-failed') {
            throw new Error('Network error. Please check your connection and try again.');
        }
        
        // If it's our custom verification error, throw it as is
        if (error.message.includes('Please verify your email')) {
            throw error;
        }
        
        console.error('Sign in error:', error);
        throw new Error('An error occurred while signing in. Please try again.');
    }
};

export const isLegacyUser = (user) => {
    if (!user) return false;
    const creationTime = new Date(user.metadata.creationTime);
    const cutoffDate = new Date('2024-12-29');
    return creationTime < cutoffDate;
};

export const signUp = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Send verification email
        await sendEmailVerification(userCredential.user);
        
        // Sign out immediately to prevent auto-login
        await signOut(auth);
        
        return { 
            verificationEmailSent: true,
            message: 'Please check your email to verify your account before signing in.'
        };
    } catch (error) {
        console.error('Sign up error:', error);
        throw error;
    }
};

export const resendVerificationEmail = async (user) => {
    try {
        await sendEmailVerification(user);
        return { success: true, message: 'Verification email has been resent. Please check your inbox.' };
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        const user = auth.currentUser;
        if (user) {
            // Remove session before signing out
            await removeSession(user.uid);
        }
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

// Auth state observer
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const token = await user.getIdToken();
                callback({ user, token });
            } catch (error) {
                console.error('Error getting token:', error);
                callback(null);
            }
        } else {
            callback(null);
        }
    });
};

// Export session management functions
export { monitorSession, removeSession };

export { auth, db };
