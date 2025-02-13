import { getCurrentUser } from '../../../services/utils/firebaseUtils';
import { CacheManager } from '../core/CacheManager';
import { FirestoreAdapter } from '../core/FirestoreAdapter';

/**
 * Base class for analytics services
 * Why: Provides common functionality for authentication, caching, and data access
 * reducing code duplication and ensuring consistent behavior across services
 */
export class BaseAnalyticsService {
    /**
     * Ensures user is authenticated
     * @protected
     * @throws {Error} If user is not authenticated
     * @returns {Object} Current user object
     */
    static ensureAuthenticated() {
        const user = getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }
        return user;
    }

    /**
     * Retrieves data with caching
     * @protected
     * @param {string} userId - User ID
     * @param {string} cacheType - Type of cached data
     * @param {Function} fetchFn - Function to fetch data if not cached
     * @returns {Promise<any>} Retrieved data
     */
    static async getWithCache(userId, cacheType, fetchFn) {
        const cacheKey = CacheManager.generateKey(userId, cacheType);
        const cachedData = CacheManager.get(cacheKey);
        
        if (cachedData) {
            return cachedData;
        }

        const freshData = await fetchFn();
        CacheManager.set(cacheKey, freshData);
        return freshData;
    }

    /**
     * Refreshes cached data
     * @protected
     * @param {string} userId - User ID
     * @param {string} cacheType - Type of cached data
     * @param {Function} fetchFn - Function to fetch fresh data
     * @returns {Promise<any>} Fresh data
     */
    static async refreshCache(userId, cacheType, fetchFn) {
        const freshData = await fetchFn();
        const cacheKey = CacheManager.generateKey(userId, cacheType);
        CacheManager.set(cacheKey, freshData);
        return freshData;
    }

    /**
     * Creates a safe error response
     * @protected
     * @param {string} operation - Operation that failed
     * @param {Object} defaultValue - Default value to return
     * @returns {Object} Safe error response
     */
    static createErrorResponse(operation, defaultValue) {
        console.error(`Error ${operation}`);
        return defaultValue;
    }
}
