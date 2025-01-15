import React from 'react';
import { Line } from 'react-chartjs-2';

const LearningOverviewChart = ({ progressData, selectedCategory }) => {
  return (
    <div className="lg:col-span-2 bg-surface-dark/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-300">Learning Overview</h3>
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
      <div className="h-[200px]">
        <Line
          data={{
            labels: progressData?.monthlyProgress.months.map(m => {
              const [year, month] = m.month.split('-');
              return new Date(year, month - 1).toLocaleString('default', { month: 'short' });
            }) || [],
            datasets: [
              {
                label: 'Correct Answers',
                data: progressData?.monthlyProgress.months.map(m => {
                  if (selectedCategory.value === 'all') {
                    return m.correct;
                  }
                  const categoryData = m.byCategory.find(c => c.code === selectedCategory.value);
                  return categoryData ? categoryData.correct : 0;
                }) || [],
                borderColor: '#10B981', // green
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Incorrect Answers',
                data: progressData?.monthlyProgress.months.map(m => {
                  if (selectedCategory.value === 'all') {
                    return m.incorrect;
                  }
                  const categoryData = m.byCategory.find(c => c.code === selectedCategory.value);
                  return categoryData ? categoryData.incorrect : 0;
                }) || [],
                borderColor: '#EF4444', // red
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4
              }
            ]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: '#9CA3AF'
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
                display: true,
                position: 'top',
                labels: {
                  color: '#9CA3AF',
                  usePointStyle: true,
                  padding: 20
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default LearningOverviewChart;
