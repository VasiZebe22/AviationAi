const admin = require('firebase-admin');
require('dotenv').config();
const logger = require('./logger');

let auth;
let firestore;

const initializeFirebase = () => {
    // Initialize Firebase Admin SDK with environment variables
    const serviceAccount = {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY ? JSON.parse(JSON.stringify(process.env.FIREBASE_PRIVATE_KEY)) : undefined,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };

    try {
        // Validate required fields
        const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
        const missingFields = requiredFields.filter(field => !serviceAccount[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required Firebase configuration fields: ${missingFields.join(', ')}`);
        }

        // Initialize Admin SDK
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });

        auth = admin.auth(app);
        firestore = admin.firestore(app);
        logger.info('Firebase Admin SDK initialized successfully');
    } catch (error) {
        logger.error('Firebase Admin SDK initialization error:', error);
        throw error;
    }
};

module.exports = {
    initializeFirebase,
    get adminAuth() {
        if (!auth) throw new Error('Firebase Auth not initialized');
        return auth;
    },
    get db() {
        if (!firestore) throw new Error('Firebase Firestore not initialized');
        return firestore;
    }
};
