/**
 * Transformer for skills analysis data
 * Why: Encapsulates the logic for calculating skill scores from progress data
 */
export class SkillsTransformer {
    static transform(progress) {
        console.log('SkillsTransformer - Input progress data:', progress);
        console.log('SkillsTransformer - Progress array length:', progress?.length || 0);
        
        if (!progress || !Array.isArray(progress)) {
            console.log('No progress data or invalid format'); // Debug log
            return { skillsBreakdown: [] };
        }

        // Group attempts by category
        const categoryStats = {};

        progress.forEach(item => {
            if (!item) {
                console.log('Skipping null/undefined progress item');
                return;
            }

            // Handle missing or malformed category data
            const categoryCode = item?.category?.code || 'UNKNOWN';
            const categoryName = item?.category?.name || 'Uncategorized';
            
            // Enhanced logging for debugging
            if (!item.category) {
                console.log('Item missing category - using default:', JSON.stringify(item, null, 2));
            } else if (!item.category.code || !item.category.name) {
                console.log('Incomplete category data:', JSON.stringify(item.category, null, 2));
            }

            // Validate item structure
            if (typeof item !== 'object') {
                console.log('Invalid item structure:', item);
                return;
            }
            if (!categoryStats[categoryCode]) {
                categoryStats[categoryCode] = {
                    name: categoryName, // Use the already safely extracted categoryName
                    code: categoryCode,
                    attempts: 0,
                    correctCount: 0,
                    totalTime: 0,
                    recentSuccess: 0,
                    lastAttempted: null
                };
            }

            const stats = categoryStats[categoryCode];
            
            console.log(`Processing category ${categoryCode}:`, item);
            
            // Update basic stats
            if (item.attemptHistory && item.attemptHistory.length > 0) {
                console.log(`Found ${item.attemptHistory.length} attempts for ${categoryCode}`);
                item.attemptHistory.forEach(attempt => {
                    stats.attempts++;
                    if (attempt.isCorrect) stats.correctCount++;
                    stats.totalTime += attempt.answerTime || 0;
                });
                console.log(`Category ${categoryCode} stats:`, {
                    attempts: stats.attempts,
                    correctCount: stats.correctCount,
                    totalTime: stats.totalTime
                });
            }

            // Track most recent attempt
            if (item.lastAttempted) {
                if (!stats.lastAttempted || new Date(item.lastAttempted) > new Date(stats.lastAttempted)) {
                    stats.lastAttempted = item.lastAttempted;
                }
            }

            // Track recent success from attempt history
            if (item.attemptHistory && item.attemptHistory.length > 0) {
                // Consider only the most recent attempts for consistency
                const recentAttempts = item.attemptHistory.slice(-5); // Last 5 attempts
                stats.recentSuccess = recentAttempts.filter(attempt => attempt.isCorrect).length;
                console.log(`Recent success for ${stats.name}: ${stats.recentSuccess}/${recentAttempts.length} attempts`);
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
            // Logarithmic scale for speed score - more forgiving for longer times
            // Base time of 60 seconds, with diminishing penalties
            const speedScore = Math.max(0, 100 * Math.exp(-Math.max(0, avgTime - 30) / 60)) * 0.15;
            
            console.log(`Speed calculation for ${stats.name}:`, {
                totalTime: stats.totalTime,
                attempts: stats.attempts,
                avgTime: avgTime.toFixed(2),
                score: speedScore.toFixed(2)
            });

            // Consistency component (30% weight)
            const consistencyScore = (stats.recentSuccess / Math.max(1, stats.attempts)) * 100 * 0.3;

            // Retention component (15% weight)
            // More gradual decay over time with a 45-day baseline
            const lastAttemptDate = stats.lastAttempted ?
                (stats.lastAttempted.seconds ? new Date(stats.lastAttempted.seconds * 1000) : new Date(stats.lastAttempted))
                : new Date();
            
            const daysSinceLastAttempt = (new Date() - lastAttemptDate) / (1000 * 60 * 60 * 24);
            
            // Logarithmic decay for retention score with a minimum score of 5%
            const retentionScore = Math.max(5, 100 * Math.exp(-daysSinceLastAttempt / 45)) * 0.15;
            
            console.log(`Retention calculation for ${stats.name}:`, {
                lastAttempted: lastAttemptDate.toISOString(),
                daysSince: daysSinceLastAttempt.toFixed(2),
                score: retentionScore.toFixed(2)
            });

            console.log(`Calculating components for ${stats.name}:`, {
                accuracy: `${accuracy.toFixed(2)}% (weighted: ${accuracyScore.toFixed(2)})`,
                speed: `${(avgTime).toFixed(2)}s (weighted: ${speedScore.toFixed(2)})`,
                consistency: `${((stats.recentSuccess / Math.max(1, stats.attempts)) * 100).toFixed(2)}% (weighted: ${consistencyScore.toFixed(2)})`,
                retention: `${daysSinceLastAttempt.toFixed(2)} days (weighted: ${retentionScore.toFixed(2)})`
            });

            // Total skill score
            const skillScore = accuracyScore + speedScore + consistencyScore + retentionScore;

            const result = {
                name: stats.name,
                code: stats.code,
                isDefault: stats.code === 'UNKNOWN',
                skillScore: Math.min(100, skillScore),
                attempts: stats.attempts,
                accuracy: accuracy,
                components: {
                    accuracy: accuracyScore,
                    speed: speedScore,
                    consistency: consistencyScore,
                    retention: retentionScore
                }
            };

            console.log(`Final skill score for ${stats.name}:`, result);
            return result;
        });

        const result = {
            skillsBreakdown: skillsBreakdown.sort((a, b) => {
                // Sort by default category status first (non-default categories come first)
                if (a.isDefault !== b.isDefault) {
                    return a.isDefault ? 1 : -1;
                }
                // Then sort by skill score
                return b.skillScore - a.skillScore;
            })
        };

        console.log('Final skills breakdown:', result); // Debug log
        return result;
    }
}
