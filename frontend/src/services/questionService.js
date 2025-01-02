import { db, auth } from './firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, addDoc, orderBy, limit } from 'firebase/firestore';

const questionService = {
    // Get questions by category
    async getQuestionsByCategory(categoryId, filters = {}) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Start with basic query without ordering
            let q = query(
                collection(db, 'questions'),
                where('categoryId', '==', categoryId)
            );

            // Apply filters
            if (filters.realExamOnly) {
                q = query(q, where('is_real_exam', '==', true));
            }

            if (filters.reviewQuestions) {
                q = query(q, where('needs_review', '==', true));
            }

            if (filters.markedQuestions) {
                q = query(q, where('is_marked', '==', true));
            }

            if (filters.unseenQuestions) {
                q = query(q, where('is_seen', '==', false));
            }

            if (filters.incorrectlyAnswered) {
                q = query(q, where('is_correct', '==', false));
            }

            const querySnapshot = await getDocs(q);
            const questions = querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    options: [doc.data().correct_answer, ...(doc.data().incorrect_answers || [])].sort(() => Math.random() - 0.5)
                }))
                .sort((a, b) => {
                    // Client-side sorting by created_at
                    const dateA = a.created_at?.toDate?.() || new Date(a.created_at);
                    const dateB = b.created_at?.toDate?.() || new Date(b.created_at);
                    return dateB - dateA;
                });

            return questions;
        } catch (error) {
            console.error('Error fetching questions:', error);
            // Check if it's an index error
            if (error.message?.includes('index')) {
                throw new Error('Database configuration in progress. Please try again in a few minutes.');
            }
            throw error;
        }
    },

    // Get a single question
    getQuestion: async (questionId) => {
        try {
            const questionRef = doc(db, 'questions', questionId);
            const docSnap = await getDoc(questionRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                throw new Error('Question not found');
            }
        } catch (error) {
            console.error('Error fetching question:', error);
            throw error;
        }
    },

    // Get questions by topic
    getQuestionsByTopic: async (topic, options = {}) => {
        try {
            const questionsRef = collection(db, 'questions');
            const queryConstraints = [
                where('topic', '==', topic),
                orderBy('created_at', 'desc')
            ];

            if (options.difficulty) {
                queryConstraints.splice(1, 0, where('difficulty', '==', options.difficulty));
            }
            if (options.limit) {
                queryConstraints.push(limit(options.limit));
            } else {
                queryConstraints.push(limit(10));
            }

            const q = query(questionsRef, ...queryConstraints);
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                options: [doc.data().correct_answer, ...(doc.data().incorrect_answers || [])].sort(() => Math.random() - 0.5)
            }));
        } catch (error) {
            console.error('Error in getQuestionsByTopic:', error);
            throw error;
        }
    },

    // Get questions by difficulty
    getQuestionsByDifficulty: async (difficulty, options = {}) => {
        try {
            const questionsRef = collection(db, 'questions');
            const queryConstraints = [
                where('difficulty', '==', difficulty),
                orderBy('created_at', 'desc')
            ];

            if (options.limit) {
                queryConstraints.push(limit(options.limit));
            } else {
                queryConstraints.push(limit(10));
            }

            const q = query(questionsRef, ...queryConstraints);
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                options: [doc.data().correct_answer, ...(doc.data().incorrect_answers || [])].sort(() => Math.random() - 0.5)
            }));
        } catch (error) {
            console.error('Error in getQuestionsByDifficulty:', error);
            throw error;
        }
    },

    // Update progress
    async updateProgress(questionId, isCorrect) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const questionRef = doc(db, 'questions', questionId);
            const questionDoc = await getDoc(questionRef);

            if (!questionDoc.exists()) {
                throw new Error('Question not found');
            }

            await updateDoc(questionRef, {
                is_correct: isCorrect,
                is_seen: true,
                last_attempted: new Date(),
                attempts: (questionDoc.data().attempts || 0) + 1
            });

            // Create or update progress document
            const progressRef = doc(db, 'progress', `${user.uid}_${questionId}`);
            try {
                await updateDoc(progressRef, {
                    isCorrect,
                    timestamp: new Date()
                });
            } catch (error) {
                // If document doesn't exist, create it
                if (error.code === 'not-found') {
                    await addDoc(collection(db, 'progress'), {
                        userId: user.uid,
                        questionId,
                        isCorrect,
                        timestamp: new Date()
                    });
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Error updating progress:', error);
            throw error;
        }
    },

    // Update flag
    async updateFlag(questionId, flag) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const questionRef = doc(db, 'questions', questionId);
            await updateDoc(questionRef, { flag });
        } catch (error) {
            console.error('Error updating flag:', error);
            throw error;
        }
    },

    // Save note
    async saveNote(questionId, note) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const noteRef = doc(db, 'notes', `${user.uid}_${questionId}`);
            await updateDoc(noteRef, {
                content: note,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error saving note:', error);
            throw error;
        }
    },

    // Get user statistics
    getUserStats: async (userId) => {
        if (!userId) {
            console.log('No userId provided to getUserStats');
            return {
                questionsAttempted: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                averageScore: 0,
                categoryProgress: {}
            };
        }

        try {
            const statsRef = collection(db, 'user_stats');
            const q = query(statsRef, where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                return {
                    questionsAttempted: 0,
                    correctAnswers: 0,
                    incorrectAnswers: 0,
                    averageScore: 0,
                    categoryProgress: {}
                };
            }

            return querySnapshot.docs[0].data();
        } catch (error) {
            console.error('Error fetching user stats:', error);
            // Return default stats on error
            return {
                questionsAttempted: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                averageScore: 0,
                categoryProgress: {}
            };
        }
    }
};

export default questionService;
