# Aviation AI Backend Documentation

## Project Overview
This is the backend server for the Aviation AI application, built with Express.js and integrated with OpenAI's API for AI-powered functionality. The server provides authentication, AI query processing, and various API endpoints for the frontend application.

## Table of Contents
1. [Installation](#installation)
2. [Dependencies](#dependencies)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [API Documentation](#api-documentation)
6. [Security Features](#security-features)

## Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Set up environment variables in `.env`:
```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_ASSISTANT_ID=your_assistant_id
```
4. Start the server:
```bash
npm start
```

## Dependencies
- `express`: Web application framework
- `openai`: OpenAI API client
- `cors`: Cross-Origin Resource Sharing middleware
- `express-rate-limit`: Rate limiting middleware
- `express-validator`: Request validation
- `helmet`: Security middleware
- `compression`: Response compression
- `dotenv`: Environment variable management
- Firebase Admin SDK for authentication and database

## Project Structure
The backend is organized into several logical sections:
1. [Initialization and Configuration](./01_Initialization.md)
2. [Security and Middleware](./02_Security.md)
3. [Authentication Routes](./03_Authentication.md)
4. [AI Query Processing](./04_AIQuery.md)
5. [Error Handling](./05_ErrorHandling.md)

## Core Components
- **Authentication System**: Firebase-based user authentication
- **AI Integration**: OpenAI's Assistant API integration
- **Rate Limiting**: Tiered rate limiting for different endpoints
- **Security**: CORS configuration, Helmet middleware
- **Logging**: Structured logging system
- **Error Handling**: Centralized error handling middleware

## API Documentation
### Authentication Endpoints
- `POST /register`: User registration
- `POST /login`: User authentication
- `GET /validate-token`: Token validation
- `POST /refresh-token`: Token refresh

### AI Query Endpoints
- `POST /assistant-query`: Process AI queries using OpenAI's Assistant API

### Other Endpoints
- `GET /`: Health check
- `GET /test-firebase`: Firebase connection test
- `/api/questions/*`: Questions-related endpoints

## Security Features
1. Rate Limiting:
   - Global: 100 requests per 15 minutes
   - AI Queries: 5 requests per minute
2. CORS Protection:
   - Whitelisted origins
   - Restricted methods and headers
3. Authentication:
   - Firebase-based token authentication
   - Token refresh mechanism
4. Request Validation:
   - Input sanitization
   - Data validation middleware

## Contributing
Please follow the project's coding standards and documentation practices when contributing. All new features should include appropriate documentation and error handling.

## Contact
For questions or support, please contact the project maintainers through the appropriate channels.
