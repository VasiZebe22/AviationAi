import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    setDoc,
    query, 
    where, 
    orderBy 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../services/firebase';
import { getCurrentUser, handleFirebaseError, db_operations } from '../utils/firebaseUtils';

export const testService = {
    // Save current test state
    async saveTestState(testData) {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Get total questions for this category/subcategories combination
            let totalQuestions = 0;
            const questionsSnapshot = await getDocs(
                query(
                    db_operations.collections.questions(),
                    where('category.code', '==', testData.categoryId)
                )
            );

            // If subcategories are selected, filter questions
            if (testData.selectedSubcategories?.length > 0) {
                const questions = questionsSnapshot.docs.map(doc => doc.data());
                totalQuestions = questions.filter(question => 
                    question.subcategories && 
                    question.subcategories.some(sub => 
                        testData.selectedSubcategories.includes(sub.code)
                    )
                ).length;
            } else {
                totalQuestions = questionsSnapshot.size;
            }

            // Use existing ID or create new reference
            const savedTestRef = testData.savedTestId ? 
                db_operations.docs.savedTest(testData.savedTestId) : 
                doc(db_operations.collections.savedTests());

            // Ensure answeredQuestions is an object
            const answeredQuestions = typeof testData.answeredQuestions === 'object' ? 
                testData.answeredQuestions : {};

            await setDoc(savedTestRef, {
                userId: user.uid,
                categoryId: testData.categoryId,
                currentQuestion: testData.currentQuestion,
                timer: testData.timer,
                answeredQuestions: answeredQuestions,
                filters: testData.filters || {},
                selectedSubcategories: testData.selectedSubcategories || [],
                savedAt: new Date(),
                totalQuestions: totalQuestions,
                mode: testData.mode || 'study'
            }, { merge: true });

            return savedTestRef.id;
        } catch (error) {
            const handledError = handleFirebaseError(error, 'saving test state');
            throw handledError;
        }
    },

    // Get saved test state
    async getSavedTest(testId) {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const testDoc = await getDoc(db_operations.docs.savedTest(testId));
            if (!testDoc.exists()) {
                throw new Error('Saved test not found');
            }

            const testData = testDoc.data();
            if (testData.userId !== user.uid) {
                throw new Error('Unauthorized access to saved test');
            }

            return testData;
        } catch (error) {
            const handledError = handleFirebaseError(error, 'loading test state');
            throw handledError;
        }
    },

    // Get all saved tests for current user
    async getSavedTests() {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const savedTestsSnapshot = await getDocs(
                query(
                    db_operations.collections.savedTests(),
                    where('userId', '==', user.uid),
                    orderBy('savedAt', 'desc')
                )
            );

            const tests = savedTestsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Group tests by categoryId and keep only the most recent one
            const groupedTests = tests.reduce((acc, test) => {
                if (!acc[test.categoryId] || 
                    acc[test.categoryId].savedAt.toDate() < test.savedAt.toDate()) {
                    acc[test.categoryId] = test;
                }
                return acc;
            }, {});

            // Convert back to array and sort by date
            const sortedTests = Object.values(groupedTests)
                .sort((a, b) => b.savedAt.toDate() - a.savedAt.toDate());

            return sortedTests;
        } catch (error) {
            const handledError = handleFirebaseError(error, 'fetching saved tests');
            throw handledError;
        }
    },

    // Delete a saved test
    async deleteSavedTest(testId) {
        try {
            const { currentUser } = getAuth();
            if (!currentUser) {
                throw new Error('No user logged in');
            }

            // Get the test document reference and verify ownership
            const testRef = doc(db, 'saved_tests', testId);
            const testDoc = await getDoc(testRef);
            
            if (!testDoc.exists()) {
                throw new Error('Test not found');
            }
            
            // Verify the test belongs to the current user
            if (testDoc.data().userId !== currentUser.uid) {
                throw new Error('Unauthorized access to saved test');
            }

            await deleteDoc(testRef);
            return true;
        } catch (error) {
            console.error('Error deleting saved test:', error);
            // Return false instead of throwing to handle the error gracefully
            return false;
        }
    },

    // Save test results
    async saveTestResults(testData) {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const testResult = {
                userId: user.uid,
                categoryId: testData.categoryId,
                score: testData.score,
                totalQuestions: testData.total,
                timeTaken: testData.time,
                completedAt: new Date(),
                percentage: Math.round((testData.score / testData.total) * 100),
                isPassing: Math.round((testData.score / testData.total) * 100) >= 75,
                questionResults: testData.questionResults.map(({ questionId, isCorrect, userAnswer }) => ({
                    questionId,
                    isCorrect,
                    userAnswer
                })),
                selectedSubcategories: testData.selectedSubcategories || [],
                filters: testData.filters || {}
            };

            const docRef = await addDoc(db_operations.collections.testResults(), testResult);
            return { id: docRef.id, ...testResult };
        } catch (error) {
            const handledError = handleFirebaseError(error, 'saving test results');
            throw handledError;
        }
    },

    // Get user's test history
    async getTestHistory() {
        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const querySnapshot = await getDocs(
                query(
                    db_operations.collections.testResults(),
                    where('userId', '==', user.uid),
                    orderBy('completedAt', 'desc')
                )
            );

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            const handledError = handleFirebaseError(error, 'fetching test history');
            throw handledError;
        }
    }
};
