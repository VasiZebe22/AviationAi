import React, { useState, useRef, useEffect } from 'react';

/**
 * LineDrawingTool - A component that allows users to draw lines on images and measure their length
 * 
 * @param {Object} props
 * @param {string} props.imageRef - Reference to the image element
 * @param {string} props.unit - Unit of measurement ('cm' or 'in')
 */
const LineDrawingTool = ({ imageRef, unit = 'cm', onUnitChange }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  const [activeLineIndex, setActiveLineIndex] = useState(null);
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
  
  // Draw all lines on the canvas
  const drawLines = () => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw all saved lines
    lines.forEach((line, index) => {
      drawLine(ctx, line, index === activeLineIndex);
    });
    
    // Draw current line being created
    if (currentLine) {
      drawLine(ctx, currentLine, true);
    }
  };
  
  // Draw a single line
  const drawLine = (ctx, line, isActive) => {
    const { x1, y1, x2, y2 } = line;
    
    // Line style
    ctx.lineWidth = isActive ? 3 : 2;
    ctx.strokeStyle = isActive ? '#00BFFF' : '#FFFF00';
    
    // Draw the line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Draw endpoints
    ctx.fillStyle = isActive ? '#00BFFF' : '#FFFF00';
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
  
  // Handle mouse down - start drawing a line
  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicked near an existing line endpoint
    const clickedLineIndex = lines.findIndex(line => {
      const distToStart = Math.sqrt(Math.pow(line.x1 - x, 2) + Math.pow(line.y1 - y, 2));
      const distToEnd = Math.sqrt(Math.pow(line.x2 - x, 2) + Math.pow(line.y2 - y, 2));
      return distToStart < 10 || distToEnd < 10;
    });
    
    if (clickedLineIndex >= 0) {
      // Select this line
      setActiveLineIndex(clickedLineIndex);
    } else {
      // Start drawing a new line
      setIsDrawing(true);
      setCurrentLine({ x1: x, y1: y, x2: x, y2: y });
      setActiveLineIndex(null);
    }
  };
  
  // Handle mouse move - update the current line
  const handleMouseMove = (e) => {
    if (!isDrawing || !currentLine || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentLine(prev => ({ ...prev, x2: x, y2: y }));
    drawLines();
  };
  
  // Handle mouse up - finish drawing the line
  const handleMouseUp = () => {
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
    }
    
    setIsDrawing(false);
    setCurrentLine(null);
  };
  
  // Handle clearing all lines
  const handleClearLines = () => {
    setLines([]);
    setActiveLineIndex(null);
    drawLines();
  };
  
  // Handle deleting the active line
  const handleDeleteLine = () => {
    if (activeLineIndex !== null) {
      setLines(prev => prev.filter((_, index) => index !== activeLineIndex));
      setActiveLineIndex(null);
    }
  };
  
  // Update canvas when lines change
  useEffect(() => {
    drawLines();
  }, [lines, currentLine, activeLineIndex]);
  
  return (
    <div className="line-drawing-tool">
      <div className="tool-controls bg-surface-dark/80 text-white p-2 rounded-lg flex items-center space-x-2 absolute top-0 left-0 z-20 m-2">
        <button
          onClick={handleClearLines}
          className="px-2 py-1 bg-red-600/80 hover:bg-red-600 rounded text-xs"
        >
          Clear All
        </button>
        {activeLineIndex !== null && (
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
        <div className="text-xs ml-2">
          Click and drag to draw a line
        </div>
      </div>
      
      <div
        ref={containerRef}
        className="line-drawing-container absolute top-0 left-0 w-full h-full"
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