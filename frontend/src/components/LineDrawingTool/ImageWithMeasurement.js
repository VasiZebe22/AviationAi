import React, { useState, useRef, useEffect } from 'react';
import LineDrawingTool from './LineDrawingTool';

/**
 * ImageWithMeasurement - A component that wraps an image with the line drawing tool
 *
 * @param {Object} props
 * @param {string} props.src - The source URL of the image
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.className - Additional CSS classes for the image
 * @param {boolean} props.showMeasurementTool - Whether to show the measurement tool
 * @param {boolean} props.showAngleTool - Whether to show the angle measurement tool
 * @param {function} props.onToggleMeasurementTool - Function to toggle measurement tool visibility
 * @param {function} props.onToggleAngleTool - Function to toggle angle tool visibility
 */
const ImageWithMeasurement = ({
  src,
  alt,
  className,
  showMeasurementTool = false,
  showAngleTool = false,
  onToggleMeasurementTool = null,
  onToggleAngleTool = null
}) => {
  // If no external control is provided, use internal state
  const [internalShowTool, setInternalShowTool] = useState(false);
  const [internalShowAngleTool, setInternalShowAngleTool] = useState(false);
  const [unit, setUnit] = useState('cm');
  const imageRef = useRef(null);
  
  // Determine if we should use internal or external state
  const isControlled = onToggleMeasurementTool !== null;
  const isAngleControlled = onToggleAngleTool !== null;
  const shouldShowTool = isControlled ? showMeasurementTool : internalShowTool;
  const shouldShowAngleTool = isAngleControlled ? showAngleTool : internalShowAngleTool;
  
  // Toggle measurement tool visibility
  const toggleMeasurementTool = () => {
    if (isControlled) {
      onToggleMeasurementTool();
    } else {
      setInternalShowTool(prev => !prev);
    }
  };
  
  // Toggle angle tool visibility
  const toggleAngleTool = () => {
    if (isAngleControlled) {
      onToggleAngleTool();
    } else {
      setInternalShowAngleTool(prev => !prev);
    }
  };
  
  // Toggle between cm and inches
  const toggleUnit = () => {
    setUnit(prev => prev === 'cm' ? 'in' : 'cm');
  };
  
  return (
    <div className="relative image-measurement-container">
      <div className="relative">
        {/* The image */}
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={`${className || ''}`}
          onError={(e) => {
            console.error('Image failed to load:', src);
            e.target.style.display = 'none';
          }}
        />
        
        {/* Line drawing tool - Always render it but with visibility flags */}
        <LineDrawingTool
          imageRef={imageRef}
          unit={unit}
          onUnitChange={toggleUnit}
          angleMeasurementMode={shouldShowAngleTool}
          toolsVisible={shouldShowTool || shouldShowAngleTool}
          lineDrawingActive={shouldShowTool}
          angleMeasurementActive={shouldShowAngleTool}
        />
      </div>
    </div>
  );
};

export default ImageWithMeasurement;