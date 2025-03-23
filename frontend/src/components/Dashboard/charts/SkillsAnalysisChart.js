import React, { useRef, useEffect } from 'react';
import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';

/**
 * Visualizes user's skill proficiency across the 5 key performance indicators
 * Using a pentagon-shaped chart to clearly display:
 * - Accuracy
 * - Consistency
 * - Speed
 * - Retention
 * - Application
 */
const SkillsAnalysisChart = ({ progressData, selectedCategory, isLoading }) => {
  const canvasRef = useRef(null);
  
  // Filter skills data based on selected category
  const getFilteredSkillData = () => {
    if (!progressData?.skillsBreakdown) return null;
    
    // If "all" is selected, compute the average of all categories
    if (selectedCategory.value === 'all') {
      // Calculate average components across all skills
      const allSkills = progressData.skillsBreakdown.filter(skill => skill.skillScore > 0);
      
      if (allSkills.length === 0) return null;
      
      const totalComponents = allSkills.reduce((acc, skill) => {
        return {
          accuracy: acc.accuracy + skill.components.accuracy,
          consistency: acc.consistency + skill.components.consistency,
          speed: acc.speed + skill.components.speed,
          retention: acc.retention + skill.components.retention,
          application: acc.application + (skill.components.application || 0)
        };
      }, { accuracy: 0, consistency: 0, speed: 0, retention: 0, application: 0 });
      
      return {
        accuracy: totalComponents.accuracy / allSkills.length,
        consistency: totalComponents.consistency / allSkills.length,
        speed: totalComponents.speed / allSkills.length,
        retention: totalComponents.retention / allSkills.length,
        application: totalComponents.application / allSkills.length
      };
    } else {
      // Find the specific category
      const categorySkill = progressData.skillsBreakdown.find(
        skill => skill.code === selectedCategory.value
      );
      
      return categorySkill ? categorySkill.components : null;
    }
  };

  const skillData = getFilteredSkillData();
  const hasData = skillData !== null;

  // Draw the pentagon chart
  useEffect(() => {
    if (!canvasRef.current || !hasData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2 + 10; // Move center point down to give more space for top label
    const maxRadius = Math.min(width, height) * 0.35; // Increased from 0.25 to 0.35 for larger pentagon

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate normalized values (0-1) for each component
    const normalizedValues = {
      accuracy: skillData.accuracy / 35, // 35% weight
      consistency: skillData.consistency / 25, // 25% weight
      speed: skillData.speed / 15, // 15% weight
      retention: skillData.retention / 15, // 15% weight
      application: (skillData.application || 0) / 10 // 10% weight
    };

    // Calculate points for a regular pentagon
    const points = [];
    const sides = 5; // Pentagon has 5 sides
    
    for (let i = 0; i < sides; i++) {
      // Start from the top (accuracy) and go clockwise
      const angle = (Math.PI * 2 * i / sides) - (Math.PI / 2);
      const x = centerX + maxRadius * Math.cos(angle);
      const y = centerY + maxRadius * Math.sin(angle);
      
      let name;
      let normalizedValue;
      
      // Assign names and values to each point based on position
      switch (i) {
        case 0: // Top
          name = 'Accuracy';
          normalizedValue = normalizedValues.accuracy;
          break;
        case 1: // Top right
          name = 'Consistency';
          normalizedValue = normalizedValues.consistency;
          break;
        case 2: // Bottom right
          name = 'Speed';
          normalizedValue = normalizedValues.speed;
          break;
        case 3: // Bottom left
          name = 'Application';
          normalizedValue = normalizedValues.application;
          break;
        case 4: // Top left
          name = 'Retention';
          normalizedValue = normalizedValues.retention;
          break;
        default:
          name = '';
          normalizedValue = 0;
      }
      
      points.push({ name, x, y, normalizedValue });
    }

    // Draw the background pentagon
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw grid lines
    const gridLevels = 5; // Number of grid levels
    for (let i = 1; i <= gridLevels; i++) {
      const factor = i / gridLevels;
      ctx.beginPath();
      
      // Calculate points for this grid level
      const gridPoints = points.map(point => {
        const dx = point.x - centerX;
        const dy = point.y - centerY;
        return {
          x: centerX + dx * factor,
          y: centerY + dy * factor
        };
      });
      
      // Draw the pentagon for this grid level
      ctx.moveTo(gridPoints[0].x, gridPoints[0].y);
      for (let j = 1; j < gridPoints.length; j++) {
        ctx.lineTo(gridPoints[j].x, gridPoints[j].y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();
    }

    // Calculate the actual data points based on normalized values
    const dataPoints = points.map(point => {
      const dx = point.x - centerX;
      const dy = point.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const normalizedDistance = distance * point.normalizedValue;
      const ratio = normalizedDistance / distance;
      
      return {
        name: point.name,
        x: centerX + dx * ratio,
        y: centerY + dy * ratio,
        value: point.normalizedValue
      };
    });

    // Draw the data polygon
    ctx.beginPath();
    ctx.moveTo(dataPoints[0].x, dataPoints[0].y);
    dataPoints.forEach((point, index) => {
      const nextIndex = (index + 1) % dataPoints.length;
      ctx.lineTo(dataPoints[nextIndex].x, dataPoints[nextIndex].y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)'; // Light green fill
    ctx.fill();
    ctx.strokeStyle = '#10B981'; // Green border
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points
    dataPoints.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2); // Increased point size from 4 to 5
      ctx.fillStyle = '#10B981';
      ctx.fill();
    });

    // Draw axis labels
    ctx.font = '11px sans-serif'; // Increased font size from 10px to 11px
    ctx.fillStyle = '#9CA3AF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Position labels with appropriate spacing
    const labelGap = 18; // Reduced from 20 to 18 to keep labels within bounds
    
    // Accuracy (top)
    ctx.fillText('Accuracy', points[0].x, points[0].y - labelGap);
    
    // Consistency (top right)
    ctx.fillText('Consistency', points[1].x + labelGap + 20, points[1].y);
    
    // Speed (bottom right) - moved further right
    ctx.fillText('Speed', points[2].x + 15, points[2].y + labelGap);
    
    // Application (bottom left)
    ctx.fillText('Application', points[3].x - labelGap, points[3].y + labelGap);
    
    // Retention (top left) - moved further left
    ctx.fillText('Retention', points[4].x - labelGap - 15, points[4].y);

  }, [canvasRef, skillData, hasData]);
  
  // Show loading state during data fetch or when data is not yet available
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

  return (
    <div className="bg-surface-dark/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-300">Skills Analysis</h3>
        <div className="group relative">
          {/* Tooltip to explain skill score calculation methodology */}
          <div className="text-xs text-gray-400 cursor-help">Based on multiple factors</div>
          <div className="absolute hidden group-hover:block w-64 p-4 mt-2 right-0 bg-dark-lighter rounded-lg shadow-lg border border-gray-700 z-10">
            <div className="text-xs space-y-2">
              <div className="font-medium text-gray-300 mb-2">Skill Components:</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-400"><span className="font-medium text-gray-300">Accuracy:</span> Correctness of answers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-400"><span className="font-medium text-gray-300">Consistency:</span> Improvement over time</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-400"><span className="font-medium text-gray-300">Speed:</span> Time to answer questions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-400"><span className="font-medium text-gray-300">Retention:</span> Long-term memory recall</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-gray-400"><span className="font-medium text-gray-300">Application:</span> Practical knowledge use</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[200px] flex items-center justify-center">
        {!hasData ? (
          // Show a helpful message when user hasn't completed enough questions
          <div className="text-center">
            <p className="text-sm text-gray-400">No skill data available yet.</p>
            <p className="text-xs mt-1 text-gray-500">Complete more questions to see your skill analysis.</p>
          </div>
        ) : (
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={200} 
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
};

export default SkillsAnalysisChart;
