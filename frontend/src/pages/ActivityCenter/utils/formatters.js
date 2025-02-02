import { categories } from '../../Categories/Categories.js';

// Calculate and format the success rate as a percentage
export const formatSuccessRate = (score, total) => {
    if (!total) return '0%';
    return Math.round((score / total) * 100) + '%';
};

// Get relative time for both saved and finished tests
export const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    // Handle both Firestore Timestamp and regular Date objects
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
};

// Calculate progress percentage
export const getProgress = (test) => {
    if (!test.answeredQuestions || typeof test.answeredQuestions !== 'object') {
        return '0%';
    }
    const answeredCount = Object.keys(test.answeredQuestions).length;
    const total = test.totalQuestions || Object.keys(test.answeredQuestions).length;
    return `${Math.round((answeredCount / total) * 100)}%`;
};

// Get answered questions count
export const getAnsweredCount = (test) => {
    if (!test.answeredQuestions || typeof test.answeredQuestions !== 'object') {
        return 0;
    }
    return Object.keys(test.answeredQuestions).length;
};

// Determine if a test result is a pass or fail (75% is passing threshold)
export const getTestStatus = (score, total) => {
    if (!total) return 'FAIL';
    return (score / total) >= 0.75 ? 'PASS' : 'FAIL';
};