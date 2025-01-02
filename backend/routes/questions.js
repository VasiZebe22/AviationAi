const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const logger = require('../logger');
const { db } = require('../firebase');

// Get questions by category
router.get('/category/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { limit = 10, difficulty, lastDoc } = req.query;
        
        let query = db.collection('questions')
            .where('categoryId', '==', categoryId)
            .limit(parseInt(limit));

        if (difficulty) {
            query = query.where('difficulty', '==', parseInt(difficulty));
        }

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

// Create a new question (protected route)
router.post('/', [
    body('question_text').notEmpty().trim(),
    body('correct_answer').notEmpty().trim(),
    body('incorrect_answers').isArray({ min: 3, max: 3 }),
    body('categoryId').notEmpty(),
    body('difficulty').isInt({ min: 1, max: 5 }),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const questionData = {
            question_text: req.body.question_text,
            correct_answer: req.body.correct_answer,
            incorrect_answers: req.body.incorrect_answers,
            categoryId: req.body.categoryId,
            difficulty: req.body.difficulty,
            explanation: req.body.explanation || '',
            tags: req.body.tags || [],
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
                    if (!categories[data.categoryId]) {
                        categories[data.categoryId] = { total: 0, completed: 0 };
                    }
                    categories[data.categoryId].total++;
                });
                return categories;
            });

        // Merge with user progress
        const userProgress = progressDoc.data();
        Object.keys(questionsByCategory).forEach(categoryId => {
            const categoryProgress = userProgress.questions 
                ? Object.entries(userProgress.questions)
                    .filter(([_, data]) => data.categoryId === categoryId && data.completed)
                    .length
                : 0;
            
            questionsByCategory[categoryId].completed = categoryProgress;
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
                        (isCorrect ? 1 : 0)
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
