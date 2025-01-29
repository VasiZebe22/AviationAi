import { query, getDocs, getDoc, setDoc, where, orderBy, getFirestore, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { getCurrentUser, handleFirebaseError, db_operations, dateUtils } from '../utils/firebaseUtils';

export const progressService = {
    // Update progress
    async updateProgress(questionId, isCorrect, answerTime = 0) {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const questionDoc = await getDoc(db_operations.docs.question(questionId));
            if (!questionDoc.exists()) {
                throw new Error('Question not found');
            }

            // Get previous attempts
            const progressRef = db_operations.docs.progress(user.uid, questionId);
            const progressDoc = await getDoc(progressRef);
            
            // Initialize or get existing attempt history
            const existingData = progressDoc.exists() ? progressDoc.data() : {};
            const attemptHistory = existingData.attemptHistory || [];

            // Add new attempt to history
            attemptHistory.push({
                isCorrect,
                timestamp: new Date(),
                answerTime
            });

            // Keep only last 30 days of attempts
            const thirtyDaysAgo = dateUtils.getDaysAgo(30);
            const filteredHistory = attemptHistory.filter(attempt => 
                attempt.timestamp.toDate?.() > thirtyDaysAgo || 
                attempt.timestamp > thirtyDaysAgo
            );

            // Create progress data
            const progressData = {
                userId: user.uid,
                questionId,
                isCorrect,
                isSeen: true,
                lastAttempted: new Date(),
                category: questionDoc.data().category,
                subcategories: questionDoc.data().subcategories || [],
                attempts: (existingData.attempts || 0) + 1,
                attemptHistory: filteredHistory
            };

            await setDoc(progressRef, progressData);
        } catch (error) {
            handleFirebaseError(error, 'updating progress');
        }
    },

    // Calculate skill scores based on attempts
    calculateSkillScores(attempts) {
        if (!attempts || !attempts.length) {
            return 0;
        }

        // Get all attempt histories and flatten them
        const allAttempts = attempts.flatMap(doc => {
            const history = doc.attemptHistory || [];
            if (history.length === 0) {
                return [{
                    isCorrect: doc.isCorrect,
                    timestamp: doc.lastAttempted,
                    answerTime: 0
                }];
            }
            
            return history.map(attempt => {
                let timestamp = attempt.timestamp;
                if (timestamp && typeof timestamp.toDate === 'function') {
                    timestamp = timestamp.toDate();
                } else if (!(timestamp instanceof Date)) {
                    timestamp = new Date(timestamp);
                }
                
                return {
                    ...attempt,
                    timestamp
                };
            });
        }).sort((a, b) => b.timestamp - a.timestamp);

        if (!allAttempts.length) {
            return 0;
        }

        // Basic correct rate (40%)
        const correctAttempts = allAttempts.filter(a => a.isCorrect);
        const correctRate = correctAttempts.length / allAttempts.length;

        // Consistency score (30%) - based on improvement
        const consistencyScore = (() => {
            if (allAttempts.length < 2) return 0;
            const recentAttempts = allAttempts.slice(0, Math.min(5, allAttempts.length));
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
            if (allAttempts.length < 2) return 0;
            const times = allAttempts.map(a => a.answerTime || 0);
            const validTimes = times.filter(t => t > 0);
            if (validTimes.length < 2) return 0;
            
            const averageTime = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
            const recentTimes = validTimes.slice(0, Math.min(3, validTimes.length));
            const recentAverage = recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
            
            return recentAverage < averageTime ? 1 : averageTime / recentAverage;
        })();

        // Retention score (15%)
        const retentionScore = (() => {
            if (allAttempts.length < 2) return 0;
            let correctAfterGap = 0;
            let gapOpportunities = 0;
            
            for (let i = 0; i < allAttempts.length - 1; i++) {
                const timeDiff = allAttempts[i].timestamp - allAttempts[i + 1].timestamp;
                const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
                if (daysDiff > 1) {
                    gapOpportunities++;
                    if (allAttempts[i].isCorrect) {
                        correctAfterGap++;
                    }
                }
            }
            
            return gapOpportunities > 0 ? correctAfterGap / gapOpportunities : 0;
        })();

        return Math.round(
            (correctRate * 0.4 +
            consistencyScore * 0.3 +
            timeScore * 0.15 +
            retentionScore * 0.15) * 100
        );
    },

    // Get skill scores based on recent attempts
    async getSkillScores() {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const thirtyDaysAgo = dateUtils.getDaysAgo(30);

            // Get recent attempts for skill calculation
            const progressSnapshot = await getDocs(
                query(
                    db_operations.collections.progress(),
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
                attemptsByCategory.get(categoryCode).push(data);
            });

            // Calculate skill scores for each category
            const skillScores = {};
            attemptsByCategory.forEach((attempts, categoryCode) => {
                skillScores[categoryCode] = this.calculateSkillScores(attempts);
            });

            return skillScores;
        } catch (error) {
            handleFirebaseError(error, 'getting skill scores');
        }
    },

    // Reset all progress
    async resetAllProgress() {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const progressSnapshot = await getDocs(
                query(
                    db_operations.collections.progress(),
                    where('userId', '==', user.uid)
                )
            );

            // Process deletions in batches
            const batchSize = 450;
            const batches = [];
            
            for (let i = 0; i < progressSnapshot.docs.length; i += batchSize) {
                const batch = writeBatch(db);
                const chunk = progressSnapshot.docs.slice(i, i + batchSize);
                
                chunk.forEach(doc => {
                    batch.delete(doc.ref);
                });
                
                batches.push(batch.commit());
            }

            await Promise.all(batches);
            return true;
        } catch (error) {
            handleFirebaseError(error, 'resetting progress');
        }
    }
};
