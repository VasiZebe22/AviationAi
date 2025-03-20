import React, { useState, useRef, useEffect } from 'react';
import LineDrawingTool from './LineDrawingTool';

/**
 * ImageWithMeasurement - A component that wraps an image with the line drawing tool
 * 
 * @param {Object} props
 * @param {string} props.src - The source URL of the image
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.className - Additional CSS classes for the image
 */
const ImageWithMeasurement = ({ src, alt, className }) => {
  const [showMeasurementTool, setShowMeasurementTool] = useState(false);
  const [unit, setUnit] = useState('cm');
  const imageRef = useRef(null);
  
  // Toggle measurement tool visibility
  const toggleMeasurementTool = () => {
    setShowMeasurementTool(prev => !prev);
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
        
        {/* Measurement tool toggle button */}
        <button
          onClick={toggleMeasurementTool}
          className="absolute top-2 right-2 bg-surface-dark/80 hover:bg-surface-dark text-white px-2 py-1 rounded text-xs z-20"
        >
          {showMeasurementTool ? 'Hide Measurement Tool' : 'Measure'}
        </button>
        
        {/* Line drawing tool */}
        {showMeasurementTool && (
          <LineDrawingTool
            imageRef={imageRef}
            unit={unit}
            onUnitChange={toggleUnit}
          />
        )}
      </div>
    </div>
  );
};

export default ImageWithMeasurement;