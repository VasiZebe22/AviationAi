import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const PerformanceChart = ({ progressData, selectedCategory }) => {
  return (
    <div className="bg-surface-dark/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-300">Average Performance</h3>
        <select
          className="bg-dark text-gray-300 text-sm rounded px-3 py-1 border border-gray-700 w-36"
          onChange={(e) => selectedCategory.setter(e.target.value)}
          value={selectedCategory.value}
        >
          <option value="all">All Categories</option>
          {progressData?.monthlyProgress.categories.map(cat => (
            <option key={cat.code} value={cat.code}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="h-[200px] flex items-center justify-center">
        <Doughnut
          data={{
            labels: ['Correct', 'Incorrect'],
            datasets: [{
              data: [
                selectedCategory.value === 'all' 
                  ? progressData?.performance.correct || 0
                  : progressData?.byCategory[selectedCategory.value]?.correct || 0,
                selectedCategory.value === 'all'
                  ? progressData?.performance.incorrect || 0
                  : (progressData?.byCategory[selectedCategory.value]?.total || 0) - (progressData?.byCategory[selectedCategory.value]?.correct || 0)
              ],
              backgroundColor: [
                '#8B5CF6',
                'rgba(139, 92, 246, 0.1)'
              ],
              borderWidth: 0
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
              legend: {
                display: false
              }
            }
          }}
        />
        <div className="absolute text-2xl font-bold text-white">
          {progressData ? 
            selectedCategory.value === 'all' 
              ? Math.round((progressData.performance.correct / (progressData.performance.correct + progressData.performance.incorrect)) * 100)
              : Math.round((progressData.byCategory[selectedCategory.value]?.correct || 0) / (progressData.byCategory[selectedCategory.value]?.total || 1) * 100)
          : 0}%
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
