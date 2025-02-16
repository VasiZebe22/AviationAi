import { BaseAnalyticsService } from './BaseAnalyticsService';
import { FirestoreAdapter } from '../core/FirestoreAdapter';
import { BasicStatsTransformer } from '../transformers/BasicStatsTransformer';
import { TimeSeriesTransformer } from '../transformers/TimeSeriesTransformer';
import { SkillsTransformer } from '../transformers/SkillsTransformer';
import { dateUtils } from '../../../services/utils/firebaseUtils';

/**
 * Main analytics service for the application
 * Why: Provides high-level analytics functionality while delegating specific
 * responsibilities to specialized classes
 */
export class AnalyticsService extends BaseAnalyticsService {
    /**
     * Gets basic statistics about user performance
     * @returns {Promise<Object>} Basic statistics
     */
    static async getBasicStats() {
        try {
            const user = this.ensureAuthenticated();
            return await this.getWithCache(user.uid, 'basicStats', async () => {
                const [questions, progress] = await Promise.all([
                    FirestoreAdapter.getAllQuestions(),
                    FirestoreAdapter.getUserProgress(user.uid)
                ]);
                return BasicStatsTransformer.transform(questions, progress);
            });
        } catch (error) {
            return this.createErrorResponse('getting basic stats', {
                totalQuestions: 0,
                totalAttempted: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                byCategory: {}
            });
        }
    }

    /**
     * Gets monthly progress data for the last 6 months
     * @returns {Promise<Object>} Monthly progress data
     */
    static async getMonthlyProgress() {
        try {
            const user = this.ensureAuthenticated();
            return await this.getWithCache(user.uid, 'monthlyProgress', async () => {
                const sixMonthsAgo = dateUtils.getMonthsAgo(6);
                const progress = await FirestoreAdapter.getRecentProgress(user.uid, sixMonthsAgo);
                return TimeSeriesTransformer.transformMonthlyProgress(progress);
            });
        } catch (error) {
            return this.createErrorResponse('getting monthly progress', {
                months: [],
                categories: []
            });
        }
    }

    /**
     * Gets study time data for the last 7 days
     * @returns {Promise<Object>} Study time data
     */
    static async getRecentStudyTime() {
        try {
            const user = this.ensureAuthenticated();
            return await this.getWithCache(user.uid, 'recentStudyTime', async () => {
                const sevenDaysAgo = dateUtils.getDaysAgo(7);
                const progress = await FirestoreAdapter.getRecentProgress(user.uid, sevenDaysAgo);
                return TimeSeriesTransformer.transformStudyTime(progress);
            });
        } catch (error) {
            return this.createErrorResponse('getting study time', {
                labels: [],
                data: []
            });
        }
    }

    /**
     * Resets study time stats for the last 7 days
     * @returns {Promise<boolean>} Success status
     */
    static async resetStudyTime() {
        try {
            const user = this.ensureAuthenticated();
            const sevenDaysAgo = dateUtils.getDaysAgo(7);
            const progress = await FirestoreAdapter.getRecentProgress(user.uid, sevenDaysAgo);
            
            const updates = progress.map(doc => ({
                id: doc.id,
                answerTime: 0
            }));

            await FirestoreAdapter.batchUpdateStudyTime(user.uid, updates);
            return true;
        } catch (error) {
            return this.createErrorResponse('resetting study time', false);
        }
    }

    /**
     * Gets combined dashboard statistics
     * @returns {Promise<Object>} Dashboard statistics
     */
    static async getDashboardStats() {
        try {
            const [basicStats, monthlyProgress, studyTime] = await Promise.all([
                this.getBasicStats(),
                this.getMonthlyProgress(),
                this.getRecentStudyTime()
            ]);

            return {
                ...basicStats,
                monthlyProgress: monthlyProgress || {},
                studyTime: studyTime || { labels: [], data: [] }
            };
        } catch (error) {
            return this.createErrorResponse('getting dashboard stats', {
                totalQuestions: 0,
                totalAttempted: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                byCategory: {},
                monthlyProgress: {},
                studyTime: { labels: [], data: [] }
            });
        }
    }

    /**
     * Gets user progress data including all stats
     * @param {string} userId - User ID to get progress for
     * @returns {Promise<Object>} Combined progress data
     */
    static async getUserProgress(userId) {
        try {
            const user = this.ensureAuthenticated();
            return await this.getWithCache(userId, 'userProgress', async () => {
                const progress = await FirestoreAdapter.getUserProgress(user.uid);
                const [basicStats, monthlyProgress, studyTime, skillsAnalysis] = await Promise.all([
                    this.getBasicStats(),
                    this.getMonthlyProgress(),
                    this.getRecentStudyTime(),
                    SkillsTransformer.transform(progress)
                ]);

                const combinedData = {
                    ...basicStats,
                    monthlyProgress,
                    studyTime,
                    skillsBreakdown: skillsAnalysis.skillsBreakdown,
                    performance: {
                        correct: basicStats.correctAnswers,
                        incorrect: basicStats.incorrectAnswers
                    }
                };

                console.log('User Progress Data:', combinedData); // Debug log
                return combinedData;
            });
        } catch (error) {
            console.error('Error getting user progress:', error);
            throw error;
        }
    }

    /**
     * Refreshes user progress data
     * @param {string} userId - User ID to refresh progress for
     * @returns {Promise<Object>} Fresh progress data
     */
    static async refreshUserProgress(userId) {
        try {
            const user = this.ensureAuthenticated();
            
            // Refresh all dependent data first
            await Promise.all([
                this.refreshBasicStats(),
                this.refreshMonthlyProgress(),
                this.refreshRecentStudyTime()
            ]);

            // Then refresh and return the combined user progress
            return await this.refreshCache(userId, 'userProgress', async () => {
                const [basicStats, monthlyProgress, studyTime] = await Promise.all([
                    this.getBasicStats(),
                    this.getMonthlyProgress(),
                    this.getRecentStudyTime()
                ]);

                return {
                    ...basicStats,
                    monthlyProgress,
                    studyTime,
                    performance: {
                        correct: basicStats.correctAnswers,
                        incorrect: basicStats.incorrectAnswers
                    }
                };
            });
        } catch (error) {
            console.error('Error refreshing user progress:', error);
            throw error;
        }
    }

    // Refresh methods
    static async refreshBasicStats() {
        const user = this.ensureAuthenticated();
        return this.refreshCache(user.uid, 'basicStats', () => this.getBasicStats());
    }

    static async refreshMonthlyProgress() {
        const user = this.ensureAuthenticated();
        return this.refreshCache(user.uid, 'monthlyProgress', () => this.getMonthlyProgress());
    }

    static async refreshRecentStudyTime() {
        const user = this.ensureAuthenticated();
        return this.refreshCache(user.uid, 'recentStudyTime', () => this.getRecentStudyTime());
    }
}
