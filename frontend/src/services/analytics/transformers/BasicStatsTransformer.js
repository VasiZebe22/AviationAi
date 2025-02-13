/**
 * Transforms raw Firestore data into basic statistics
 * Why: Separates data transformation logic from data fetching and presentation
 * making the code more maintainable and testable
 */
export class BasicStatsTransformer {
    /**
     * Transforms questions and progress data into basic statistics
     * @param {Array} questions - Array of question documents
     * @param {Array} progressData - Array of progress documents
     * @returns {Object} Transformed statistics
     */
    static transform(questions, progressData) {
        const stats = this.initializeStats();
        
        // Process questions first
        questions.forEach(question => {
            const categoryCode = question.category?.code;
            if (categoryCode) {
                this.initializeCategory(stats, categoryCode, question.category.name);
                stats.byCategory[categoryCode].total++;
                stats.totalQuestions++;
            }
        });

        // Process progress data
        const latestAttempts = this.getLatestAttempts(progressData);
        this.processAttempts(stats, latestAttempts, questions);

        return stats;
    }

    /**
     * Initialize stats object with default values
     * @private
     */
    static initializeStats() {
        return {
            totalQuestions: 0,
            totalAttempted: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            byCategory: {}
        };
    }

    /**
     * Initialize category in stats if not exists
     * @private
     */
    static initializeCategory(stats, categoryCode, categoryName) {
        if (!stats.byCategory[categoryCode]) {
            stats.byCategory[categoryCode] = {
                name: categoryName,
                total: 0,
                attempted: 0,
                correct: 0
            };
        }
    }

    /**
     * Get map of latest attempts per question
     * @private
     */
    static getLatestAttempts(progressData) {
        const latestAttempts = new Map();
        progressData.forEach(data => {
            const existingAttempt = latestAttempts.get(data.questionId);
            if (!existingAttempt || data.lastAttempted.toDate() > existingAttempt.lastAttempted.toDate()) {
                latestAttempts.set(data.questionId, data);
            }
        });
        return latestAttempts;
    }

    /**
     * Process attempts and update stats
     * @private
     */
    static processAttempts(stats, latestAttempts, questions) {
        latestAttempts.forEach(attempt => {
            const question = questions.find(q => q.id === attempt.questionId);
            if (!question) return;

            const categoryCode = question.category?.code;
            if (!categoryCode || !stats.byCategory[categoryCode]) return;

            stats.totalAttempted++;
            stats.byCategory[categoryCode].attempted++;
            
            if (attempt.isCorrect) {
                stats.correctAnswers++;
                stats.byCategory[categoryCode].correct++;
            } else {
                stats.incorrectAnswers++;
            }
        });
    }
}
