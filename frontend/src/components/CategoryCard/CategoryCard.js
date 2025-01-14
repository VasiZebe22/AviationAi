import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

/**
 * CategoryCard Component
 * Displays a category with expandable subcategories section
 * Features:
 * - Expandable/collapsible content
 * - Progress tracking
 * - Subcategory selection
 * - Smooth animations
 */
const CategoryCard = ({ 
  category, 
  progress, 
  completion,
  onStart, 
  selectedSubcategories,
  onSubcategoryChange 
}) => {
  // State for expansion
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Toggles the expansion state of the card
   * @param {Event} e - Click event
   */
  const handleCardClick = (e) => {
    // Don't expand if clicking the start button
    if (e.target.closest('button')) return;
    setIsExpanded(!isExpanded);
  };

  /**
   * Handles subcategory selection
   * @param {string} subcategoryCode - Code of the selected subcategory
   */
  const handleSubcategorySelect = (subcategoryCode) => {
    onSubcategoryChange(category.id, subcategoryCode);
  };

  // Ref for measuring expanded content height
  const expandedContentRef = useRef(null);
  const [expandedHeight, setExpandedHeight] = useState('0px');

  useEffect(() => {
    if (isExpanded && expandedContentRef.current) {
      const height = expandedContentRef.current.offsetHeight;
      setExpandedHeight(`${height}px`);
    }
  }, [isExpanded]);

  return (
    <div className="relative isolate" style={{ zIndex: isExpanded ? 999 : 1 }}>
      <div 
        className={`absolute inset-0 rounded-lg transition-all duration-300 ease-in-out ${
          isExpanded ? 'shadow-[0_0_0_1px_rgba(139,92,246,0.6),0_0_8px_1px_rgba(139,92,246,0.25)]' : ''
        }`}
        style={{ 
          height: isExpanded ? `calc(100% + ${expandedHeight} - 0.875rem)` : '100%', 
          transition: 'height 300ms ease-in-out',
          bottom: 0
        }}
      />
      <div className="relative z-10 bg-surface-dark rounded-lg overflow-visible">
        {/* Main Card Content */}
        <div 
          className="p-6 cursor-pointer"
          onClick={handleCardClick}
        >
          {/* Category Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">{category.title}</h2>
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5 text-accent-lilac" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-accent-lilac" />
            )}
          </div>
          
          {/* Category Description */}
          <p className="text-gray-400 text-sm mb-6">{category.description}</p>
          
          {/* Progress and Start Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-dark rounded-full flex items-center justify-center">
                <span className={`${progress === 'NaN' ? 'text-gray-500' : 'text-accent-lilac'} font-semibold`}>
                  {progress === 'NaN' ? '0%' : `${progress}%`}
                </span>
              </div>
              <div className="ml-3 flex flex-col">
                <span className="text-gray-400 text-sm">Completed</span>
                <span className="text-gray-500 text-xs">{completion}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedSubcategories?.length > 0 && (
                <div className="px-2 py-0.5 bg-accent-lilac/20 rounded-full">
                  <span className="text-accent-lilac text-sm font-medium">
                    {selectedSubcategories.length}
                  </span>
                </div>
              )}
              <button
                onClick={() => onStart(category.id)}
                className="px-6 py-2 bg-accent-lilac text-white rounded hover:bg-accent-lilac/90 transition-colors"
              >
                Start
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Subcategories Section */}
        <div 
          className={`absolute left-0 right-0 transition-all duration-300 ease-in-out ${
            isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
          style={{ 
            top: 'calc(100% - 0.875rem)', 
            height: isExpanded ? 'auto' : 0
          }}
        >
          <div ref={expandedContentRef} className="p-6 bg-surface-dark rounded-b-lg relative z-[100] border-t border-dark/10">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Subcategories</h3>
            <div className="flex flex-wrap gap-2">
              {category.subcategories?.map((subcategory) => {
                const isSelected = selectedSubcategories?.includes(subcategory.code);
                return (
                  <button
                    key={subcategory.code}
                    onClick={() => handleSubcategorySelect(subcategory.code)}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-sm 
                      transition-all duration-200 ease-in-out
                      ${isSelected 
                        ? 'bg-accent-lilac/20 text-accent-lilac ring-1 ring-accent-lilac/50' 
                        : 'bg-dark text-gray-400 hover:bg-dark/70 hover:text-gray-300'
                      }
                    `}
                  >
                    <span>{subcategory.name}</span>
                    {isSelected && (
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
