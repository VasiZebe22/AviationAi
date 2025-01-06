# Authentication System Documentation

## Overview
The authentication system uses Firebase Authentication for user management and token-based authentication.

## Endpoints

### User Registration
```javascript
POST /register
```
#### Implementation
```javascript
app.post('/register', 
    validate([
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 })
    ]),
    async (req, res) => {
    // Creates new user in Firebase
    // Returns user object on success
});
```
- Validates email format
- Ensures password length ≥ 6 characters
- Creates Firebase user account
- Returns 201 on success

### User Login
```javascript
POST /login
```
#### Implementation
```javascript
app.post("/login",
    validate([
        body('email').isEmail().normalizeEmail(),
        body('password').exists()
    ]),
    async (req, res) => {
    // Authenticates user
    // Returns custom token and user info
});
```
- Validates credentials
- Creates custom Firebase token
- Returns token and user details
- Logs authentication attempts

### Token Validation
```javascript
GET /validate-token
```
#### Implementation
```javascript
app.get('/validate-token', authenticate, (req, res) => {
  res.status(200).send({ valid: true });
});
```
- Validates existing token
- Uses authenticate middleware
- Returns token validity status

### Token Refresh
```javascript
POST /refresh-token
```
#### Implementation
```javascript
app.post('/refresh-token', async (req, res) => {
  // Verifies old token
  // Issues new token
});
```
- Verifies existing token
- Creates new custom token
- Returns refreshed token

## Authentication Middleware
```javascript
const authenticate = require("./middleware/auth");
```
- Verifies Firebase tokens
- Attaches user to request object
- Required for protected routes

## Error Handling
- Invalid credentials: 401 Unauthorized
- Invalid token: 401 Unauthorized
- Registration errors: 500 Internal Server Error
- Validation errors: 400 Bad Request

## Security Considerations
1. Passwords never stored in plaintext
2. Tokens expire automatically
3. Rate limiting on auth endpoints
4. Email validation and normalization
5. Password length requirements

## Usage Example
```javascript
// Protected route example
app.get('/protected-route', 
    authenticate, 
    (req, res) => {
        // Access user info via req.user
        const userId = req.user.uid;
});
```
