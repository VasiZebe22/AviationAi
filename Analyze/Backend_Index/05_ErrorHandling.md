# Error Handling Documentation

## Overview
This document details the error handling system implemented in the Aviation AI backend, including middleware, logging, and error responses.

## Error Handler Middleware

### Implementation
```javascript
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
```

### Features
1. Centralized error handling
2. Structured error logging
3. Stack trace preservation
4. Consistent error response format

## Logging System

### Error Logging
```javascript
logger.error('Error:', { 
    error: err.message,
    code: err.code,
    stack: err.stack
});
```
- Logs error message
- Includes error code
- Preserves stack trace
- Structured JSON format

### Info Logging
```javascript
logger.info('Processing assistant query', { 
    userId,
    queryLength: query.length 
});
```
- Logs operational information
- Includes relevant context
- Structured format

### Debug Logging
```javascript
logger.debug('Thread created', { 
    threadId: thread.id 
});
```
- Detailed debugging information
- Includes technical details
- Used for development

## Error Response Format

### Standard Error Response
```json
{
    "error": "Error message description"
}
```

### Validation Error Response
```json
{
    "errors": [
        {
            "param": "field_name",
            "msg": "Validation error message",
            "location": "body"
        }
    ]
}
```

## Common Error Types

### Authentication Errors
- 401 Unauthorized
- Invalid tokens
- Missing credentials
- Expired sessions

### Validation Errors
- 400 Bad Request
- Invalid input format
- Missing required fields
- Data type mismatches

### Rate Limiting Errors
- 429 Too Many Requests
- Exceeded request limits
- Cooldown period required

### Server Errors
- 500 Internal Server Error
- Database connection issues
- External API failures
- Unhandled exceptions

## Best Practices
1. Always use the error handler middleware
2. Include appropriate HTTP status codes
3. Log errors with context
4. Sanitize error messages
5. Handle async/await errors
6. Validate input data

## Usage Example
```javascript
try {
    // Operation that might fail
} catch (error) {
    logger.error('Operation failed:', {
        error: error.message,
        context: 'relevant_context'
    });
    next(error); // Pass to error handler
}
```
