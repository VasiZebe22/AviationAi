import { collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { getCurrentUser, handleFirebaseError, db_operations } from '../utils/firebaseUtils';
import { getImageFromStorage } from '../firebase';

export const questionService = {
    // Get questions by category
    async getQuestionsByCategory(categoryCode, filters = {}) {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Initialize arrays to store filtered question IDs
            let incorrectlyAnsweredIds = [];
            let seenQuestionIds = []; // Track seen questions
            let flaggedQuestionIds = {
                green: [],
                yellow: [],
                red: []
            };

            // Get progress data for incorrectly answered and seen questions
            if (filters.incorrectlyAnswered || filters.unseenQuestions) {
                const progressSnapshot = await getDocs(
                    query(
                        db_operations.collections.progress(),
                        where('userId', '==', user.uid)
                    )
                );

                // Create a map to track the latest attempt for each question
                const latestAttempts = new Map();
                
                progressSnapshot.forEach(doc => {
                    const data = doc.data();
                    
                    // Track question IDs where isSeen is true
                    if (data.isSeen === true) {
                        seenQuestionIds.push(data.questionId);
                    }
                    
                    const existingAttempt = latestAttempts.get(data.questionId);
                    
                    if (!existingAttempt || data.lastAttempted.toDate() > existingAttempt.lastAttempted.toDate()) {
                        latestAttempts.set(data.questionId, data);
                    }
                });

                // Get IDs of questions that are still incorrect in their latest attempt
                incorrectlyAnsweredIds = Array.from(latestAttempts.values())
                    .filter(data => !data.isCorrect)
                    .map(data => data.questionId);
            }

            // Get flagged questions if any flag filter is applied
            if (filters.greenFlagged || filters.yellowFlagged || filters.redFlagged) {
                const flagsSnapshot = await getDocs(
                    query(
                        db_operations.collections.flags(),
                        where('userId', '==', user.uid)
                    )
                );

                flagsSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.flag === 'green' && filters.greenFlagged) {
                        flaggedQuestionIds.green.push(data.questionId);
                    } else if (data.flag === 'yellow' && filters.yellowFlagged) {
                        flaggedQuestionIds.yellow.push(data.questionId);
                    } else if (data.flag === 'red' && filters.redFlagged) {
                        flaggedQuestionIds.red.push(data.questionId);
                    }
                });
            }

            // Build base query
            let q;
            if (categoryCode === 'all') {
                q = query(db_operations.collections.questions());
            } else {
                q = db_operations.queries.byCategory(categoryCode);
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

            // Apply post-query filters
            
            // Filter unseen questions using the isSeen field from progress collection
            if (filters.unseenQuestions) {
                // Keep only questions that are not in the seenQuestionIds array
                questions = questions.filter(q => !seenQuestionIds.includes(q.id));
            }
            
            // Filter real exam questions (if field exists)
            if (filters.realExamOnly) {
                questions = questions.filter(q => q.is_real_exam === true);
            }
            
            // Filter by question types
            if (filters.questionTypes) {
                if (filters.questionTypes.withAnnexes) {
                    // Only show questions with question images (annexes)
                    questions = questions.filter(q => q.has_question_image === true);
                } else if (filters.questionTypes.withoutAnnexes) {
                    // Only show questions without question images (annexes)
                    questions = questions.filter(q => q.has_question_image !== true);
                }
                // If 'all' is selected, don't filter by annexes
            }

            // Filter by incorrectly answered if needed
            if (filters.incorrectlyAnswered && incorrectlyAnsweredIds.length > 0) {
                questions = questions.filter(q => incorrectlyAnsweredIds.includes(q.id));
            }

            // Filter by flags if any flag filter is applied
            if (filters.greenFlagged || filters.yellowFlagged || filters.redFlagged) {
                const allFlaggedIds = [
                    ...(filters.greenFlagged ? flaggedQuestionIds.green : []),
                    ...(filters.yellowFlagged ? flaggedQuestionIds.yellow : []),
                    ...(filters.redFlagged ? flaggedQuestionIds.red : [])
                ];
                
                if (allFlaggedIds.length > 0) {
                    questions = questions.filter(q => allFlaggedIds.includes(q.id));
                }
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
    },

    // Get a question by ID
    async getQuestionById(questionId) {
        try {
            const questionDoc = await getDoc(db_operations.docs.question(questionId));
            if (!questionDoc.exists()) {
                throw new Error('Question not found');
            }
            const data = {
                id: questionDoc.id,
                ...questionDoc.data()
            };

            // If question has an image, get its URL
            if (data.has_question_image) {
                try {
                    data.image_url = await getImageFromStorage(`figures/${questionId}_question_0.png`);
                } catch (error) {
                    console.error('Error fetching question image:', error);
                }
            }

            // If question has an explanation image, get its URL
            if (data.has_explanation_image) {
                try {
                    data.explanation_image_url = await getImageFromStorage(`figures/${questionId}_explanation_0.png`);
                } catch (error) {
                    console.error('Error fetching explanation image:', error);
                }
            }

            console.log('Question data from DB:', data);
            return data;
        } catch (error) {
            console.error('Error fetching question:', error);
            handleFirebaseError(error);
            throw error;
        }
    }
};
