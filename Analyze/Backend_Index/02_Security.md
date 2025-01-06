# Security and Middleware Configuration

## Overview
This section documents the security measures and middleware configurations implemented in the Aviation AI backend.

## Rate Limiting

### Global Rate Limiter
```javascript
const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later"
});
```
- Applies to all routes
- 100 requests per 15 minutes per IP
- Returns 429 Too Many Requests when exceeded

### AI Query Rate Limiter
```javascript
const queryRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});
```
- Specific to AI query endpoints
- 5 requests per minute per IP
- More restrictive to prevent API abuse

## CORS Configuration
```javascript
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
```
- Whitelist of allowed origins
- Restricted HTTP methods
- Supports credentials
- Limited allowed headers

## Request Validation
```javascript
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
```
- Middleware for input validation
- Uses express-validator
- Returns 400 Bad Request for invalid input

## Additional Security Measures

### Helmet
```javascript
app.use(helmet());
```
- Sets various HTTP headers
- Protects against common web vulnerabilities
- XSS protection
- Content Security Policy
- Frame protection

### Compression
```javascript
app.use(compression());
```
- Compresses response bodies
- Reduces bandwidth usage
- Improves response times

## Usage
These security measures are automatically applied based on the configuration. When adding new routes or features:

1. Apply appropriate rate limiters
2. Add input validation
3. Ensure route is compatible with CORS settings
4. Consider additional security needs
