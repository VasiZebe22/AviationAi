# Initialization and Configuration

## Overview
This section covers the initialization and basic configuration of the Aviation AI backend server, including imports, middleware setup, and server startup.

## Key Components

### Environment Configuration
```javascript
require("dotenv").config();
```
Loads environment variables from `.env` file into `process.env`.

### Core Dependencies
```javascript
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const helmet = require('helmet');
const compression = require('compression');
const OpenAI = require("openai");
```

### Firebase Initialization
```javascript
const { initializeFirebase } = require("./firebase");
initializeFirebase();
const { adminAuth, db } = require("./firebase");
```
- Initializes Firebase Admin SDK
- Provides authentication and database services

### OpenAI Configuration
```javascript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1',
  defaultHeaders: {
    'Accept-Encoding': 'gzip',
  },
  timeout: 30000,
});
```
- Configures OpenAI client with API key
- Sets base URL and default headers
- Configures timeout of 30 seconds

### Express Application Setup
```javascript
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());
```
- Creates Express application instance
- Applies middleware for:
  - CORS handling
  - JSON body parsing
  - URL-encoded body parsing
  - Security headers (Helmet)
  - Response compression

### Server Startup
```javascript
const PORT = 3000;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
```
- Starts server on port 3000
- Logs successful startup

## Usage
The initialization code runs when the server starts and sets up all necessary configurations and middleware. No direct interaction is required, but proper environment variables must be set in the `.env` file.
