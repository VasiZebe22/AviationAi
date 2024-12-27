import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Authentication functions
export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        return { user: userCredential.user, token: idToken };
    } catch (error) {
        console.error('Sign in error:', error);
        throw error;
    }
};

export const signUp = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        return { user: userCredential.user, token: idToken };
    } catch (error) {
        console.error('Sign up error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Sign out error:', error);
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

export { auth, db };
