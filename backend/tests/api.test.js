const axios = require('axios');
const colors = require('colors');
require('dotenv').config();

// Configuration
const API_URL = 'http://localhost:3001';
const TEST_TOKEN = process.env.TEST_FIREBASE_TOKEN; // Add this to your .env file

// Test categories
const categories = {
    auth: true,
    questions: true,
    ai: true
};

// Utility functions
const log = {
    info: (msg) => console.log(colors.blue('ℹ ') + msg),
    success: (msg) => console.log(colors.green('✓ ') + msg),
    error: (msg) => console.log(colors.red('✗ ') + msg),
    warning: (msg) => console.log(colors.yellow('⚠ ') + msg),
    section: (msg) => console.log('\n' + colors.cyan('▶ ' + msg))
};

// API client with default config
const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    validateStatus: null // Don't throw on any status
});

// Test runner
async function runTests() {
    log.info('Starting API tests...\n');

    // Check if token is provided
    if (!TEST_TOKEN) {
        log.error('TEST_FIREBASE_TOKEN not found in .env file');
        log.info('Please add your Firebase test token to .env file:');
        log.info('TEST_FIREBASE_TOKEN=your_token_here');
        process.exit(1);
    }

    // Auth Tests
    if (categories.auth) {
        log.section('Testing Authentication Endpoints');
        
        // Test /api/auth/config
        try {
            const configRes = await api.get('/api/auth/config');
            if (configRes.status === 200 && configRes.data.projectId) {
                log.success('GET /api/auth/config - Firebase config retrieved successfully');
            } else {
                log.error('GET /api/auth/config failed');
                console.log('Response:', configRes.data);
            }
        } catch (error) {
            log.error('GET /api/auth/config error: ' + error.message);
        }

        // Test token verification
        try {
            const verifyRes = await api.get('/api/auth/verify', {
                headers: { Authorization: `Bearer ${TEST_TOKEN}` }
            });
            if (verifyRes.status === 200 && verifyRes.data.authenticated) {
                log.success('GET /api/auth/verify - Token verified successfully');
                log.info(`User ID: ${verifyRes.data.user.uid}`);
            } else {
                log.error('GET /api/auth/verify failed');
                console.log('Response:', verifyRes.data);
            }
        } catch (error) {
            log.error('GET /api/auth/verify error: ' + error.message);
        }
    }

    // Questions Tests
    if (categories.questions) {
        log.section('Testing Questions Endpoints');

        // Test getting questions by category
        try {
            const categoryRes = await api.get('/api/questions/category/general', {
                headers: { Authorization: `Bearer ${TEST_TOKEN}` }
            });
            if (categoryRes.status === 200) {
                log.success('GET /api/questions/category/general - Retrieved questions successfully');
                log.info(`Retrieved ${categoryRes.data.questions.length} questions`);
            } else {
                log.error('GET /api/questions/category/general failed');
                console.log('Response:', categoryRes.data);
            }
        } catch (error) {
            log.error('GET /api/questions/category/general error: ' + error.message);
        }

        // Test getting a specific question (assuming we have an ID)
        const testQuestionId = 'test-question-1'; // Replace with a real ID if needed
        try {
            const questionRes = await api.get(`/api/questions/${testQuestionId}`, {
                headers: { Authorization: `Bearer ${TEST_TOKEN}` }
            });
            if (questionRes.status === 200) {
                log.success(`GET /api/questions/${testQuestionId} - Retrieved question successfully`);
            } else if (questionRes.status === 404) {
                log.warning(`Question ${testQuestionId} not found (this might be expected)`);
            } else {
                log.error(`GET /api/questions/${testQuestionId} failed`);
                console.log('Response:', questionRes.data);
            }
        } catch (error) {
            log.error(`GET /api/questions/${testQuestionId} error: ` + error.message);
        }
    }

    // AI Tests
    if (categories.ai) {
        log.section('Testing AI Endpoints');

        // Test AI query endpoint
        try {
            const aiRes = await api.post('/api/assistant-query', 
                { query: 'What are the main components of a jet engine?' },
                { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
            );
            if (aiRes.status === 200 && aiRes.data.response) {
                log.success('POST /api/assistant-query - AI query successful');
                log.info('AI Response preview: ' + aiRes.data.response.substring(0, 100) + '...');
            } else {
                log.error('POST /api/assistant-query failed');
                console.log('Response:', aiRes.data);
            }
        } catch (error) {
            log.error('POST /api/assistant-query error: ' + error.message);
        }

        // Test rate limiting
        log.info('Testing rate limiting...');
        const requests = [];
        for (let i = 0; i < 6; i++) {
            requests.push(api.post('/api/assistant-query',
                { query: 'Test query' },
                { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
            ));
        }

        const results = await Promise.all(requests);
        const rateLimited = results.some(res => res.status === 429);
        if (rateLimited) {
            log.success('Rate limiting is working (received 429 after multiple requests)');
        } else {
            log.warning('Rate limiting might not be working as expected');
        }
    }

    log.info('\nTests completed!');
}

// Run the tests
runTests().catch(error => {
    log.error('Test suite error: ' + error.message);
    process.exit(1);
});
