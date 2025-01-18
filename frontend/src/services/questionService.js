import { db, auth } from './firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc, orderBy, deleteDoc } from 'firebase/firestore';

const questionService = {
    // Get questions by category
    async getQuestionsByCategory(categoryCode, filters = {}) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            // First get wrong answers from progress collection if filter is applied
            let questionIds = [];
            if (filters.incorrectlyAnswered) {
                const progressSnapshot = await getDocs(
                    query(
                        collection(db, 'progress'),
                        where('userId', '==', user.uid)
                    )
                );

                // Create a map to track the latest attempt for each question
                const latestAttempts = new Map();
                
                // Process all attempts to find the latest one for each question
                progressSnapshot.forEach(doc => {
                    const data = doc.data();
                    const existingAttempt = latestAttempts.get(data.questionId);
                    
                    if (!existingAttempt || data.lastAttempted.toDate() > existingAttempt.lastAttempted.toDate()) {
                        latestAttempts.set(data.questionId, data);
                    }
                });

                // Get IDs of questions that are still incorrect in their latest attempt
                questionIds = Array.from(latestAttempts.values())
                    .filter(data => !data.isCorrect)
                    .map(data => data.questionId);
            }

            // Build query
            let q;
            if (categoryCode === 'all') {
                q = query(collection(db, 'questions'));
            } else {
                q = query(
                    collection(db, 'questions'),
                    where('category.code', '==', categoryCode)
                );
            }

            // Apply additional filters
            if (filters.markedQuestions) {
                q = query(q, where('is_marked', '==', true));
            }

            if (filters.unseenQuestions) {
                q = query(q, where('is_seen', '==', false));
            }

            // Get questions and sort them
            const querySnapshot = await getDocs(q);
            let questions = querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .sort((a, b) => {
                    const dateA = a.created_at?.toDate?.() || new Date(a.created_at);
                    const dateB = b.created_at?.toDate?.() || new Date(b.created_at);
                    return dateB - dateA;
                });

            // Filter by wrong answers if needed
            if (filters.incorrectlyAnswered && questionIds.length > 0) {
                questions = questions.filter(q => questionIds.includes(q.id));
            }

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

    calculateSkillScores: function(attempts) {
        if (!attempts.length) return 0;

        // Basic correct rate (40%)
        const correctRate = attempts.filter(a => a.isCorrect).length / attempts.length;

        // Consistency score (30%) - based on improvement
        const consistencyScore = (() => {
            if (attempts.length < 2) return 0;
            const recentAttempts = attempts.slice(-5); // Look at last 5 attempts
            let improvements = 0;
            for (let i = 1; i < recentAttempts.length; i++) {
                if (!recentAttempts[i-1].isCorrect && recentAttempts[i].isCorrect) {
                    improvements++;
                }
            }
            return improvements / (recentAttempts.length - 1);
        })();

        // Time improvement score (15%)
        const timeScore = (() => {
            if (attempts.length < 2) return 0;
            const times = attempts.map(a => a.answerTime);
            const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
            const recentTime = times.slice(-3).reduce((a, b) => a + b, 0) / 3;
            return recentTime < averageTime ? 1 : averageTime / recentTime;
        })();

        // Retention score (15%)
        const retentionScore = (() => {
            if (attempts.length < 2) return 0;
            const correctAfterGap = attempts.filter((a, i) => {
                if (i === 0) return false;
                const timeDiff = a.lastAttempted - attempts[i-1].lastAttempted;
                const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
                return daysDiff > 1 && a.isCorrect;
            }).length;
            return correctAfterGap / (attempts.length - 1);
        })();

        return (
            (correctRate * 0.4) +
            (consistencyScore * 0.3) +
            (timeScore * 0.15) +
            (retentionScore * 0.15)
        ) * 100;
    },

    // Update progress
    async updateProgress(questionId, isCorrect, answerTime = 0) {
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

            // Get previous attempts
            const progressRef = doc(db, 'progress', `${user.uid}_${questionId}`);
            const progressDoc = await getDoc(progressRef);
            
            // Create progress data
            const progressData = {
                userId: user.uid,
                questionId,
                isCorrect,
                isSeen: true,
                lastAttempted: new Date(),
                category: questionDoc.data().category,
                subcategories: questionDoc.data().subcategories || [],
                attempts: progressDoc.exists() ? (progressDoc.data().attempts || 0) + 1 : 1
            };

            // Update or create progress document
            await setDoc(progressRef, progressData);
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

    // Get basic stats (correct/incorrect counts)
    async getBasicStats() {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Only get latest attempt for each question
            const progressSnapshot = await getDocs(
                query(
                    collection(db, 'progress'),
                    where('userId', '==', user.uid)
                )
            );

            // Track latest attempt per question
            const latestAttempts = new Map();
            progressSnapshot.forEach(doc => {
                const data = doc.data();
                const existingAttempt = latestAttempts.get(data.questionId);
                if (!existingAttempt || data.lastAttempted.toDate() > existingAttempt.lastAttempted.toDate()) {
                    latestAttempts.set(data.questionId, data);
                }
            });

            // Get all questions first to know total available
            const questionsSnapshot = await getDocs(collection(db, 'questions'));
            const questionsByCategory = new Map();
            
            // Group questions by category
            questionsSnapshot.forEach(doc => {
                const data = doc.data();
                const categoryCode = data.category.code;
                if (!questionsByCategory.has(categoryCode)) {
                    questionsByCategory.set(categoryCode, {
                        name: data.category.name,
                        total: 0,
                        attempted: 0,
                        correct: 0
                    });
                }
                questionsByCategory.get(categoryCode).total++;
            });

            // Calculate stats
            const stats = {
                totalQuestions: questionsSnapshot.size,
                totalAttempted: latestAttempts.size,
                correctAnswers: 0,
                incorrectAnswers: 0,
                byCategory: {}
            };

            // Process attempts
            latestAttempts.forEach(data => {
                const categoryCode = data.category.code;
                if (!stats.byCategory[categoryCode]) {
                    const categoryData = questionsByCategory.get(categoryCode) || {
                        name: data.category.name,
                        total: 0,
                        attempted: 0,
                        correct: 0
                    };
                    stats.byCategory[categoryCode] = categoryData;
                }
                
                stats.byCategory[categoryCode].attempted++;
                if (data.isCorrect) {
                    stats.byCategory[categoryCode].correct++;
                    stats.correctAnswers++;
                } else {
                    stats.incorrectAnswers++;
                }
            });

            return stats;
        } catch (error) {
            console.error('Error getting basic stats:', error);
            throw error;
        }
    },

    // Get skill scores based on recent attempts
    async getSkillScores() {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Get recent attempts for skill calculation
            const progressSnapshot = await getDocs(
                query(
                    collection(db, 'progress'),
                    where('userId', '==', user.uid),
                    where('lastAttempted', '>=', thirtyDaysAgo),
                    orderBy('lastAttempted', 'desc')
                )
            );

            // Group attempts by category
            const attemptsByCategory = new Map();
            progressSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const categoryCode = data.category.code;
                if (!attemptsByCategory.has(categoryCode)) {
                    attemptsByCategory.set(categoryCode, []);
                }
                attemptsByCategory.get(categoryCode).push({
                    ...data,
                    lastAttempted: data.lastAttempted.toDate()
                });
            });

            // Calculate skill scores
            const skillScores = {};
            attemptsByCategory.forEach((attempts, categoryCode) => {
                skillScores[categoryCode] = this.calculateSkillScores(attempts);
            });

            return skillScores;
        } catch (error) {
            console.error('Error getting skill scores:', error);
            throw error;
        }
    },

    // Get monthly progress data (last 6 months)
    async getMonthlyProgress() {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const progressSnapshot = await getDocs(
                query(
                    collection(db, 'progress'),
                    where('userId', '==', user.uid),
                    where('lastAttempted', '>=', sixMonthsAgo),
                    orderBy('lastAttempted', 'desc')
                )
            );

            // Create a map to track questions completed per month
            const monthlyProgress = new Map();
            
            progressSnapshot.forEach(doc => {
                const data = doc.data();
                const date = data.lastAttempted.toDate();
                const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
                
                // Only count each question once per month (latest attempt in that month)
                const existing = monthlyProgress.get(monthKey) || new Map();
                const existingAttempt = existing.get(data.questionId);
                
                if (!existingAttempt || data.lastAttempted.toDate() > existingAttempt.lastAttempted.toDate()) {
                    existing.set(data.questionId, data);
                    monthlyProgress.set(monthKey, existing);
                }
            });

            // Convert to array of monthly totals
            const sortedMonths = Array.from(monthlyProgress.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .slice(-6); // Get last 6 months

            // Group questions by category
            const categories = new Map();
            progressSnapshot.forEach(doc => {
                const data = doc.data();
                const category = data.category;
                if (!categories.has(category.code)) {
                    categories.set(category.code, {
                        code: category.code,
                        name: category.name
                    });
                }
            });

            // Create monthly stats for each category
            const monthlyStats = sortedMonths.map(([month, questions]) => {
                const questionsArray = Array.from(questions.values());
                const byCategory = new Map();

                // Initialize stats for each category
                categories.forEach(category => {
                    byCategory.set(category.code, {
                        name: category.name,
                        correct: 0,
                        incorrect: 0
                    });
                });

                // Count correct/incorrect for each category
                questionsArray.forEach(q => {
                    const categoryStats = byCategory.get(q.category.code);
                    if (categoryStats) {
                        if (q.isCorrect) {
                            categoryStats.correct++;
                        } else {
                            categoryStats.incorrect++;
                        }
                    }
                });

                return {
                    month,
                    total: questions.size,
                    correct: questionsArray.filter(q => q.isCorrect).length,
                    incorrect: questionsArray.filter(q => !q.isCorrect).length,
                    byCategory: Array.from(byCategory.entries()).map(([code, stats]) => ({
                        code,
                        ...stats
                    }))
                };
            });

            return {
                months: monthlyStats,
                categories: Array.from(categories.values())
            };
        } catch (error) {
            console.error('Error getting monthly progress:', error);
            throw error;
        }
    },

    // Get study time for the last 7 days
    async getRecentStudyTime() {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const progressSnapshot = await getDocs(
                query(
                    collection(db, 'progress'),
                    where('userId', '==', user.uid),
                    where('lastAttempted', '>=', sevenDaysAgo),
                    orderBy('lastAttempted', 'desc')
                )
            );

            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dailyTime = new Array(7).fill(0);
            
            progressSnapshot.forEach(doc => {
                const data = doc.data();
                const date = data.lastAttempted.toDate();
                const dayIndex = date.getDay();
                dailyTime[dayIndex] += (data.answerTime || 0) / 3600;
            });

            return {
                labels: dayNames,
                data: dailyTime.map(time => Math.round(time * 10) / 10) // Round to 1 decimal
            };
        } catch (error) {
            console.error('Error getting study time:', error);
            throw error;
        }
    },

    // Get dashboard stats (combines all stat functions)
    async getDashboardStats() {
        try {
            const [basicStats, skillScores, monthlyProgress, studyTime] = await Promise.all([
                this.getBasicStats(),
                this.getSkillScores(),
                this.getMonthlyProgress(),
                this.getRecentStudyTime()
            ]);

            // Merge skill scores into category stats
            Object.entries(skillScores).forEach(([categoryCode, skillScore]) => {
                if (basicStats.byCategory[categoryCode]) {
                    basicStats.byCategory[categoryCode].skillScore = skillScore;
                }
            });

            return {
                ...basicStats,
                monthlyProgress,
                studyTime
            };
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
    },

    // Delete saved test
    async deleteSavedTest(testId) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const testRef = doc(db, 'saved_tests', testId);
            const testDoc = await getDoc(testRef);

            if (!testDoc.exists()) {
                throw new Error('Saved test not found');
            }

            // Verify ownership
            if (testDoc.data().userId !== user.uid) {
                throw new Error('Unauthorized access to saved test');
            }

            await deleteDoc(testRef);
            return true;
        } catch (error) {
            console.error('Error deleting saved test:', error);
            throw error;
        }
    },

    // Reset study time stats for the last 7 days
    async resetStudyTime() {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // Get recent progress docs to reset
            const progressSnapshot = await getDocs(
                query(
                    collection(db, 'progress'),
                    where('userId', '==', user.uid),
                    where('lastAttempted', '>=', sevenDaysAgo)
                )
            );

            // Reset answerTime to 0 for each doc
            const batch = db.batch();
            progressSnapshot.docs.forEach(doc => {
                batch.update(doc.ref, { answerTime: 0 });
            });

            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error resetting study time:', error);
            throw error;
        }
    },

    // Reset all user progress and associated data
    async resetAllProgress() {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Get all user's data from different collections
            const [progressSnapshot, flagsSnapshot, notesSnapshot] = await Promise.all([
                getDocs(query(collection(db, 'progress'), where('userId', '==', user.uid))),
                getDocs(query(collection(db, 'flags'), where('userId', '==', user.uid))),
                getDocs(query(collection(db, 'notes'), where('userId', '==', user.uid)))
            ]);

            // Combine all documents that need to be deleted
            const allDocs = [
                ...progressSnapshot.docs,
                ...flagsSnapshot.docs,
                ...notesSnapshot.docs
            ];

            // Process deletions in batches
            const batchSize = 450; // Firestore limit is 500, leave room for safety
            const batches = [];
            
            for (let i = 0; i < allDocs.length; i += batchSize) {
                const batch = db.batch();
                const chunk = allDocs.slice(i, i + batchSize);
                
                chunk.forEach(doc => {
                    batch.delete(doc.ref);
                });
                
                batches.push(batch.commit());
            }

            // Wait for all batches to complete
            await Promise.all(batches);
            return true;
        } catch (error) {
            console.error('Error resetting progress:', error);
            throw error;
        }
    },

    // Save current test state
    async saveTestState(testData) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Get total questions for this category/filters combination
            let totalQuestions = 0;
            const questionsSnapshot = await getDocs(
                query(
                    collection(db, 'questions'),
                    where('category.code', '==', testData.categoryId)
                )
            );
            totalQuestions = questionsSnapshot.size;

            // If this is an update to an existing test, use that ID
            const savedTestRef = testData.savedTestId ? 
                doc(db, 'saved_tests', testData.savedTestId) : 
                doc(collection(db, 'saved_tests'));

            // Ensure answeredQuestions is an object
            const answeredQuestions = typeof testData.answeredQuestions === 'object' ? 
                testData.answeredQuestions : {};

            await setDoc(savedTestRef, {
                userId: user.uid,
                categoryId: testData.categoryId,
                currentQuestion: testData.currentQuestion,
                timer: testData.timer,
                answeredQuestions: answeredQuestions,
                filters: testData.filters || {},
                selectedSubcategories: testData.selectedSubcategories || [],
                savedAt: new Date(),
                totalQuestions: totalQuestions,
                mode: testData.mode || 'study'
            }, { merge: true });

            return savedTestRef.id;
        } catch (error) {
            console.error('Error saving test state:', error);
            throw error;
        }
    },

    // Get saved test state
    async getSavedTest(testId) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const testRef = doc(db, 'saved_tests', testId);
            const testDoc = await getDoc(testRef);

            if (!testDoc.exists()) {
                throw new Error('Saved test not found');
            }

            const testData = testDoc.data();
            if (testData.userId !== user.uid) {
                throw new Error('Unauthorized access to saved test');
            }

            return testData;
        } catch (error) {
            console.error('Error loading test state:', error);
            throw error;
        }
    },

    // Get all saved tests for current user
    async getSavedTests() {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const savedTestsSnapshot = await getDocs(
                query(
                    collection(db, 'saved_tests'),
                    where('userId', '==', user.uid),
                    orderBy('savedAt', 'desc')
                )
            );

            return savedTestsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching saved tests:', error);
            throw error;
        }
    }
};

export default questionService;
