import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuestionsToReview = ({ progressData }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-surface-dark/30 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Questions to Review</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-red-500">
            {progressData?.performance.incorrect || 0}
          </span>
          <span className="text-sm text-gray-400">Questions</span>
        </div>
        <button
          onClick={() => {
            navigate('/questions/all', { 
              state: { 
                mode: 'practice',
                filters: { 
                  incorrectlyAnswered: true
                },
                title: 'Practice Wrong Answers'
              } 
            });
          }}
          className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors duration-200 flex items-center justify-between"
        >
          <span>Practice Wrong Answers</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
        <div className="text-xs text-gray-500">
          Focus on these questions to improve your performance
        </div>
      </div>
    </div>
  );
};

export default QuestionsToReview;
