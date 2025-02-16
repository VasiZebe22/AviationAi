import React from 'react';
import { Bar } from 'react-chartjs-2';
import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';

const StudyTimeChart = ({ progressData, isLoading }) => {
  console.log('StudyTimeChart progressData:', progressData);
  console.log('StudyTimeChart studyTime:', progressData?.studyTime);

  // Show loading state during initial load or refresh
  if (isLoading || !progressData?.studyTime) {
    return (
      <div className="bg-surface-dark/30 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-300">Daily Study Time</h3>
        </div>
        <div className="h-[200px] flex flex-col items-center justify-center space-y-4">
          <LoadingSpinner />
          <p className="text-sm text-gray-400 animate-pulse">Calculating study time metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-dark/30 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Daily Study Time</h3>
      <div className="h-[200px]">
        <Bar
          data={{
            labels: progressData?.studyTime?.labels || [],
            datasets: [{
              label: 'Minutes',
              data: progressData?.studyTime?.data || [],
              backgroundColor: '#8B5CF6'
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                min: 0,
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: '#9CA3AF',
                  stepSize: 1,
                  precision: 0,
                  callback: function(value) {
                    return value + ' min';
                  }
                }
              },
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: '#9CA3AF'
                }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default StudyTimeChart;
