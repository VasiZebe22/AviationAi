import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc, orderBy, deleteDoc, addDoc } from 'firebase/firestore';

// Shared Firebase utilities
export const getCurrentUser = () => {
    const user = auth.currentUser;
    return user ? {
        uid: user.uid,
        email: user.email,
        isAnonymous: user.isAnonymous,
        emailVerified: user.emailVerified
    } : null;
};

export const handleFirebaseError = (error, context) => {
    console.error(`Error in ${context}:`, {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
    });
    
    if (error.message?.includes('index')) {
        throw new Error('Database configuration in progress. Please try again in a few minutes.');
    }
    throw error;
};

// Common Firebase operations
export const db_operations = {
    // Collection references
    collections: {
        questions: () => collection(db, 'questions'),
        progress: () => collection(db, 'progress'),
        flags: () => collection(db, 'flags'),
        notes: () => collection(db, 'notes'),
        savedTests: () => collection(db, 'saved_tests'),
        testResults: () => collection(db, 'testResults')
    },

    // Document references
    docs: {
        question: (id) => doc(db, 'questions', id),
        progress: (userId, questionId) => doc(db, 'progress', `${userId}_${questionId}`),
        flag: (userId, questionId) => doc(db, 'flags', `${userId}_${questionId}`),
        note: (userId, questionId) => doc(db, 'notes', `${userId}_${questionId}`),
        savedTest: (id) => doc(db, 'saved_tests', id),
        testResult: (id) => doc(db, 'testResults', id)
    },

    // Common queries
    queries: {
        byUserId: (collectionRef, userId) => 
            query(collectionRef, where('userId', '==', userId)),
            
        byCategory: (categoryCode) => 
            query(
                collection(db, 'questions'),
                where('category.code', '==', categoryCode)
            ),

        byDateRange: (collectionRef, userId, dateField, startDate) =>
            query(
                collectionRef,
                where('userId', '==', userId),
                where(dateField, '>=', startDate),
                orderBy(dateField, 'desc')
            )
    }
};

// Date utilities
export const dateUtils = {
    getDaysAgo: (days) => {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date;
    },

    getMonthsAgo: (months) => {
        const date = new Date();
        date.setMonth(date.getMonth() - months);
        return date;
    }
};
