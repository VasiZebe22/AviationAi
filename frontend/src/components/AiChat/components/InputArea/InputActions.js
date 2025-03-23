import React from 'react';

/**
 * Component for additional actions available in the input area
 * 
 * Provides controls for toggling bookmarked messages view and other
 * potential actions that might be relevant to the input area
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.showBookmarkedMessagesOnly - Whether only bookmarked messages are shown
 * @param {Function} props.setShowBookmarkedMessagesOnly - Function to toggle bookmarked messages filter
 */
const InputActions = ({
  showBookmarkedMessagesOnly,
  setShowBookmarkedMessagesOnly
}) => {
  // Toggle the bookmarked messages filter
  const toggleBookmarkedFilter = () => {
    setShowBookmarkedMessagesOnly(!showBookmarkedMessagesOnly);
  };
  
  return (
    <div className="input-actions">
      <button
        onClick={toggleBookmarkedFilter}
        className={`bookmark-filter-button ${showBookmarkedMessagesOnly ? 'active' : ''}`}
        title={showBookmarkedMessagesOnly ? "Show all messages" : "Show bookmarked messages only"}
      >
        <svg 
          className="w-5 h-5" 
          fill={showBookmarkedMessagesOnly ? "currentColor" : "none"} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
          />
        </svg>
        <span className="action-label">
          {showBookmarkedMessagesOnly ? "Show All" : "Bookmarked Only"}
        </span>
      </button>
      
      {/* Additional action buttons can be added here in the future */}
    </div>
  );
};

export default InputActions;
