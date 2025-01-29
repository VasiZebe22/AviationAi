import { collection, query, where, getDocs, orderBy, getFirestore, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { getCurrentUser, handleFirebaseError, db_operations, dateUtils } from '../utils/firebaseUtils';

export const analyticsService = {
    // Get basic stats (correct/incorrect counts)
    async getBasicStats() {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Initialize stats object with default values
            const stats = {
                totalQuestions: 0,
                totalAttempted: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                byCategory: {}
            };

            // Get all questions first to know total available
            const questionsSnapshot = await getDocs(db_operations.collections.questions());
            
            // Initialize stats.byCategory with default values for each category
            questionsSnapshot.forEach(doc => {
                const data = doc.data();
                const categoryCode = data.category?.code;
                
                if (categoryCode && !stats.byCategory[categoryCode]) {
                    stats.byCategory[categoryCode] = {
                        name: data.category.name,
                        total: 0,
                        attempted: 0,
                        correct: 0
                    };
                }
                
                if (categoryCode) {
                    stats.byCategory[categoryCode].total++;
                    stats.totalQuestions++;
                }
            });

            // Get user's progress
            const progressSnapshot = await getDocs(
                query(
                    db_operations.collections.progress(),
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

            // Process attempts and update stats
            latestAttempts.forEach(data => {
                const question = questionsSnapshot.docs.find(doc => doc.id === data.questionId);
                if (!question) return;

                const categoryCode = question.data().category?.code;
                if (!categoryCode || !stats.byCategory[categoryCode]) return;

                stats.totalAttempted++;
                stats.byCategory[categoryCode].attempted++;
                
                if (data.isCorrect) {
                    stats.correctAnswers++;
                    stats.byCategory[categoryCode].correct++;
                } else {
                    stats.incorrectAnswers++;
                }
            });

            return stats;
        } catch (error) {
            handleFirebaseError(error, 'getting basic stats');
            // Return default stats object instead of throwing
            return {
                totalQuestions: 0,
                totalAttempted: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                byCategory: {}
            };
        }
    },

    // Get monthly progress data (last 6 months)
    async getMonthlyProgress() {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const sixMonthsAgo = dateUtils.getMonthsAgo(6);

            const progressSnapshot = await getDocs(
                query(
                    db_operations.collections.progress(),
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
            handleFirebaseError(error, 'getting monthly progress');
        }
    },

    // Get study time for the last 7 days
    async getRecentStudyTime() {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const sevenDaysAgo = dateUtils.getDaysAgo(7);

            const progressSnapshot = await getDocs(
                query(
                    db_operations.collections.progress(),
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
            handleFirebaseError(error, 'getting study time');
        }
    },

    // Reset study time stats for the last 7 days
    async resetStudyTime() {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const sevenDaysAgo = dateUtils.getDaysAgo(7);

            // Get recent progress docs to reset
            const progressSnapshot = await getDocs(
                query(
                    db_operations.collections.progress(),
                    where('userId', '==', user.uid),
                    where('lastAttempted', '>=', sevenDaysAgo)
                )
            );

            // Reset answerTime to 0 for each doc
            const batch = writeBatch(db);
            progressSnapshot.docs.forEach(doc => {
                batch.update(doc.ref, { answerTime: 0 });
            });

            await batch.commit();
            return true;
        } catch (error) {
            handleFirebaseError(error, 'resetting study time');
        }
    },

    // Get dashboard stats (combines all stat functions)
    async getDashboardStats() {
        try {
            const [basicStats, monthlyProgress, studyTime] = await Promise.all([
                this.getBasicStats(),
                this.getMonthlyProgress(),
                this.getRecentStudyTime()
            ]);

            return {
                ...basicStats,
                monthlyProgress: monthlyProgress || {},
                studyTime: studyTime || { totalTime: 0, dailyTime: {} }
            };
        } catch (error) {
            handleFirebaseError(error, 'getting dashboard stats');
            // Return default stats object
            return {
                totalQuestions: 0,
                totalAttempted: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                byCategory: {},
                monthlyProgress: {},
                studyTime: { totalTime: 0, dailyTime: {} }
            };
        }
    }
};
