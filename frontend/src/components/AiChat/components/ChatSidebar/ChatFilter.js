import React from 'react';

/**
 * Chat filtering controls for the sidebar
 * @param {Object} props - Component props
 * @param {boolean} props.showStarredOnly - Whether to show only starred chats
 * @param {Function} props.onToggleStarredFilter - Function to toggle starred filter
 */
const ChatFilter = ({ showStarredOnly, onToggleStarredFilter }) => {
  return (
    <div className="px-4 py-2 border-t border-b border-gray-700">
      <div className="flex items-center">
        <input
          id="starred-filter"
          type="checkbox"
          checked={showStarredOnly}
          onChange={onToggleStarredFilter}
          className="h-4 w-4 rounded border-gray-300 text-accent-lilac focus:ring-accent-lilac"
        />
        <label htmlFor="starred-filter" className="ml-2 text-sm text-gray-200 cursor-pointer">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Show starred chats only
          </div>
        </label>
      </div>
    </div>
  );
};

export default ChatFilter;
