require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const admin = require("firebase-admin");
const { signInWithEmailAndPassword } = require("firebase/auth");
const { auth } = require("./firebase");
const rateLimit = require('express-rate-limit');
const winston = require('winston');

// Configure winston logger
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

admin.initializeApp({
  credential: admin.credential.cert({
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL
  })
});

logger.info("Firebase Admin initialized");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow requests only from the frontend origin
const allowedOrigins = ['http://localhost:3001'];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow request
        } else {
            console.warn('Blocked request from unauthorized origin:', origin);
            callback(new Error('Not allowed by CORS')); // Reject request
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // HTTP methods to allow
    credentials: true, // Include cookies or authorization headers
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

// Create rate limiter middleware
const queryRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});

// Authentication Middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    logger.warn('Authentication attempt without token');
    return res.status(401).send({ error: 'Unauthorized' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    logger.info('User authenticated successfully', { uid: decodedToken.uid });
    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error('Authentication Error:', { error: error.message });
    res.status(403).send({ error: 'Invalid token' });
  }
};

// ROUTES //

app.get("/", (req, res) => {
  res.send("Aviation AI Backend is running!");
});

app.get('/test-firebase', async (req, res) => {
    try {
        const message = 'Firebase is configured correctly!';
        res.status(200).send({ message });
    } catch (error) {
        logger.error('Firebase Test Error:', { error: error.message });
        res.status(500).send({ error: 'Failed to connect to Firebase' });
    }
});

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

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ error: "Email and password are required" });
    }

    // Debug logging
    logger.info('Login attempt initiated', {
        emailProvided: !!email,
        passwordLength: password?.length,
        authState: {
            isInitialized: !!auth,
            hasCurrentUser: !!auth?.currentUser
        }
    });

    try {
        if (!auth) {
            throw new Error('Firebase Auth not initialized');
        }

        // Attempt sign in
        logger.info('Attempting sign in for email:', { email });
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (!userCredential?.user) {
            throw new Error('No user returned after successful login');
        }

        logger.info('Sign in successful', {
            uid: userCredential.user.uid,
            emailVerified: userCredential.user.emailVerified
        });

        const idToken = await userCredential.user.getIdToken(true); // Force token refresh

        res.status(200).send({
            success: true,
            message: "Login successful",
            token: idToken,
            user: {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                emailVerified: userCredential.user.emailVerified
            }
        });

    } catch (error) {
        logger.error('Login error details', {
            code: error.code,
            message: error.message,
            type: error.constructor.name
        });

        // More specific error handling
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
                return res.status(401).send({ 
                    error: "Invalid email or password",
                    details: error.code
                });
            case 'auth/invalid-email':
                return res.status(400).send({ error: "Invalid email format" });
            case 'auth/network-request-failed':
                return res.status(503).send({ error: "Network error - please try again" });
            default:
                return res.status(500).send({ 
                    error: "Authentication failed",
                    details: error.message
                });
        }
    }
});

// Query Route for OpenAI Assistant
app.post("/query", authenticate, async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).send({ message: "No query provided" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an aviation instructor. Answer concisely based on the available knowledge." },
        { role: "user", content: query },
      ],
    });

    res.send({
      response: completion.choices[0].message.content
    });
  } catch (error) {
    logger.error("Error processing query:", { error: error.message });
    res.status(500).send({ message: "Error processing query", error: error.message });
  }
});

// Assistant Query Route
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

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
