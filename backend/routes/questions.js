const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const logger = require('../logger');
const { db } = require('../firebase');

// Get questions by category
router.get('/category/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { limit = 10, lastDoc } = req.query;
        
        let query = db.collection('questions')
            .where('category.code', '==', categoryId)
            .limit(parseInt(limit));

        if (lastDoc) {
            const lastDocSnapshot = await db.collection('questions').doc(lastDoc).get();
            query = query.startAfter(lastDocSnapshot);
        }

        const snapshot = await query.get();
        const questions = [];
        snapshot.forEach(doc => {
            questions.push({ id: doc.id, ...doc.data() });
        });

        res.json({
            questions,
            lastDoc: questions.length > 0 ? questions[questions.length - 1].id : null
        });
    } catch (error) {
        logger.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Get a single question
router.get('/:questionId', async (req, res) => {
    try {
        const doc = await db.collection('questions').doc(req.params.questionId).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        logger.error('Error fetching question:', error);
        res.status(500).json({ error: 'Failed to fetch question' });
    }
});

// Get questions by subcategory
router.get('/subcategory/:subcategoryCode', async (req, res) => {
    try {
        const { subcategoryCode } = req.params;
        const { limit = 10, lastDoc } = req.query;
        
        let query = db.collection('questions')
            .where('subcategories', 'array-contains', {
                code: subcategoryCode
            })
            .limit(parseInt(limit));

        if (lastDoc) {
            const lastDocSnapshot = await db.collection('questions').doc(lastDoc).get();
            query = query.startAfter(lastDocSnapshot);
        }

        const snapshot = await query.get();
        const questions = [];
        snapshot.forEach(doc => {
            questions.push({ id: doc.id, ...doc.data() });
        });

        res.json({
            questions,
            lastDoc: questions.length > 0 ? questions[questions.length - 1].id : null
        });
    } catch (error) {
        logger.error('Error fetching questions by subcategory:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Create a new question (protected route)
router.post('/', [
    body('question').notEmpty().trim(),
    body('options').isObject().notEmpty(),
    body('correct_answer').notEmpty().trim(),
    body('category').isObject().notEmpty(),
    body('category.code').notEmpty().trim(),
    body('category.name').notEmpty().trim(),
    body('subcategories').isArray({ min: 1 }),
    body('subcategories.*.code').notEmpty().trim(),
    body('subcategories.*.name').notEmpty().trim(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const questionData = {
            question: req.body.question,
            options: req.body.options,
            correct_answer: req.body.correct_answer,
            category: {
                code: req.body.category.code,
                name: req.body.category.name
            },
            subcategories: req.body.subcategories.map(sub => ({
                code: sub.code,
                name: sub.name
            })),
            explanation: req.body.explanation || '',
            learning_materials: req.body.learning_materials || [],
            created_at: new Date(),
            updated_at: new Date()
        };

        const docRef = await db.collection('questions').add(questionData);
        res.status(201).json({ id: docRef.id, ...questionData });
    } catch (error) {
        logger.error('Error creating question:', error);
        res.status(500).json({ error: 'Failed to create question' });
    }
});

// Get user's progress across all categories
router.get('/progress', async (req, res) => {
    try {
        const userId = req.user.uid;
        const progressRef = db.collection('user_progress').doc(userId);
        const progressDoc = await progressRef.get();
        
        if (!progressDoc.exists) {
            return res.json({ progress: {} });
        }

        // Calculate progress per category
        const questionsByCategory = await db.collection('questions')
            .get()
            .then(snapshot => {
                const categories = {};
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const categoryCode = data.category.code;
                    if (!categories[categoryCode]) {
                        categories[categoryCode] = { 
                            total: 0, 
                            completed: 0,
                            name: data.category.name 
                        };
                    }
                    categories[categoryCode].total++;
                });
                return categories;
            });

        // Merge with user progress
        const userProgress = progressDoc.data();
        Object.keys(questionsByCategory).forEach(categoryCode => {
            const categoryProgress = userProgress.questions 
                ? Object.entries(userProgress.questions)
                    .filter(([_, data]) => data.category?.code === categoryCode && data.completed)
                    .length
                : 0;
            
            questionsByCategory[categoryCode].completed = categoryProgress;
        });

        res.json({ progress: questionsByCategory });
    } catch (error) {
        logger.error('Error fetching user progress:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// Update user progress
router.post('/:questionId/progress', async (req, res) => {
    try {
        const { questionId } = req.params;
        const { isCorrect } = req.body;
        const userId = req.user.uid; // From auth middleware

        // Get the question to include category info in progress
        const questionDoc = await db.collection('questions').doc(questionId).get();
        if (!questionDoc.exists) {
            return res.status(404).json({ error: 'Question not found' });
        }
        const questionData = questionDoc.data();

        const progressRef = db.collection('user_progress').doc(userId);
        await db.runTransaction(async (transaction) => {
            const progressDoc = await transaction.get(progressRef);
            
            const newData = {
                last_attempt: new Date(),
                [`questions.${questionId}`]: {
                    attempts: progressDoc.exists ? 
                        ((progressDoc.data()?.questions?.[questionId]?.attempts || 0) + 1) : 1,
                    correct: progressDoc.exists ? 
                        ((progressDoc.data()?.questions?.[questionId]?.correct || 0) + (isCorrect ? 1 : 0)) : 
                        (isCorrect ? 1 : 0),
                    category: questionData.category,
                    subcategories: questionData.subcategories,
                    completed: true
                }
            };

            if (!progressDoc.exists) {
                transaction.set(progressRef, newData);
            } else {
                transaction.update(progressRef, newData);
            }
        });

        res.json({ success: true });
    } catch (error) {
        logger.error('Error updating progress:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

module.exports = router;
