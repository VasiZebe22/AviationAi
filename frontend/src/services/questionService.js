import { db, auth } from './firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc, orderBy, limit } from 'firebase/firestore';

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

            console.log(`Retrieved ${questions.length} questions from Firebase`);

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

            console.log(`Retrieved ${questions.length} questions from Firebase`);

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

            // Create or update progress document with all user-specific data
            const progressRef = doc(db, 'progress', `${user.uid}_${questionId}`);
            const progressData = {
                userId: user.uid,
                questionId,
                isCorrect,
                isSeen: true,
                lastAttempted: new Date(),
                category: questionDoc.data().category,
                subcategories: questionDoc.data().subcategories
            };

            try {
                // Try to update existing progress
                const progressDoc = await getDoc(progressRef);
                if (progressDoc.exists()) {
                    await updateDoc(progressRef, {
                        ...progressData,
                        attempts: (progressDoc.data().attempts || 0) + 1
                    });
                } else {
                    // Create new progress document with specified ID
                    await setDoc(progressRef, {
                        ...progressData,
                        attempts: 1
                    });
                }
            } catch (error) {
                console.error('Error updating progress:', error);
                throw error;
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

            // Use a consistent document reference with compound ID
            const flagRef = doc(db, 'flags', `${user.uid}_${questionId}`);
            
            if (flag) {
                // Set or update flag
                await setDoc(flagRef, {
                    userId: user.uid,
                    questionId,
                    flag,
                    updated_at: new Date()
                });
            } else {
                // Remove flag if flag value is undefined/null
                await setDoc(flagRef, {
                    userId: user.uid,
                    questionId,
                    flag: null,
                    updated_at: new Date()
                });
            }
        } catch (error) {
            console.error('Error updating flag:', error);
            throw error;
        }
    },

    // Save note
    async saveNote(questionId, note) {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        try {
            // Use a consistent document reference with compound ID
            const noteRef = doc(db, 'notes', `${user.uid}_${questionId}`);
            
            // Check if document exists
            const noteDoc = await getDoc(noteRef);
            
            if (noteDoc.exists()) {
                // Update existing note
                await updateDoc(noteRef, {
                    content: note,
                    updated_at: new Date()
                });
            } else {
                // Create new note with specified ID
                await setDoc(noteRef, {
                    userId: user.uid,
                    questionId,
                    content: note,
                    created_at: new Date(),
                    updated_at: new Date()
                });
            }
        } catch (error) {
            console.error('Error saving note:', error);
            throw error;
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
    },

    // Get flags for questions
    async getFlags(questionIds) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Create an array of document references for all question flags
            const flagRefs = questionIds.map(qId => doc(db, 'flags', `${user.uid}_${qId}`));
            
            // Get all flags in parallel
            const flagDocs = await Promise.all(flagRefs.map(ref => getDoc(ref)));
            
            // Convert to a map of questionId -> flag color
            const flags = {};
            flagDocs.forEach((doc, index) => {
                if (doc.exists() && doc.data().flag) {
                    flags[questionIds[index]] = doc.data().flag;
                }
            });

            return flags;
        } catch (error) {
            console.error('Error fetching flags:', error);
            throw error;
        }
    },

    // Get notes for questions
    async getNotes(questionIds) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Create an array of document references for all question notes
            const noteRefs = questionIds.map(qId => doc(db, 'notes', `${user.uid}_${qId}`));
            
            // Get all notes in parallel
            const noteDocs = await Promise.all(noteRefs.map(ref => getDoc(ref)));
            
            // Convert to a map of questionId -> note content
            const notes = {};
            noteDocs.forEach((doc, index) => {
                if (doc.exists() && doc.data().content) {
                    notes[questionIds[index]] = doc.data().content;
                }
            });

            return notes;
        } catch (error) {
            console.error('Error fetching notes:', error);
            throw error;
        }
    }
};

export default questionService;
