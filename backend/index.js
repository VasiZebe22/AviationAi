require("dotenv").config();
console.log("Environment Variables Loaded:", process.env.OPENAI_API_KEY);
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const admin = require("firebase-admin");
const serviceAccount = require("C:/Users/vasiz/Desktop/AviationAi/backend/FireBase/aviationai-c5a89-firebase-adminsdk-25nr2-fac34c2162.json");
const { signInWithEmailAndPassword } = require("firebase/auth");
const { auth } = require("./firebase");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("Firebase Admin initialized");

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use(cors());
app.use(express.json());

// Authentication Middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
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
        console.error('Firebase Test Error:', error);
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
        console.error('User Registration Error:', error);
        res.status(500).send({ error: 'Failed to register user' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ error: "Email and password are required" });
    }

    try {
        // Attempt to sign in with email and password using Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get the ID token
        const idToken = await user.getIdToken();

        res.send({
            message: "Login successful",
            token: idToken,
            user: {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        // Send more specific error messages based on the error code
        switch (error.code) {
            case 'auth/wrong-password':
                return res.status(401).send({ error: "Incorrect password" });
            case 'auth/user-not-found':
                return res.status(401).send({ error: "User not found" });
            case 'auth/invalid-email':
                return res.status(400).send({ error: "Invalid email format" });
            default:
                return res.status(401).send({ error: "Invalid email or password" });
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
    console.error("Error processing query:", error);
    res.status(500).send({ message: "Error processing query", error: error.message });
  }
});

// Assistant Query Route
app.post("/assistant-query", authenticate, async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).send({ message: "No query provided" });
  }

  try {
    const thread = await openai.beta.threads.create();
    
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (runStatus.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantResponse = messages.data[0].content[0].text.value;

      res.send({
        response: assistantResponse
      });
    } else {
      throw new Error(`Run ended with status: ${runStatus.status}`);
    }
  } catch (error) {
    console.error("Error interacting with the Assistant:", error);
    res.status(500).send({ 
      message: "Failed to process query", 
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
