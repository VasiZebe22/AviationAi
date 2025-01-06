# AI Query Processing Documentation

## Overview
This section documents the AI query processing system that integrates with OpenAI's Assistant API to handle complex interactions.

## Main Endpoint

### Assistant Query
```javascript
POST /assistant-query
```

## Implementation Details

### Middleware Stack
```javascript
app.post("/assistant-query", 
    queryRateLimiter,
    authenticate,
    validate([
        body('query').exists().notEmpty()
    ])
```
1. Rate limiting (5 requests/minute)
2. Authentication required
3. Query validation

### Processing Flow
1. **Input Validation**
```javascript
const { query } = req.body;
if (!query) {
    return res.status(400).send({ message: "No query provided" });
}
```

2. **Thread Creation**
```javascript
const thread = await openai.beta.threads.create();
```
- Creates new conversation thread
- Logs thread creation

3. **Message Creation**
```javascript
await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: query
});
```
- Adds user message to thread

4. **Run Creation**
```javascript
const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: process.env.OPENAI_ASSISTANT_ID
});
```
- Initiates processing with specified assistant

5. **Status Polling**
```javascript
let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
}
```
- Polls every second
- Checks for completion

6. **Response Processing**
```javascript
if (runStatus.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantResponse = messages.data[0].content[0].text.value;
    res.send({ response: assistantResponse });
}
```
- Retrieves assistant's response
- Returns formatted response

## Error Handling
- Input validation errors: 400 Bad Request
- Processing errors: 500 Internal Server Error
- Rate limiting: 429 Too Many Requests
- Authentication: 401 Unauthorized

## Logging
- Query receipt
- Thread creation
- Processing status
- Completion
- Errors with stack traces

## Usage Considerations
1. Rate limits: 5 requests per minute
2. Authentication required
3. Non-empty query required
4. Async processing with timeout
5. Error handling for failed requests

## Response Format
Success:
```json
{
    "response": "Assistant's response text"
}
```

Error:
```json
{
    "message": "Error description",
    "error": "Detailed error message"
}
```
