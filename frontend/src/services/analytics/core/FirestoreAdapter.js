import { collection, query, where, getDocs, orderBy, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { getCurrentUser, handleFirebaseError, db_operations, dateUtils } from '../../../services/utils/firebaseUtils';

/**
 * Abstracts Firestore operations for analytics data
 * Why: Separates database concerns from business logic and provides a consistent
 * interface for data access with proper error handling
 */
export class FirestoreAdapter {
    /**
     * Fetches user's question progress data
     * @param {string} userId - User ID to fetch progress for
     * @returns {Promise<Array>} Array of progress documents
     */
    static async getUserProgress(userId) {
        try {
            const progressRef = db_operations.collections.progress();
            const q = query(
                progressRef,
                where('userId', '==', userId)
            );
            console.log('Fetching progress for user:', userId);
            const snapshot = await getDocs(q);
            console.log('Progress documents found:', snapshot.size);
            
            const progressData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log('Progress data sample:', progressData.slice(0, 2));
            return progressData;
        } catch (error) {
            handleFirebaseError(error, 'fetching user progress');
            throw error;
        }
    }

    /**
     * Fetches all available questions
     * @returns {Promise<Array>} Array of question documents
     */
    static async getAllQuestions() {
        try {
            const snapshot = await getDocs(db_operations.collections.questions());
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            handleFirebaseError(error, 'fetching questions');
            throw error;
        }
    }

    /**
     * Fetches recent progress data within a time range
     * @param {string} userId - User ID to fetch progress for
     * @param {Date} startDate - Start date for the range
     * @returns {Promise<Array>} Array of progress documents
     */
    static async getRecentProgress(userId, startDate) {
        try {
            const progressRef = db_operations.collections.progress();
            const q = query(
                progressRef,
                where('userId', '==', userId),
                where('lastAttempted', '>=', startDate),
                orderBy('lastAttempted', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            handleFirebaseError(error, 'fetching recent progress');
            throw error;
        }
    }

    /**
     * Updates study time for multiple progress records
     * @param {string} userId - User ID
     * @param {Array<{id: string, answerTime: number}>} updates - Array of updates
     * @returns {Promise<void>}
     */
    static async batchUpdateStudyTime(userId, updates) {
        try {
            const batch = writeBatch(db);
            const progressRef = db_operations.collections.progress();

            updates.forEach(({ id, answerTime }) => {
                const docRef = doc(progressRef, id);
                batch.update(docRef, { answerTime });
            });

            await batch.commit();
        } catch (error) {
            handleFirebaseError(error, 'updating study time');
            throw error;
        }
    }
}
