//------------------------------------------------------------------------------
// INITIALIZATION AND IMPORTS
//------------------------------------------------------------------------------
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const rateLimit = require('express-rate-limit');
const winston = require('winston');

//------------------------------------------------------------------------------
// LOGGING CONFIGURATION
//------------------------------------------------------------------------------
// Configure Winston logger for both file and console logging
// Error logs go to error.log, combined logs go to combined.log
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

logger.info("Environment Variables Loading...");
logger.info("OpenAI API Key Status:", { hasKey: !!process.env.OPENAI_API_KEY });

//------------------------------------------------------------------------------
// FIREBASE ADMIN SETUP
//------------------------------------------------------------------------------
// Import Firebase admin instance from our centralized setup
const { admin, auth: adminAuth } = require('./firebase');

logger.info("Firebase Admin initialized");

//------------------------------------------------------------------------------
// EXPRESS SERVER CONFIGURATION
//------------------------------------------------------------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
// Restrict API access to specific origins for security
const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3000',
    'https://aviation-ai.vercel.app',
    'https://aviation-ai-staging.vercel.app'
];

const corsOptions = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Initialize OpenAI API with the API key and updated configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1',
  defaultHeaders: {
    'Accept-Encoding': 'gzip',
  },
  timeout: 30000,
});

// Middleware Configuration

app.use(express.json());

//------------------------------------------------------------------------------
// API SECURITY AND RATE LIMITING
//------------------------------------------------------------------------------
// Rate limiter: 5 requests per minute per IP
const queryRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});

//------------------------------------------------------------------------------
// AUTHENTICATION MIDDLEWARE
//------------------------------------------------------------------------------
// Verify Firebase JWT tokens and attach user data to request
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

//------------------------------------------------------------------------------
// BASIC ROUTES
//------------------------------------------------------------------------------
// Health check endpoint
app.get("/", (req, res) => {
  res.send("Aviation AI Backend is running!");
});

// Firebase connection test endpoint
app.get('/test-firebase', async (req, res) => {
    try {
        const message = 'Firebase is configured correctly!';
        res.status(200).send({ message });
    } catch (error) {
        logger.error('Firebase Test Error:', { error: error.message });
        res.status(500).send({ error: 'Failed to connect to Firebase' });
    }
});

//------------------------------------------------------------------------------
// AUTHENTICATION ROUTES
//------------------------------------------------------------------------------
// User registration endpoint
// Creates new user in Firebase Authentication
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await admin.auth().createUser({
            email,
            password,
        });
        res.status(201).send({ message: 'User registered successfully', user });
    } catch (error) {
        logger.error('User Registration Error:', { error: error.message });
        res.status(500).send({ error: 'Failed to register user' });
    }
});

// Login endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    logger.info('Login attempt:', {
        emailProvided: !!email,
        passwordLength: password?.length
    });

    try {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        // Create custom token
        const userRecord = await adminAuth.getUserByEmail(email);
        const customToken = await adminAuth.createCustomToken(userRecord.uid);

        logger.info('Login successful for user:', { 
            uid: userRecord.uid,
            email: userRecord.email
        });

        res.json({ 
            token: customToken,
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                emailVerified: userRecord.emailVerified
            }
        });
    } catch (error) {
        logger.error('Login error:', { 
            error: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(401).json({ error: error.message });
    }
});

// Token validation endpoint
app.get('/validate-token', authenticate, (req, res) => {
  // If the authenticate middleware passes, the token is valid
  res.status(200).send({ valid: true });
});

// Token refresh endpoint
app.post('/refresh-token', async (req, res) => {
  const oldToken = req.headers.authorization?.split(' ')[1];
  
  if (!oldToken) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify the old token
    const decodedToken = await admin.auth().verifyIdToken(oldToken);
    
    // Create a new custom token
    const newToken = await admin.auth().createCustomToken(decodedToken.uid);
    
    res.json({ token: newToken });
  } catch (error) {
    logger.error('Token refresh error:', { error: error.message });
    res.status(401).json({ error: 'Invalid token' });
  }
});

//------------------------------------------------------------------------------
// AI QUERY ROUTES
//------------------------------------------------------------------------------

// Advanced Assistant API endpoint
// Uses OpenAI's Thread and Assistant APIs for more complex interactions
// Includes rate limiting and authentication
app.post("/assistant-query", queryRateLimiter, authenticate, async (req, res) => {
  const { query } = req.body;
  const userId = req.user.uid;

  if (!query) {
    logger.warn('Empty query received', { userId });
    return res.status(400).send({ message: "No query provided" });
  }

  try {
    logger.info('Processing assistant query', { userId, queryLength: query.length });
    const thread = await openai.beta.threads.create();
    
    logger.debug('Thread created', { threadId: thread.id });
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: query
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID
    });

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      logger.debug('Run status', { status: runStatus.status, runId: run.id });
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (runStatus.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantResponse = messages.data[0].content[0].text.value;
      logger.info('Query processed successfully', { 
        userId,
        threadId: thread.id,
        runId: run.id
      });

      res.send({ response: assistantResponse });
    } else {
      throw new Error(`Run ended with status: ${runStatus.status}`);
    }
  } catch (error) {
    logger.error('Assistant query error', {
      userId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).send({ 
      message: "Failed to process query", 
      error: error.message 
    });
  }
});

// Import auth routes
const { router: authRouter, verifyToken } = require('./routes/auth');

// Use auth routes
app.use('/auth', authRouter);

// Protect routes that require authentication
app.use('/api', verifyToken);

//------------------------------------------------------------------------------
// SERVER STARTUP
//------------------------------------------------------------------------------
// Start the Express server and log the port
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
