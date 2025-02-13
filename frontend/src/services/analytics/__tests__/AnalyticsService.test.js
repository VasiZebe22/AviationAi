import { AnalyticsService } from '../services/AnalyticsService';
import { FirestoreAdapter } from '../core/FirestoreAdapter';
import { CacheManager } from '../core/CacheManager';
import { getCurrentUser } from '../../../utils/firebaseUtils';

// Mock dependencies
jest.mock('../core/FirestoreAdapter');
jest.mock('../core/CacheManager');
jest.mock('../../../utils/firebaseUtils');

describe('AnalyticsService', () => {
    const mockUser = { uid: 'test-user-id' };
    const mockBasicStats = {
        totalQuestions: 10,
        totalAttempted: 5,
        correctAnswers: 3,
        incorrectAnswers: 2,
        byCategory: {}
    };

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Setup default mock implementations
        getCurrentUser.mockReturnValue(mockUser);
        CacheManager.get.mockReturnValue(null);
        CacheManager.generateKey.mockReturnValue('test-key');
    });

    describe('getBasicStats', () => {
        it('should return cached data if available', async () => {
            CacheManager.get.mockReturnValue(mockBasicStats);
            
            const result = await AnalyticsService.getBasicStats();
            
            expect(result).toEqual(mockBasicStats);
            expect(FirestoreAdapter.getAllQuestions).not.toHaveBeenCalled();
        });

        it('should fetch and transform data if not cached', async () => {
            const mockQuestions = [
                { id: 'q1', category: { code: 'cat1', name: 'Category 1' } }
            ];
            const mockProgress = [
                { questionId: 'q1', isCorrect: true }
            ];

            FirestoreAdapter.getAllQuestions.mockResolvedValue(mockQuestions);
            FirestoreAdapter.getUserProgress.mockResolvedValue(mockProgress);

            const result = await AnalyticsService.getBasicStats();

            expect(result.totalQuestions).toBe(1);
            expect(result.correctAnswers).toBe(1);
            expect(CacheManager.set).toHaveBeenCalled();
        });

        it('should handle errors gracefully', async () => {
            FirestoreAdapter.getAllQuestions.mockRejectedValue(new Error('Test error'));

            const result = await AnalyticsService.getBasicStats();

            expect(result).toEqual({
                totalQuestions: 0,
                totalAttempted: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                byCategory: {}
            });
        });
    });

    describe('getMonthlyProgress', () => {
        const mockMonthlyData = {
            months: [],
            categories: []
        };

        it('should return cached monthly progress if available', async () => {
            CacheManager.get.mockReturnValue(mockMonthlyData);

            const result = await AnalyticsService.getMonthlyProgress();

            expect(result).toEqual(mockMonthlyData);
            expect(FirestoreAdapter.getRecentProgress).not.toHaveBeenCalled();
        });

        it('should handle errors gracefully', async () => {
            FirestoreAdapter.getRecentProgress.mockRejectedValue(new Error('Test error'));

            const result = await AnalyticsService.getMonthlyProgress();

            expect(result).toEqual({
                months: [],
                categories: []
            });
        });
    });

    describe('resetStudyTime', () => {
        it('should reset study time successfully', async () => {
            const mockProgress = [
                { id: 'p1', answerTime: 100 },
                { id: 'p2', answerTime: 200 }
            ];

            FirestoreAdapter.getRecentProgress.mockResolvedValue(mockProgress);
            FirestoreAdapter.batchUpdateStudyTime.mockResolvedValue();

            const result = await AnalyticsService.resetStudyTime();

            expect(result).toBe(true);
            expect(FirestoreAdapter.batchUpdateStudyTime).toHaveBeenCalledWith(
                mockUser.uid,
                expect.arrayContaining([
                    expect.objectContaining({ answerTime: 0 })
                ])
            );
        });

        it('should handle errors gracefully', async () => {
            FirestoreAdapter.getRecentProgress.mockRejectedValue(new Error('Test error'));

            const result = await AnalyticsService.resetStudyTime();

            expect(result).toBe(false);
        });
    });
});
