import React from 'react';

/**
 * ModeSelector Component
 * Handles selection between study and exam modes
 * 
 * @param {Object} props - Component props
 * @param {string} props.mode - Current selected mode ('study' or 'exam')
 * @param {Function} props.setMode - Function to update the mode
 */
const ModeSelector = ({ mode, setMode }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
      <button
        onClick={() => setMode('study')}
        className={`p-4 rounded-lg text-center transition-colors ${
          mode === 'study'
            ? 'bg-accent-lilac text-white'
            : 'bg-surface-dark text-gray-300 hover:bg-dark-lighter'
        }`}
      >
        STUDY
      </button>
      <button
        onClick={() => setMode('exam')}
        className={`p-4 rounded-lg text-center transition-colors ${
          mode === 'exam'
            ? 'bg-accent-lilac text-white'
            : 'bg-surface-dark text-gray-300 hover:bg-dark-lighter'
        }`}
      >
        EXAM
      </button>
    </div>
  );
};

export default ModeSelector;
