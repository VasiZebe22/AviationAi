/**
 * Transformer for skills analysis data
 * Why: Encapsulates the logic for calculating skill scores from progress data
 */
export class SkillsTransformer {
    static transform(progress) {
        console.log('Input progress data:', progress); // Debug log
        
        if (!progress || !Array.isArray(progress)) {
            console.log('No progress data or invalid format'); // Debug log
            return { skillsBreakdown: [] };
        }

        // Group attempts by category
        const categoryStats = {};

        progress.forEach(item => {
            if (!item.category) {
                console.log('Item missing category:', item); // Debug log
                return;
            }
            
            const categoryCode = item.category.code;
            if (!categoryStats[categoryCode]) {
                categoryStats[categoryCode] = {
                    name: item.category.name,
                    code: categoryCode,
                    attempts: 0,
                    correctCount: 0,
                    totalTime: 0,
                    recentSuccess: 0,
                    lastAttempted: null
                };
            }

            const stats = categoryStats[categoryCode];
            
            // Update basic stats
            if (item.attemptHistory && item.attemptHistory.length > 0) {
                item.attemptHistory.forEach(attempt => {
                    stats.attempts++;
                    if (attempt.isCorrect) stats.correctCount++;
                    stats.totalTime += attempt.answerTime || 0;
                });
            }

            // Track most recent attempt
            if (item.lastAttempted) {
                if (!stats.lastAttempted || new Date(item.lastAttempted) > new Date(stats.lastAttempted)) {
                    stats.lastAttempted = item.lastAttempted;
                }
            }

            // Track recent success
            if (item.isCorrect) {
                stats.recentSuccess++;
            }
        });

        console.log('Category stats:', categoryStats); // Debug log

        // Calculate skill scores
        const skillsBreakdown = Object.values(categoryStats).map(stats => {
            // Accuracy component (40% weight)
            const accuracy = stats.attempts > 0 ? (stats.correctCount / stats.attempts) * 100 : 0;
            const accuracyScore = accuracy * 0.4;

            // Speed component (15% weight)
            const avgTime = stats.attempts > 0 ? stats.totalTime / stats.attempts : 0;
            const speedScore = Math.max(0, 100 - (avgTime / 30) * 100) * 0.15; // Assuming 30 seconds is baseline

            // Consistency component (30% weight)
            const consistencyScore = (stats.recentSuccess / Math.max(1, stats.attempts)) * 100 * 0.3;

            // Retention component (15% weight)
            const lastAttemptDate = stats.lastAttempted ? new Date(stats.lastAttempted) : null;
            const daysSinceLastAttempt = lastAttemptDate ? 
                (new Date() - lastAttemptDate) / (1000 * 60 * 60 * 24) : 30;
            const retentionScore = Math.max(0, 100 - (daysSinceLastAttempt / 30) * 100) * 0.15;

            // Total skill score
            const skillScore = accuracyScore + speedScore + consistencyScore + retentionScore;

            const result = {
                name: stats.name,
                code: stats.code,
                skillScore: Math.min(100, skillScore),
                attempts: stats.attempts,
                accuracy: accuracy
            };

            console.log(`Skill score for ${stats.name}:`, result); // Debug log
            return result;
        });

        const result = {
            skillsBreakdown: skillsBreakdown.sort((a, b) => b.skillScore - a.skillScore)
        };

        console.log('Final skills breakdown:', result); // Debug log
        return result;
    }
}
