const express = require('express');
const router = express.Router();
const { adminAuth } = require('../firebase');

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

// Get Firebase configuration (only non-sensitive data)
router.get('/config', (req, res) => {
    const publicConfig = {
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    };
    res.json(publicConfig);
});

// Verify user's authentication status
router.get('/verify', verifyToken, (req, res) => {
    res.json({ 
        authenticated: true, 
        user: {
            uid: req.user.uid,
            email: req.user.email,
            emailVerified: req.user.email_verified
        }
    });
});

// Create custom token for special auth flows
router.post('/token', async (req, res) => {
    try {
        const { uid } = req.body;
        if (!uid) {
            return res.status(400).json({ error: 'UID is required' });
        }
        
        const customToken = await adminAuth.createCustomToken(uid);
        res.json({ token: customToken });
    } catch (error) {
        console.error('Custom token creation error:', error);
        res.status(500).json({ error: 'Failed to create custom token' });
    }
});

module.exports = router;
