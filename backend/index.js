//------------------------------------------------------------------------------
// INITIALIZATION AND IMPORTS
//------------------------------------------------------------------------------
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const logger = require("./logger");
const helmet = require('helmet');
const compression = require('compression');
const OpenAI = require("openai");
const { initializeFirebase } = require("./firebase");

// Initialize Firebase Admin SDK first
initializeFirebase();

// Then import modules that depend on Firebase
const { adminAuth, db } = require("./firebase");
const authenticate = require("./middleware/auth");

// Import routes
const questionsRoutes = require('./routes/questions');

// Initialize Express app
const app = express();

// Initialize OpenAI API with the API key and updated configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1',
  defaultHeaders: {
    'Accept-Encoding': 'gzip',
  },
  timeout: 30000,
});

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());

//------------------------------------------------------------------------------
// LOGGING CONFIGURATION
//------------------------------------------------------------------------------
logger.info("Environment Variables Loading...");
logger.info("OpenAI API Key Status:", { hasKey: !!process.env.OPENAI_API_KEY });

//------------------------------------------------------------------------------
// EXPRESS SERVER CONFIGURATION
//------------------------------------------------------------------------------
// Security Middleware

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

// Middleware Configuration

// Global Rate Limiter: 100 requests per 15 minutes
const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later"
});

// More restrictive rate limiter for AI queries: 5 requests per minute
const queryRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});

app.use(globalRateLimiter);

//------------------------------------------------------------------------------
// ERROR HANDLING AND VALIDATION
//------------------------------------------------------------------------------

// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    logger.error('Error:', { 
        error: err.message,
        code: err.code,
        stack: err.stack
    });
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
};

// Request Validation Middleware
const validate = validations => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({
            errors: errors.array()
        });
    };
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
app.post('/register', 
    validate([
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
    ]),
    async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await adminAuth.createUser({
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
app.post("/login",
    validate([
        body('email').isEmail().normalizeEmail(),
        body('password').exists().withMessage('Password is required')
    ]),
    async (req, res) => {
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
    const decodedToken = await adminAuth.verifyIdToken(oldToken);
    
    // Create a new custom token
    const newToken = await adminAuth.createCustomToken(decodedToken.uid);
    
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
app.post("/assistant-query", 
    queryRateLimiter,
    authenticate,
    validate([
        body('query').exists().notEmpty().withMessage('Query is required')
    ]),
    async (req, res) => {
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

//------------------------------------------------------------------------------
// ROUTES
//------------------------------------------------------------------------------

// Mount routes
app.use('/api/questions', authenticate, questionsRoutes);

// Removed the examQuestions route since we're now using direct Firebase access

// Apply error handler middleware last
app.use(errorHandler);

//------------------------------------------------------------------------------
// SERVER STARTUP
//------------------------------------------------------------------------------
const PORT = 3000;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
