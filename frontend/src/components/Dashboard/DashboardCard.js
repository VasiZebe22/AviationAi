import React from 'react';
import { motion } from 'framer-motion';
import questionService from '../../services/questionService';

const DashboardCard = ({ title, children, className = '', dashboard = null }) => {
  const handleResetStudyTime = async () => {
    if (!dashboard) return;
    const { showToast, setIsLoading, setProgressData } = dashboard;

    if (window.confirm('Are you sure you want to reset your study time stats? This cannot be undone.')) {
      try {
        setIsLoading(true);
        await questionService.resetStudyTime();
        showToast('success', 'Study time stats have been reset');
        // Refresh all dashboard data to ensure consistency
        const stats = await questionService.getDashboardStats();
        setProgressData(prev => ({
          ...prev,
          studyTime: stats.studyTime
        }));
      } catch (error) {
        showToast('error', 'Failed to reset study time stats');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResetAllProgress = async () => {
    if (!dashboard) return;
    const { showToast, setIsLoading, setProgressData } = dashboard;

    if (window.confirm('Are you sure you want to reset all progress? This action cannot be undone and will delete all your progress data.')) {
      try {
        setIsLoading(true);
        await questionService.resetAllProgress();
        showToast('success', 'All progress has been reset');
        
        // Refresh all dashboard data
        const stats = await questionService.getDashboardStats();
        setProgressData({
          monthlyProgress: stats.monthlyProgress,
          performance: {
            correct: stats.correctAnswers,
            incorrect: stats.incorrectAnswers
          },
          categoryProgress: Object.entries(stats.byCategory).map(([code, data]) => ({
            code,
            name: data.name,
            total: data.total,
            correct: data.correct,
            percentage: Math.round((data.correct / data.total) * 100) || 0
          })),
          skillsBreakdown: Object.entries(stats.byCategory)
            .filter(([_, data]) => data.skillScore !== undefined)
            .map(([code, data]) => ({
              code,
              name: data.name,
              skillScore: data.skillScore || 0
            })),
          byCategory: stats.byCategory,
          studyTime: stats.studyTime
        });
      } catch (error) {
        showToast('error', 'Failed to reset progress');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <motion.div
      className={`bg-surface-dark rounded-lg shadow-lg backdrop-blur-sm bg-opacity-90 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border-b border-dark-lightest px-5 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium tracking-wide text-gray-300 uppercase">{title}</h2>
          {title === "Learning Progress" && dashboard && (
            <div className="relative group">
              <button className="p-1 text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
              <div className="absolute hidden group-hover:block right-0 mt-2 w-48 bg-dark-lighter rounded-lg shadow-lg border border-gray-700 z-50">
                <div className="py-1">
                  <button
                    onClick={handleResetStudyTime}
                    className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-dark-lightest hover:text-white text-left"
                  >
                    Reset Study Time Stats
                  </button>
                  <button
                    onClick={handleResetAllProgress}
                    className="w-full px-4 py-2 text-sm text-red-400 hover:bg-dark-lightest hover:text-red-300 text-left"
                  >
                    Reset All Progress
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </motion.div>
  );
};

export default DashboardCard;
