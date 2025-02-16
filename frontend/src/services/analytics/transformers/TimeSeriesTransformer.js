import { dateUtils } from '../../../services/utils/firebaseUtils';

/**
 * Transforms time-based analytics data
 * Why: Centralizes time-series data processing logic and provides consistent
 * formatting for time-based analytics across the application
 */
export class TimeSeriesTransformer {
    /**
     * Transforms monthly progress data
     * @param {Array} progressData - Array of progress documents
     * @returns {Object} Transformed monthly progress data
     */
    static transformMonthlyProgress(progressData) {
        const monthlyProgress = new Map();
        const categories = new Map();

        // Group progress by month and track categories
        progressData.forEach(data => {
            const date = data.lastAttempted.toDate();
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            
            this.updateMonthlyProgress(monthlyProgress, monthKey, data);
            this.trackCategory(categories, data.category);
        });

        // Convert to monthly stats
        const monthlyStats = this.calculateMonthlyStats(monthlyProgress, categories);

        return {
            months: monthlyStats,
            categories: Array.from(categories.values())
        };
    }

    /**
     * Transforms study time data
     * @param {Array} progressData - Array of progress documents
     * @returns {Object} Transformed study time data
     */
    static transformStudyTime(progressData) {
        console.log('TimeSeriesTransformer input:', progressData);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dailyTime = new Array(7).fill(0);
        
        progressData.forEach(data => {
            // Process attempt history for each progress document
            if (data.attemptHistory && Array.isArray(data.attemptHistory)) {
                data.attemptHistory.forEach(attempt => {
                    console.log('Processing attempt:', attempt);
                    if (attempt.timestamp && attempt.answerTime) {
                        const date = attempt.timestamp.toDate();
                        const dayIndex = date.getDay();
                        const seconds = attempt.answerTime;
                        
                        if (seconds > 0) {
                            // Round up to at least 1 minute for any non-zero time
                            const minutes = Math.max(1, Math.ceil(seconds / 60));
                            dailyTime[dayIndex] += minutes;
                        }
                    }
                });
            }
        });

        console.log('TimeSeriesTransformer output:', {
            labels: dayNames,
            data: dailyTime,
            rawData: progressData
        });
        
        return {
            labels: dayNames,
            data: dailyTime.map(time => time || 0)  // Ensure no null/undefined values
        };
    }

    /**
     * Updates monthly progress map with new data
     * @private
     */
    static updateMonthlyProgress(monthlyProgress, monthKey, data) {
        const existing = monthlyProgress.get(monthKey) || new Map();
        const existingAttempt = existing.get(data.questionId);
        
        if (!existingAttempt || data.lastAttempted.toDate() > existingAttempt.lastAttempted.toDate()) {
            existing.set(data.questionId, data);
            monthlyProgress.set(monthKey, existing);
        }
    }

    /**
     * Tracks category information
     * @private
     */
    static trackCategory(categories, category) {
        if (!categories.has(category.code)) {
            categories.set(category.code, {
                code: category.code,
                name: category.name
            });
        }
    }

    /**
     * Calculates monthly statistics
     * @private
     */
    static calculateMonthlyStats(monthlyProgress, categories) {
        const sortedMonths = Array.from(monthlyProgress.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-6); // Get last 6 months

        return sortedMonths.map(([month, questions]) => {
            const questionsArray = Array.from(questions.values());
            const byCategory = this.initializeCategoryStats(categories);

            this.updateCategoryStats(byCategory, questionsArray);

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
    }

    /**
     * Initializes category statistics
     * @private
     */
    static initializeCategoryStats(categories) {
        const byCategory = new Map();
        categories.forEach(category => {
            byCategory.set(category.code, {
                name: category.name,
                correct: 0,
                incorrect: 0
            });
        });
        return byCategory;
    }

    /**
     * Updates category statistics with question data
     * @private
     */
    static updateCategoryStats(byCategory, questions) {
        questions.forEach(q => {
            const categoryStats = byCategory.get(q.category.code);
            if (categoryStats) {
                if (q.isCorrect) {
                    categoryStats.correct++;
                } else {
                    categoryStats.incorrect++;
                }
            }
        });
    }
}
