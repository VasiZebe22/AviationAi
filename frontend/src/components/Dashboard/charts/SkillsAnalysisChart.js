import React from 'react';
import { Radar } from 'react-chartjs-2';

const SkillsAnalysisChart = ({ progressData }) => {
  // Filter out categories with 0 skill score and format their names
  const skillData = progressData?.skillsBreakdown
    ?.filter(skill => skill.skillScore > 0)
    ?.map(skill => ({
      ...skill,
      // Format long category names to fit better
      displayName: skill.name
        .split(',')[0] // Take only the first part if there's a comma
        .replace('Flight Planning Monitoring', 'Flight Planning')
        .replace('Airframe, Systems, Electrics, Power', 'Aircraft Systems')
        .replace('Radio Navigation', 'Radio Nav')
    })) || [];

  const hasData = skillData.length > 0;

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
      <div className="h-[200px] flex items-center justify-center">
        {!hasData ? (
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
                    color: '#9CA3AF',
                    font: {
                      size: 11
                    },
                    callback: function(value) {
                      // Break long labels into multiple lines
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
                    display: false,
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    stepSize: 20
                  },
                  suggestedMin: 0,
                  suggestedMax: 100
                }
              },
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  backgroundColor: 'rgba(17, 24, 39, 0.9)',
                  titleFont: {
                    size: 12
                  },
                  bodyFont: {
                    size: 11
                  },
                  padding: 8,
                  callbacks: {
                    label: function(context) {
                      return `Skill Level: ${Math.round(context.raw)}%`;
                    }
                  }
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
