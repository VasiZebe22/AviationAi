import { collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { getCurrentUser, handleFirebaseError, db_operations } from '../utils/firebaseUtils';

const questionService = {
    // Get questions by category
    async getQuestionsByCategory(categoryCode, filters = {}) {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            // First get wrong answers from progress collection if filter is applied
            let questionIds = [];
            if (filters.incorrectlyAnswered) {
                const progressSnapshot = await getDocs(
                    query(
                        db_operations.collections.progress(),
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
                q = query(db_operations.collections.questions());
            } else {
                q = db_operations.queries.byCategory(categoryCode);
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

            return questions;
        } catch (error) {
            handleFirebaseError(error, 'fetching questions');
        }
    },

    // Get questions by subcategory
    async getQuestionsBySubcategory(subcategoryCode) {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const q = query(
                db_operations.collections.questions(),
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

            return questions;
        } catch (error) {
            handleFirebaseError(error, 'fetching questions by subcategory');
        }
    },

    // Get a single question
    async getQuestion(questionId) {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const questionDoc = await getDoc(db_operations.docs.question(questionId));
            if (!questionDoc.exists()) {
                throw new Error(`Question ${questionId} not found`);
            }
            return { id: questionDoc.id, ...questionDoc.data() };
        } catch (error) {
            handleFirebaseError(error, 'fetching question');
        }
    }
};

export default questionService;