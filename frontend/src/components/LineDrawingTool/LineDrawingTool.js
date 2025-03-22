import React, { useState, useRef, useEffect } from 'react';

/**
 * LineDrawingTool - A component that allows users to draw lines on images and measure their length
 * 
 * @param {Object} props
 * @param {string} props.imageRef - Reference to the image element
 * @param {string} props.unit - Unit of measurement ('cm' or 'in')
 * @param {boolean} props.angleMeasurementMode - Whether angle measurement mode is active
 * @param {boolean} props.toolsVisible - Whether the tool controls should be visible
 * @param {boolean} props.lineDrawingActive - Whether line drawing is active
 * @param {boolean} props.angleMeasurementActive - Whether angle measurement is active
 */
const LineDrawingTool = ({ 
  imageRef, 
  unit = 'cm', 
  onUnitChange, 
  angleMeasurementMode = false,
  toolsVisible = true,
  lineDrawingActive = false,
  angleMeasurementActive = false
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  const [activeLineIndex, setActiveLineIndex] = useState(null);
  const [hoveredEndpoint, setHoveredEndpoint] = useState(null);
  const [selectedLines, setSelectedLines] = useState([]);
  // Store angle measurements persistently
  const [anglesMeasured, setAnglesMeasured] = useState([]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // Convert pixels to the selected unit (cm or inches)
  // This is a placeholder conversion - in a real app, you would need to calibrate this
  const pixelToUnit = (pixels) => {
    // Approximate conversion (would need calibration in a real app)
    const pixelsPerCm = 38; // This is an approximation
    const pixelsPerInch = 96; // Standard 96 DPI
    
    if (unit === 'cm') {
      return pixels / pixelsPerCm;
    } else {
      return pixels / pixelsPerInch;
    }
  };
  
  // Calculate distance between two points
  const calculateDistance = (x1, y1, x2, y2) => {
    const pixelDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return pixelToUnit(pixelDistance);
  };
  
  // Calculate angle between two lines
  const calculateAngle = (line1, line2) => {
    // Calculate vectors for both lines
    const vector1 = {
      x: line1.x2 - line1.x1,
      y: line1.y2 - line1.y1
    };
    
    const vector2 = {
      x: line2.x2 - line2.x1,
      y: line2.y2 - line2.y1
    };
    
    // Calculate dot product
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    
    // Calculate magnitudes
    const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
    
    // Calculate angle in radians using dot product
    const cosTheta = dotProduct / (magnitude1 * magnitude2);
    
    // Convert to degrees (handle potential floating point errors)
    let angleInDegrees = Math.acos(Math.min(Math.max(cosTheta, -1), 1)) * (180 / Math.PI);
    
    // The angle from dot product is always the smaller angle (0-180)
    // To determine if we should return the obtuse angle (>90) or acute angle (<90),
    // we need to check the orientation of the vectors
    
    // Calculate cross product to determine orientation
    const crossProduct = vector1.x * vector2.y - vector1.y * vector2.x;
    
    // Find the closest endpoints to determine the vertex
    let endpoints = [
      { x: line1.x1, y: line1.y1, line: 1, end: 'start' },
      { x: line1.x2, y: line1.y2, line: 1, end: 'end' },
      { x: line2.x1, y: line2.y1, line: 2, end: 'start' },
      { x: line2.x2, y: line2.y2, line: 2, end: 'end' }
    ];
    
    // Find the closest pair of endpoints
    let minDistance = Infinity;
    let closestPair = [0, 2]; // Default to first endpoints of each line
    
    for (let i = 0; i < 2; i++) {
      for (let j = 2; j < 4; j++) {
        const dist = Math.sqrt(
          Math.pow(endpoints[i].x - endpoints[j].x, 2) + 
          Math.pow(endpoints[i].y - endpoints[j].y, 2)
        );
        if (dist < minDistance) {
          minDistance = dist;
          closestPair = [i, j];
        }
      }
    }
    
    // Determine which endpoints are at the vertex and which are at the ends
    const vertexEndpoints = [endpoints[closestPair[0]], endpoints[closestPair[1]]];
    const outerEndpoints = endpoints.filter((_, index) => 
      index !== closestPair[0] && index !== closestPair[1]
    );
    
    // Create vectors from vertex to outer endpoints
    const vertexPoint = {
      x: (vertexEndpoints[0].x + vertexEndpoints[1].x) / 2,
      y: (vertexEndpoints[0].y + vertexEndpoints[1].y) / 2
    };
    
    const vectorFromVertex1 = {
      x: outerEndpoints[0].x - vertexPoint.x,
      y: outerEndpoints[0].y - vertexPoint.y
    };
    
    const vectorFromVertex2 = {
      x: outerEndpoints[1].x - vertexPoint.x,
      y: outerEndpoints[1].y - vertexPoint.y
    };
    
    // Calculate the angle between these vectors using atan2
    const angle1 = Math.atan2(vectorFromVertex1.y, vectorFromVertex1.x);
    const angle2 = Math.atan2(vectorFromVertex2.y, vectorFromVertex2.x);
    
    // Calculate the difference between angles
    let angleDiff = Math.abs(angle1 - angle2);
    
    // Ensure we get the correct angle (between 0 and 180)
    if (angleDiff > Math.PI) {
      angleDiff = 2 * Math.PI - angleDiff;
    }
    
    // Convert to degrees
    const finalAngle = angleDiff * (180 / Math.PI);
    
    return finalAngle;
  };
  
  // Calculate distance from point to line segment
  const distanceToLine = (point, line) => {
    const { x, y } = point;
    const { x1, y1, x2, y2 } = line;
    
    // Calculate the length of the line segment
    const lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    
    // If line length is zero, return distance to the point
    if (lineLength === 0) return Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));
    
    // Calculate the projection of the point onto the line
    const t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / (lineLength * lineLength);
    
    // If t is outside [0,1], the closest point is an endpoint
    if (t < 0) return Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));
    if (t > 1) return Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
    
    // Calculate the closest point on the line
    const closestX = x1 + t * (x2 - x1);
    const closestY = y1 + t * (y2 - y1);
    
    // Return the distance to the closest point
    return Math.sqrt(Math.pow(x - closestX, 2) + Math.pow(y - closestY, 2));
  };
  
  // Check if a point is near an endpoint of a line
  const isNearEndpoint = (point, line) => {
    const { x, y } = point;
    const distToStart = Math.sqrt(Math.pow(line.x1 - x, 2) + Math.pow(line.y1 - y, 2));
    const distToEnd = Math.sqrt(Math.pow(line.x2 - x, 2) + Math.pow(line.y2 - y, 2));
    
    if (distToStart < 10) {
      return { isNear: true, point: { x: line.x1, y: line.y1 } };
    } else if (distToEnd < 10) {
      return { isNear: true, point: { x: line.x2, y: line.y2 } };
    }
    
    return { isNear: false };
  };
  
  // Toggle between cm and inches
  const toggleUnit = () => {
    if (onUnitChange) {
      onUnitChange();
    }
  };
  
  // Initialize canvas when component mounts or image changes
  useEffect(() => {
    if (!imageRef || !imageRef.current) return;
    
    const updateCanvasSize = () => {
      if (canvasRef.current && containerRef.current && imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
        
        // Position the canvas over the image
        containerRef.current.style.position = 'absolute';
        containerRef.current.style.top = '0';
        containerRef.current.style.left = '0';
        containerRef.current.style.width = `${rect.width}px`;
        containerRef.current.style.height = `${rect.height}px`;
        
        // Redraw lines after resize
        drawLines();
      }
    };
    
    // Initial setup
    updateCanvasSize();
    
    // Add resize listener
    window.addEventListener('resize', updateCanvasSize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [imageRef, lines]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Re-initialize canvas when tool becomes active
  useEffect(() => {
    if (lineDrawingActive || angleMeasurementActive) {
      if (canvasRef.current && containerRef.current && imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
        
        // Ensure the canvas is properly sized and positioned
        containerRef.current.style.position = 'absolute';
        containerRef.current.style.top = '0';
        containerRef.current.style.left = '0';
        containerRef.current.style.width = `${rect.width}px`;
        containerRef.current.style.height = `${rect.height}px`;
        
        // Redraw everything
        drawLines();
      }
    }
  }, [lineDrawingActive, angleMeasurementActive]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Draw all lines on the canvas
  const drawLines = () => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Always draw all saved lines first to ensure they're visible
    lines.forEach((line, index) => {
      const isSelected = selectedLines.includes(index);
      const isActive = index === activeLineIndex;
      drawLine(ctx, line, isActive, isSelected);
    });
    
    // Draw current line being created
    if (currentLine) {
      drawLine(ctx, currentLine, true, false);
    }
    
    // Draw all saved angle measurements
    anglesMeasured.forEach(angle => {
      drawAngle(ctx, lines[angle.lineIndex1], lines[angle.lineIndex2], angle.value);
    });
    
    // Draw hovered endpoint with special highlight
    if (hoveredEndpoint) {
      ctx.fillStyle = '#00FF00'; // Bright green for the hovered endpoint
      ctx.beginPath();
      ctx.arc(hoveredEndpoint.x, hoveredEndpoint.y, 7, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add a "+" symbol to indicate connection point
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', hoveredEndpoint.x, hoveredEndpoint.y);
    }
  };
  
  // Draw angle between two lines
  const drawAngle = (ctx, line1, line2, angle) => {
    if (!line1 || !line2) return;
    
    // Format the angle
    const formattedAngle = typeof angle === 'number' ? angle.toFixed(1) : angle;
    
    // Find the intersection point (vertex) of the two lines
    // For simplicity, we'll use the closest endpoints of the two lines
    let vertex;
    let endpoints = [
      { x: line1.x1, y: line1.y1 },
      { x: line1.x2, y: line1.y2 },
      { x: line2.x1, y: line2.y1 },
      { x: line2.x2, y: line2.y2 }
    ];
    
    // Find the pair of endpoints with the smallest distance
    let minDistance = Infinity;
    let closestPair = [0, 2]; // Default to first endpoints of each line
    
    for (let i = 0; i < 2; i++) {
      for (let j = 2; j < 4; j++) {
        const dist = Math.sqrt(
          Math.pow(endpoints[i].x - endpoints[j].x, 2) + 
          Math.pow(endpoints[i].y - endpoints[j].y, 2)
        );
        if (dist < minDistance) {
          minDistance = dist;
          closestPair = [i, j];
        }
      }
    }
    
    // If the endpoints are very close, use their average as the vertex
    if (minDistance < 20) {
      vertex = {
        x: (endpoints[closestPair[0]].x + endpoints[closestPair[1]].x) / 2,
        y: (endpoints[closestPair[0]].y + endpoints[closestPair[1]].y) / 2
      };
    } else {
      // If endpoints aren't close, use the midpoint between the lines
      const midpoint1 = {
        x: (line1.x1 + line1.x2) / 2,
        y: (line1.y1 + line1.y2) / 2
      };
      
      const midpoint2 = {
        x: (line2.x1 + line2.x2) / 2,
        y: (line2.y1 + line2.y2) / 2
      };
      
      vertex = {
        x: (midpoint1.x + midpoint2.x) / 2,
        y: (midpoint1.y + midpoint2.y) / 2
      };
    }
    
    // Calculate vectors from vertex to each line
    // We'll use the midpoints of the lines for direction
    const midpoint1 = {
      x: (line1.x1 + line1.x2) / 2,
      y: (line1.y1 + line1.y2) / 2
    };
    
    const midpoint2 = {
      x: (line2.x1 + line2.x2) / 2,
      y: (line2.y1 + line2.y2) / 2
    };
    
    // Calculate vectors from vertex to midpoints
    const vector1 = {
      x: midpoint1.x - vertex.x,
      y: midpoint1.y - vertex.y
    };
    
    const vector2 = {
      x: midpoint2.x - vertex.x,
      y: midpoint2.y - vertex.y
    };
    
    // Normalize vectors
    const length1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    const length2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
    
    const normalizedVector1 = {
      x: vector1.x / length1,
      y: vector1.y / length1
    };
    
    const normalizedVector2 = {
      x: vector2.x / length2,
      y: vector2.y / length2
    };
    
    // Calculate start and end angles for the arc
    const startAngle = Math.atan2(normalizedVector1.y, normalizedVector1.x);
    const endAngle = Math.atan2(normalizedVector2.y, normalizedVector2.x);
    
    // Draw the angle arc
    const radius = 20; // Smaller radius for the arc
    ctx.beginPath();
    ctx.arc(vertex.x, vertex.y, radius, startAngle, endAngle, false);
    ctx.strokeStyle = '#FFCC00'; // Yellow color
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Calculate position for the text (slightly outside the arc)
    const textRadius = radius * 1.5;
    const textAngle = (startAngle + endAngle) / 2; // Midpoint angle
    const textX = vertex.x + textRadius * Math.cos(textAngle);
    const textY = vertex.y + textRadius * Math.sin(textAngle);
    
    // Draw angle text with a small background
    ctx.font = 'bold 12px Arial';
    const text = `${formattedAngle}°`;
    const textWidth = ctx.measureText(text).width;
    
    // Background for text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(textX - textWidth/2 - 3, textY - 8, textWidth + 6, 16);
    
    // Text
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, textX, textY);
  };
  
  // Draw a single line
  const drawLine = (ctx, line, isActive, isSelected) => {
    const { x1, y1, x2, y2 } = line;
    
    // Line style
    ctx.lineWidth = isActive || isSelected ? 3 : 2;
    
    // Different colors based on state
    if (isSelected) {
      ctx.strokeStyle = '#FFCC00'; // Yellow for selected lines in angle mode
    } else if (isActive) {
      ctx.strokeStyle = '#00BFFF'; // Blue for active line
    } else {
      ctx.strokeStyle = '#FF0000'; // Red for normal lines
    }
    
    // Draw the line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Draw endpoints
    ctx.fillStyle = isSelected ? '#FFCC00' : (isActive ? '#00BFFF' : '#FF0000'); // Yellow for selected, blue for active, red for normal
    ctx.beginPath();
    ctx.arc(x1, y1, 5, 0, 2 * Math.PI);
    ctx.arc(x2, y2, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw measurement text
    const distance = calculateDistance(x1, y1, x2, y2).toFixed(2);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    // Text background for better visibility
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '14px Arial';
    const text = `${distance} ${unit}`;
    const textWidth = ctx.measureText(text).width;
    ctx.fillRect(midX - textWidth/2 - 5, midY - 10, textWidth + 10, 20);
    
    // Text
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, midX, midY);
  };
  
  // Handle mouse down - start drawing a line or select a line
  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;
    
    // Only allow drawing when line drawing is active
    // Allow interaction for angle measurement when angle measurement is active
    if (!lineDrawingActive && !angleMeasurementActive) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clickPoint = { x, y };
    
    // Handle angle measurement mode differently
    if (angleMeasurementMode) {
      // In angle mode, we just need to check if clicked on any line
      const threshold = 10; // More generous threshold in angle mode
      const clickedLineIndex = lines.findIndex(line => {
        return distanceToLine(clickPoint, line) < threshold;
      });
      
      if (clickedLineIndex >= 0) {
        // Don't select a line that's already selected
        if (selectedLines.includes(clickedLineIndex)) {
          return;
        }
        
        // Add to selection (but keep only up to 2 lines)
        const newSelectedLines = [...selectedLines];
        if (newSelectedLines.length >= 2) {
          newSelectedLines.shift(); // Remove the oldest selection
        }
        newSelectedLines.push(clickedLineIndex);
        setSelectedLines(newSelectedLines);
        
        // If we now have exactly 2 selected lines, save the angle measurement
        if (newSelectedLines.length === 2) {
          const angle = calculateAngle(lines[newSelectedLines[0]], lines[newSelectedLines[1]]);
          
          // Check if this angle is already measured
          const alreadyMeasured = anglesMeasured.some(
            a => (a.lineIndex1 === newSelectedLines[0] && a.lineIndex2 === newSelectedLines[1]) ||
                 (a.lineIndex1 === newSelectedLines[1] && a.lineIndex2 === newSelectedLines[0])
          );
          
          if (!alreadyMeasured) {
            setAnglesMeasured(prev => [
              ...prev,
              {
                lineIndex1: newSelectedLines[0],
                lineIndex2: newSelectedLines[1],
                value: angle
              }
            ]);
          }
          
          // Clear selection after saving the angle
          setTimeout(() => {
            setSelectedLines([]);
          }, 300);
        }
        
        setActiveLineIndex(null);
      }
      return;
    }
    
    // Line drawing mode logic
    
    // First check if we clicked near an endpoint of any line
    let foundEndpoint = null;
    let foundEndpointLineIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const { isNear, point } = isNearEndpoint(clickPoint, lines[i]);
      if (isNear) {
        foundEndpoint = point;
        foundEndpointLineIndex = i;
        break;
      }
    }
    
    // If we clicked on an endpoint, start drawing from there
    if (foundEndpoint) {
      setIsDrawing(true);
      setCurrentLine({
        x1: foundEndpoint.x,
        y1: foundEndpoint.y,
        x2: foundEndpoint.x,
        y2: foundEndpoint.y
      });
      setActiveLineIndex(null);
      return;
    }
    
    // If not on an endpoint, check if clicked on the body of a line
    const threshold = 5; // Threshold for line body selection
    const clickedLineIndex = lines.findIndex(line => {
      return distanceToLine(clickPoint, line) < threshold;
    });
    
    if (clickedLineIndex >= 0) {
      // Select this line
      setActiveLineIndex(clickedLineIndex);
    } else {
      // Start drawing a new line from scratch
      setIsDrawing(true);
      setCurrentLine({ x1: x, y1: y, x2: x, y2: y });
      setActiveLineIndex(null);
    }
  };
  
  // Handle mouse move - update current line or check for hovering over endpoints
  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    
    // Only allow interaction when appropriate tool is active
    if (!lineDrawingActive && !angleMeasurementActive) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const mousePoint = { x, y };
    
    // Update current line if drawing
    if (isDrawing && currentLine) {
      setCurrentLine({ ...currentLine, x2: x, y2: y });
    }
    
    // Always check for hovering over endpoints to provide visual feedback
    if (!angleMeasurementMode && !isDrawing) {
      let foundEndpoint = null;
      
      for (const line of lines) {
        const { isNear, point } = isNearEndpoint(mousePoint, line);
        if (isNear) {
          foundEndpoint = point;
          break;
        }
      }
      
      setHoveredEndpoint(foundEndpoint);
    } else {
      setHoveredEndpoint(null);
    }
  };
  
  // Handle mouse up - finish drawing the line
  const handleMouseUp = () => {
    // Only allow interaction when appropriate tool is active
    if (!lineDrawingActive && !angleMeasurementActive) return;
    
    if (isDrawing && currentLine) {
      // Only add the line if it has some length
      const length = calculateDistance(
        currentLine.x1, 
        currentLine.y1, 
        currentLine.x2, 
        currentLine.y2
      );
      
      if (length > 0.1) { // Minimum length threshold
        setLines(prev => [...prev, currentLine]);
      }
      setCurrentLine(null);
      setIsDrawing(false);
    }
  };
  
  // Handle clearing all lines
  const handleClearLines = () => {
    if (angleMeasurementMode) {
      // In angle mode, only clear angle measurements
      setSelectedLines([]);
      setAnglesMeasured([]);
    } else {
      // In line mode, clear everything
      setLines([]);
      setActiveLineIndex(null);
      setSelectedLines([]);
      setAnglesMeasured([]);
    }
    drawLines();
  };
  
  // Handle deleting the active line
  const handleDeleteLine = () => {
    if (activeLineIndex !== null) {
      // When deleting a line, also remove any angle measurements that use this line
      setAnglesMeasured(prev => 
        prev.filter(angle => 
          angle.lineIndex1 !== activeLineIndex && angle.lineIndex2 !== activeLineIndex
        )
      );
      
      // Remove the line
      setLines(prev => {
        const newLines = prev.filter((_, index) => index !== activeLineIndex);
        
        // Update indices in anglesMeasured to account for the removed line
        setAnglesMeasured(angles => 
          angles.map(angle => ({
            lineIndex1: angle.lineIndex1 > activeLineIndex ? angle.lineIndex1 - 1 : angle.lineIndex1,
            lineIndex2: angle.lineIndex2 > activeLineIndex ? angle.lineIndex2 - 1 : angle.lineIndex2,
            value: angle.value
          }))
        );
        
        return newLines;
      });
      
      setActiveLineIndex(null);
      // Also remove from selected lines if present
      setSelectedLines(prev => prev.filter(index => index !== activeLineIndex));
    }
  };
  
  // Update canvas when lines change
  useEffect(() => {
    drawLines();
  }, [lines, currentLine, activeLineIndex, hoveredEndpoint, selectedLines, angleMeasurementMode, anglesMeasured]);
  
  // Reset selected lines when angle measurement mode changes
  useEffect(() => {
    if (!angleMeasurementMode) {
      setSelectedLines([]);
    }
  }, [angleMeasurementMode]);
  
  // Add keyboard event listeners for shift key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') {
        // We'll handle the visual update in the mouse move handler
        // No need to force redraw here
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        // Clear hovered endpoint when shift is released
        setHoveredEndpoint(null);
        // No need to force redraw here, it will happen in the useEffect
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  
  return (
    <div className="line-drawing-tool">
      {toolsVisible && (
        <div className="tool-controls bg-surface-dark/80 text-white p-2 rounded-lg flex items-center space-x-2 absolute top-0 left-0 z-20 m-2">
          <button
            onClick={handleClearLines}
            className="px-2 py-1 bg-red-600/80 hover:bg-red-600 rounded text-xs"
          >
            {angleMeasurementMode ? "Clear Angles" : "Clear Lines"}
          </button>
          {activeLineIndex !== null && !angleMeasurementMode && (
            <button
              onClick={handleDeleteLine}
              className="px-2 py-1 bg-yellow-600/80 hover:bg-yellow-600 rounded text-xs"
            >
              Delete Line
            </button>
          )}
          <button
            onClick={toggleUnit}
            className="px-2 py-1 bg-blue-600/80 hover:bg-blue-600 rounded text-xs"
          >
            {unit === 'cm' ? 'Switch to inches' : 'Switch to cm'}
          </button>
          <div className="text-xs ml-2 flex flex-col">
            {angleMeasurementMode ? (
              <span>Click on two lines to measure the angle between them</span>
            ) : (
              <>
                <span>Click and drag to draw a line</span>
                <span className="text-gray-400">Click on an endpoint to continue from there</span>
              </>
            )}
          </div>
        </div>
      )}
      
      <div
        ref={containerRef}
        className={`line-drawing-container absolute top-0 left-0 w-full h-full ${(lineDrawingActive || angleMeasurementActive) ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="absolute top-0 left-0 z-10 cursor-crosshair"
        />
      </div>
    </div>
  );
};

export default LineDrawingTool;