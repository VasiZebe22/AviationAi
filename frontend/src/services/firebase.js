import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
    updateProfile,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from 'firebase/auth';
import { 
    getFirestore, 
    query, 
    collection, 
    where, 
    orderBy, 
    getDocs
} from 'firebase/firestore';
import { getDatabase, ref, set, onValue, remove, get } from 'firebase/database';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    // Add the Database URL - REQUIRED for Realtime Database operations
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const firebaseDatabase = getDatabase(app);
const storage = getStorage(app);

// Helper function to get image URL from Firebase Storage
export const getImageFromStorage = async (imagePath) => {
    try {
        const imageRef = storageRef(storage, imagePath);
        return await getDownloadURL(imageRef);
    } catch (error) {
        console.error('Error getting image URL:', error);
        return null;
    }
};

// Create required indexes for questions collection
const createQuestionsIndexes = async () => {
    try {
        const questionsRef = collection(db, 'questions');
        await getDocs(
            query(
                questionsRef,
                where('categoryId', '==', '010'),
                orderBy('created_at', 'desc')
            )
        );
    } catch (error) {
        console.error('Error creating indexes:', error);
    }
};

// createQuestionsIndexes();

// Generate a unique session ID
const generateSessionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Create a new session
// Export createSession so AuthContext can use it
export const createSession = async (userId) => {
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
    
    // Log when the listener is attached and what sessionId it expects
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

// Fetch the current sessionId for a user from the database
export const fetchSessionId = async (userId) => {
    if (!userId) return null;
    const sessionRef = ref(firebaseDatabase, `sessions/${userId}`);
    try {
        const snapshot = await get(sessionRef);
        if (snapshot.exists()) {
            const sessionData = snapshot.val();
            return sessionData?.sessionId || null;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error fetching session data for userId ${userId}:`, error); // Keep error log, remove DEBUG tag
        return null;
    }
};

// Authentication functions
// Modified signIn: Only performs auth, returns userCredential. Session creation moved to AuthContext.
export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // console.log(`signIn: Firebase auth successful for userId ${userCredential.user.uid}`); // Log removed

        // For legacy accounts, consider them verified immediately
        const creationTime = new Date(userCredential.user.metadata.creationTime);
        const cutoffDate = new Date('2024-12-29');
        if (creationTime < cutoffDate) {
             // No need to return token/session here, onAuthChange handles it
            return userCredential;
        }

        // For new accounts, check email verification
        if (!userCredential.user.emailVerified) {
            // Verification email is sent during signup. Do not resend on login attempt.
            // try {
            //     await sendEmailVerification(userCredential.user); // REMOVED
            // } catch (verificationError) {
            //     console.error('Error sending verification email:', verificationError); // REMOVED
            // }
            // Sign out immediately if email not verified, let onAuthChange handle null user
            // We don't need to remove session here as it wasn't created yet by this function
            await signOut(auth); // Restore sign out
            throw new Error('Please verify your email address before signing in. A new verification link has been sent to your email.');
        }

        // If verified or legacy, just return the credential.
        // The onAuthChange listener will pick up the user state.
        return userCredential;
        
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
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

// Update user profile
export const updateUserProfile = async (displayName) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user is currently signed in');

        await updateProfile(user, {
            displayName: displayName
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

// Update user password
export const updateUserPassword = async (currentPassword, newPassword) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user is currently signed in');

        // Re-authenticate user before password change
        const credential = EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        
        // Update password
        await updatePassword(user, newPassword);
        return { success: true };
    } catch (error) {
        console.error('Error updating password:', error);
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
export { monitorSession, removeSession }; // Removed duplicate fetchSessionId export

export { auth, db, firebaseDatabase, storage };
