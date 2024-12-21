const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
require('dotenv').config();

// Log all Firebase-related environment variables (without sensitive values)
console.log('Firebase Environment Check:', {
    hasApiKey: !!process.env.FIREBASE_API_KEY,
    hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasAuthDomain: !!process.env.FIREBASE_AUTH_DOMAIN,
    hasAppId: !!process.env.FIREBASE_APP_ID
});

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Debug: Log the config (without sensitive data)
console.log('Firebase Config:', {
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    hasApiKey: !!firebaseConfig.apiKey,
    apiKeyPrefix: firebaseConfig.apiKey?.substring(0, 6)
});

let auth;
try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    if (!auth) {
        throw new Error('Auth initialization failed');
    }

    console.log('Firebase initialization successful');
} catch (error) {
    console.error('Firebase initialization error:', {
        code: error.code,
        message: error.message,
        configPresent: !!firebaseConfig,
        apiKeyPresent: !!firebaseConfig.apiKey
    });
    throw error;
}

module.exports = { auth };
