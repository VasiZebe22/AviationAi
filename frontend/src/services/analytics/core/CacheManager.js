import { cacheUtils, cacheKeys } from '../../../services/utils/cacheUtils';

/**
 * Centralized cache management for analytics data
 * Why: Reduces duplication of caching logic and provides a single point of control
 * for cache operations and invalidation strategies
 */
export class CacheManager {
    /**
     * Retrieves data from cache if available
     * @param {string} key - Cache key to retrieve
     * @returns {any|null} Cached data or null if not found
     */
    static get(key) {
        return cacheUtils.get(key);
    }

    /**
     * Stores data in cache
     * @param {string} key - Cache key to store
     * @param {any} data - Data to cache
     */
    static set(key, data) {
        cacheUtils.set(key, data);
    }

    /**
     * Generates cache key for user-specific analytics data
     * @param {string} userId - User ID
     * @param {string} type - Type of analytics data
     * @returns {string} Generated cache key
     */
    static generateKey(userId, type) {
        switch (type) {
            case 'basicStats':
                return cacheKeys.basicStats(userId);
            case 'monthlyProgress':
                return cacheKeys.monthlyProgress(userId);
            case 'recentStudyTime':
                return cacheKeys.recentStudyTime(userId);
            case 'userProgress':
                return cacheKeys.userProgress(userId);
            default:
                throw new Error(`Invalid cache type: ${type}`);
        }
    }

    /**
     * Invalidates cache for specific user and data type
     * @param {string} userId - User ID
     * @param {string|string[]} types - Type(s) of data to invalidate
     */
    static invalidate(userId, types) {
        const typeArray = Array.isArray(types) ? types : [types];
        typeArray.forEach(type => {
            const key = this.generateKey(userId, type);
            cacheUtils.set(key, null);
        });
    }
}
