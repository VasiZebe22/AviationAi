import { db, auth } from './firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, addDoc, orderBy, limit } from 'firebase/firestore';

const questionService = {
    // Get questions by category
    async getQuestionsByCategory(categoryCode, filters = {}) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Start with basic query
            let q = query(
                collection(db, 'questions'),
                where('category.code', '==', categoryCode)
            );

            // Apply filters
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
                    ...doc.data()
                }))
                .sort((a, b) => {
                    const dateA = a.created_at?.toDate?.() || new Date(a.created_at);
                    const dateB = b.created_at?.toDate?.() || new Date(b.created_at);
                    return dateB - dateA;
                });

            return questions;
        } catch (error) {
            console.error('Error fetching questions:', error);
            if (error.message?.includes('index')) {
                throw new Error('Database configuration in progress. Please try again in a few minutes.');
            }
            throw error;
        }
    },

    // Get questions by subcategory
    async getQuestionsBySubcategory(subcategoryCode) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const q = query(
                collection(db, 'questions'),
                where('subcategories', 'array-contains', { code: subcategoryCode })
            );

            const querySnapshot = await getDocs(q);
            const questions = querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .sort((a, b) => {
                    const dateA = a.created_at?.toDate?.() || new Date(a.created_at);
                    const dateB = b.created_at?.toDate?.() || new Date(b.created_at);
                    return dateB - dateA;
                });

            return questions;
        } catch (error) {
            console.error('Error fetching questions by subcategory:', error);
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
                if (error.code === 'not-found') {
                    await addDoc(collection(db, 'progress'), {
                        userId: user.uid,
                        questionId,
                        isCorrect,
                        timestamp: new Date(),
                        category: questionDoc.data().category,
                        subcategories: questionDoc.data().subcategories
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
                updated_at: new Date()
            });
        } catch (error) {
            if (error.code === 'not-found') {
                const notesCollection = collection(db, 'notes');
                await addDoc(notesCollection, {
                    userId: user.uid,
                    questionId,
                    content: note,
                    created_at: new Date(),
                    updated_at: new Date()
                });
            } else {
                console.error('Error saving note:', error);
                throw error;
            }
        }
    },

    // Get user statistics
    async getUserStats() {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const progressSnapshot = await getDocs(
                query(
                    collection(db, 'progress'),
                    where('userId', '==', user.uid)
                )
            );

            const stats = {
                totalQuestions: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                byCategory: {},
                bySubcategory: {}
            };

            progressSnapshot.forEach(doc => {
                const data = doc.data();
                stats.totalQuestions++;
                if (data.isCorrect) {
                    stats.correctAnswers++;
                } else {
                    stats.incorrectAnswers++;
                }

                // Category stats
                const categoryCode = data.category.code;
                if (!stats.byCategory[categoryCode]) {
                    stats.byCategory[categoryCode] = {
                        name: data.category.name,
                        total: 0,
                        correct: 0
                    };
                }
                stats.byCategory[categoryCode].total++;
                if (data.isCorrect) {
                    stats.byCategory[categoryCode].correct++;
                }

                // Subcategory stats
                data.subcategories.forEach(sub => {
                    if (!stats.bySubcategory[sub.code]) {
                        stats.bySubcategory[sub.code] = {
                            name: sub.name,
                            total: 0,
                            correct: 0
                        };
                    }
                    stats.bySubcategory[sub.code].total++;
                    if (data.isCorrect) {
                        stats.bySubcategory[sub.code].correct++;
                    }
                });
            });

            return stats;
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }
};

export default questionService;
