import React from 'react';
import { Radar } from 'react-chartjs-2';
import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';

/**
 * Visualizes user's skill proficiency across different aviation categories
 * Why a Radar Chart:
 * - Effectively shows relative strengths and weaknesses across multiple dimensions
 * - Allows quick identification of areas needing improvement
 * - Provides intuitive visual representation of overall skill balance
 */
const SkillsAnalysisChart = ({ progressData, isLoading }) => {
  // Show loading state during data fetch or when data is not yet available
  // This ensures consistent UX with other dashboard charts and prevents flash of empty content
  if (isLoading || !progressData?.skillsBreakdown) {
    return (
      <div className="bg-surface-dark/30 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-300">Skills Analysis</h3>
          <div className="text-xs text-gray-400 cursor-help">Based on multiple factors</div>
        </div>
        <div className="h-[200px] flex flex-col items-center justify-center space-y-4">
          <LoadingSpinner />
          <p className="text-sm text-gray-400 animate-pulse">Analyzing your skill metrics...</p>
        </div>
      </div>
    );
  }

  // Process and format category names for better readability
  // Why: Long category names can make the chart cluttered and hard to read
  const skillData = progressData.skillsBreakdown
    .filter(skill => skill.skillScore > 0) // Only show categories where user has demonstrated some proficiency
    .map(skill => ({
      ...skill,
      displayName: skill.name
        .split(',')[0] // Take only the first part if there's a comma for conciseness
        .replace('Flight Planning Monitoring', 'Flight Planning')
        .replace('Airframe, Systems, Electrics, Power', 'Aircraft Systems')
        .replace('Radio Navigation', 'Radio Nav')
    }));

  const hasData = skillData.length > 0;

  return (
    <div className="bg-surface-dark/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-300">Skills Analysis</h3>
        <div className="group relative">
          {/* Tooltip to explain skill score calculation methodology */}
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
      <div className="h-[200px] flex items-center justify-center">
        {!hasData ? (
          // Show a helpful message when user hasn't completed enough questions
          // This guides users on how to start seeing their skill analysis
          <div className="text-center">
            <p className="text-sm text-gray-400">No skill data available yet.</p>
            <p className="text-xs mt-1 text-gray-500">Complete more questions to see your skill analysis.</p>
          </div>
        ) : (
          <Radar
            data={{
              labels: skillData.map(skill => skill.displayName),
              datasets: [{
                label: 'Skill Level',
                data: skillData.map(skill => Math.round(skill.skillScore)),
                backgroundColor: 'rgba(16, 185, 129, 0.2)', // Light green for area fill
                borderColor: '#10B981', // Solid green for border
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
                  // Use subtle grid lines to maintain readability while not overwhelming the visualization
                  angleLines: {
                    color: 'rgba(255, 255, 255, 0.1)'
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                  },
                  pointLabels: {
                    color: '#9CA3AF',
                    font: {
                      size: 11
                    },
                    // Break long labels into multiple lines for better readability
                    callback: function(value) {
                      const maxLength = 15;
                      if (value.length <= maxLength) return value;
                      
                      const words = value.split(' ');
                      let lines = [''];
                      let lineIndex = 0;
                      
                      words.forEach(word => {
                        if ((lines[lineIndex] + ' ' + word).length <= maxLength) {
                          lines[lineIndex] += (lines[lineIndex] ? ' ' : '') + word;
                        } else {
                          lineIndex++;
                          lines[lineIndex] = word;
                        }
                      });
                      
                      return lines;
                    }
                  },
                  ticks: {
                    color: '#9CA3AF',
                    backdropColor: 'transparent',
                    stepSize: 20
                  },
                  suggestedMin: 0,
                  suggestedMax: 100
                }
              },
              plugins: {
                legend: {
                  display: false // Hide legend as it's redundant for a single dataset
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SkillsAnalysisChart;
