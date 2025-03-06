import React from 'react';

/**
 * FilterPanel Component
 * Handles all question filtering options for study and exam modes
 * 
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.setFilters - Function to update filter state
 */
const FilterPanel = ({ filters, setFilters }) => {
  /**
   * Handles changes to question type filters
   * Ensures only one type can be selected at a time
   * @param {string} type - The type of questions to filter ('all', 'withAnnexes', 'withoutAnnexes')
   */
  const handleQuestionTypeChange = (type) => {
    // Check if any option other than the current one is selected
    const hasSelectionOtherThanCurrent = Object.entries(filters.questionTypes)
      .some(([key, value]) => value && key !== type);

    // Prevent selecting disabled options
    if (hasSelectionOtherThanCurrent && type !== 'all') {
      return;
    }

    // Update filter state
    setFilters(prev => ({
      ...prev,
      questionTypes: {
        all: type === 'all' ? !prev.questionTypes.all : false,
        withAnnexes: type === 'withAnnexes' ? !prev.questionTypes.withAnnexes : false,
        withoutAnnexes: type === 'withoutAnnexes' ? !prev.questionTypes.withoutAnnexes : false
      }
    }));
  };

  return (
    <div className="bg-surface-dark rounded-lg p-6 mb-8 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Question Type Selection */}
        <div 
          className={`flex items-center ${(filters.questionTypes.withAnnexes || filters.questionTypes.withoutAnnexes) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          onClick={() => handleQuestionTypeChange('all')}
        >
          <input
            type="checkbox"
            checked={filters.questionTypes.all}
            onChange={() => {}}
            disabled={filters.questionTypes.withAnnexes || filters.questionTypes.withoutAnnexes}
            className="w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1"
          />
          <label className="ml-3 text-gray-300">All Questions</label>
        </div>
        <div 
          className={`flex items-center ${(filters.questionTypes.all || filters.questionTypes.withoutAnnexes) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          onClick={() => handleQuestionTypeChange('withAnnexes')}
        >
          <input
            type="checkbox"
            checked={filters.questionTypes.withAnnexes}
            onChange={() => {}}
            disabled={filters.questionTypes.all || filters.questionTypes.withoutAnnexes}
            className="w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1"
          />
          <label className="ml-3 text-gray-300">With Annexes</label>
        </div>
        <div 
          className={`flex items-center ${(filters.questionTypes.all || filters.questionTypes.withAnnexes) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          onClick={() => handleQuestionTypeChange('withoutAnnexes')}
        >
          <input
            type="checkbox"
            checked={filters.questionTypes.withoutAnnexes}
            onChange={() => {}}
            disabled={filters.questionTypes.all || filters.questionTypes.withAnnexes}
            className="w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1"
          />
          <label className="ml-3 text-gray-300">Without Annexes</label>
        </div>

        {/* Additional Filter Options */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={filters.realExamOnly}
            onChange={(e) => setFilters({ ...filters, realExamOnly: e.target.checked })}
            className="w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1"
          />
          <label className="ml-3 text-gray-300">Only Real Exam Questions</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={filters.unseenQuestions}
            onChange={(e) => setFilters({ ...filters, unseenQuestions: e.target.checked })}
            className="w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1"
          />
          <label className="ml-3 text-gray-300">Previously Unseen Questions</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={filters.incorrectlyAnswered}
            onChange={(e) => setFilters({ ...filters, incorrectlyAnswered: e.target.checked })}
            className="w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1"
          />
          <label className="ml-3 text-gray-300">Incorrectly answered</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={filters.greenFlagged}
            onChange={(e) => setFilters({ ...filters, greenFlagged: e.target.checked })}
            className="w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1"
          />
          <label className="ml-3 text-gray-300">Green Flagged Questions</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={filters.yellowFlagged}
            onChange={(e) => setFilters({ ...filters, yellowFlagged: e.target.checked })}
            className="w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1"
          />
          <label className="ml-3 text-gray-300">Yellow Flagged Questions</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={filters.redFlagged}
            onChange={(e) => setFilters({ ...filters, redFlagged: e.target.checked })}
            className="w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1"
          />
          <label className="ml-3 text-gray-300">Red Flagged Questions</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={filters.showCorrectAnswers}
            onChange={(e) => setFilters({ ...filters, showCorrectAnswers: e.target.checked })}
            className="w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1"
          />
          <label className="ml-3 text-gray-300">Study Test with correct answers</label>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
