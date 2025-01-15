import React from 'react';
import { Radar } from 'react-chartjs-2';

const SkillsAnalysisChart = ({ progressData }) => {
  return (
    <div className="bg-surface-dark/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-300">Skills Analysis</h3>
        <div className="group relative">
          <div className="text-xs text-gray-400 cursor-help">Based on multiple factors</div>
          <div className="absolute hidden group-hover:block w-64 p-4 mt-2 right-0 bg-dark-lighter rounded-lg shadow-lg border border-gray-700 z-10">
            <div className="text-xs space-y-2">
              <div className="font-medium text-gray-300 mb-2">Skill Score Components:</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-400">Accuracy (40%): Basic correct rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-400">Consistency (30%): Recent improvements</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-400">Speed (15%): Answer time progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-400">Retention (15%): Long-term memory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[200px]">
        <Radar
          data={{
            labels: progressData?.skillsBreakdown.map(skill => skill.name) || [],
            datasets: [{
              label: 'Skill Level',
              data: progressData?.skillsBreakdown.map(skill => skill.skillScore) || [],
              backgroundColor: 'rgba(16, 185, 129, 0.2)', // green
              borderColor: '#10B981',
              pointBackgroundColor: '#10B981',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#10B981',
              borderWidth: 2
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                angleLines: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                pointLabels: {
                  color: '#9CA3AF'
                },
                ticks: {
                  display: false
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

export default SkillsAnalysisChart;
