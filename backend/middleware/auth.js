const { adminAuth } = require('../firebase');
const logger = require('../logger');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        logger.error('Authentication error:', { 
            error: error.message,
            code: error.code,
            stack: error.stack
        });
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authenticate;
