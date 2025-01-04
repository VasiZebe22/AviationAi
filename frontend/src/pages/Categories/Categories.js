import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import questionService from '../../services/questionService';

/**
 * Array of ATPL question categories with their metadata
 * Each category contains:
 * - id: Unique identifier for the category (e.g., '010' for Air Law)
 * - title: Display name of the category
 * - description: Brief explanation of the category content
 * - image: Path to the category's illustration image
 */
const categories = [
  {
    id: '010',
    title: 'Air Law',
    description: 'Aviation laws, regulations and procedures',
    image: '/images/categories/regulations.jpg'
  },
  {
    id: '021',
    title: 'Airframe and Systems',
    description: 'Aircraft structure, systems, and power plants',
    image: '/images/categories/systems.jpg'
  },
  {
    id: '022',
    title: 'Instrumentation',
    description: 'Aircraft instruments and electronics',
    image: '/images/categories/systems.jpg'
  },
  {
    id: '031',
    title: 'Mass and Balance',
    description: 'Weight, balance, and loading',
    image: '/images/categories/general.jpg'
  },
  {
    id: '032',
    title: 'Performance',
    description: 'Aircraft performance and flight planning',
    image: '/images/categories/general.jpg'
  },
  {
    id: '033',
    title: 'Flight Planning',
    description: 'Navigation and route planning',
    image: '/images/categories/navigation.jpg'
  },
  {
    id: '034',
    title: 'Performance - Helicopters',
    description: 'Helicopter-specific performance considerations',
    image: '/images/categories/helicopter.jpg'
  },
  {
    id: '040',
    title: 'Human Performance',
    description: 'Human factors and limitations',
    image: '/images/categories/general.jpg'
  },
  {
    id: '050',
    title: 'Meteorology',
    description: 'Weather and atmospheric conditions',
    image: '/images/categories/weather.jpg'
  },
  {
    id: '061',
    title: 'General Navigation',
    description: 'Basic navigation principles and methods',
    image: '/images/categories/navigation.jpg'
  },
  {
    id: '062',
    title: 'Radio Navigation',
    description: 'Radio navigation systems and procedures',
    image: '/images/categories/navigation.jpg'
  },
  {
    id: '070',
    title: 'Operational Procedures',
    description: 'Standard operating procedures and safety',
    image: '/images/categories/operations.jpg'
  },
  {
    id: '081',
    title: 'Principles of Flight',
    description: 'Aerodynamics and flight mechanics',
    image: '/images/categories/principles.jpg'
  }
];

/**
 * Categories Component
 * Main component for displaying and managing ATPL question categories
 * Features:
 * - Study/Exam mode selection
 * - Question filtering options
 * - Category progress tracking
 * - Navigation to specific question sets
 */
const Categories = () => {
  const navigate = useNavigate();
  
  // State Management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [mode, setMode] = useState('study');  // 'study' or 'exam' mode
  
  // Question filter state with default values
  const [filters, setFilters] = useState({
    questionTypes: {
      all: true,
      withAnnexes: false,
      withoutAnnexes: false
    },
    realExamOnly: false,
    reviewQuestions: false,
    markedQuestions: false,
    unseenQuestions: false,
    incorrectlyAnswered: false,
    greenFlagged: false,
    yellowFlagged: false,
    redFlagged: false,
    showCorrectAnswers: false
  });

  // Fetch user's progress when component mounts
  useEffect(() => {
    fetchUserProgress();
  }, []);

  /**
   * Fetches the user's progress stats for all categories
   * Updates userProgress state with completion percentages
   */
  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      const response = await questionService.getUserStats();
      setUserProgress(response.progress || {});
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles navigation to questions page when a category is selected
   * @param {string} categoryId - The ID of the selected category
   */
  const handleCategoryClick = (categoryId) => {
    navigate(`/questions/${categoryId}`, {
      state: {
        mode,
        filters
      }
    });
  };

  /**
   * Calculates the completion percentage for a given category
   * @param {string} categoryId - The ID of the category
   * @returns {number} Percentage of completed questions (0-100)
   */
  const getCategoryProgress = (categoryId) => {
    if (!userProgress[categoryId]) return 0;
    return Math.round((userProgress[categoryId].completed / userProgress[categoryId].total) * 100);
  };

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

  /**
   * Reusable checkbox component for filter options
   */
  const FilterOption = ({ label, checked, onChange }) => (
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1"
      />
      <label className="ml-3 text-gray-300">{label}</label>
    </div>
  );

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-lilac"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-4">
      <div className="max-w-6xl mx-auto relative">
        {/* Dashboard Navigation Button */}
        <div className="absolute right-0 top-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 bg-accent-lilac text-white rounded-lg hover:bg-accent-lilac/90 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
        </div>
    
        {/* Page Header */}
        <h1 className="text-3xl text-gray-200 mb-8 text-center pt-2">Question Categories</h1>

        {/* Mode Selection - Study or Exam */}
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

        {/* Filter Options Panel */}
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
            <FilterOption
              label="Only Real Exam Questions"
              checked={filters.realExamOnly}
              onChange={(checked) => setFilters({ ...filters, realExamOnly: checked })}
            />
            <FilterOption
              label="Review Questions"
              checked={filters.reviewQuestions}
              onChange={(checked) => setFilters({ ...filters, reviewQuestions: checked })}
            />
            <FilterOption
              label="Marked Questions"
              checked={filters.markedQuestions}
              onChange={(checked) => setFilters({ ...filters, markedQuestions: checked })}
            />
            <FilterOption
              label="Previously Unseen Questions"
              checked={filters.unseenQuestions}
              onChange={(checked) => setFilters({ ...filters, unseenQuestions: checked })}
            />
            <FilterOption
              label="Incorrectly answered"
              checked={filters.incorrectlyAnswered}
              onChange={(checked) => setFilters({ ...filters, incorrectlyAnswered: checked })}
            />
            <FilterOption
              label="Green Flagged Questions"
              checked={filters.greenFlagged}
              onChange={(checked) => setFilters({ ...filters, greenFlagged: checked })}
            />
            <FilterOption
              label="Yellow Flagged Questions"
              checked={filters.yellowFlagged}
              onChange={(checked) => setFilters({ ...filters, yellowFlagged: checked })}
            />
            <FilterOption
              label="Red Flagged Questions"
              checked={filters.redFlagged}
              onChange={(checked) => setFilters({ ...filters, redFlagged: checked })}
            />
            <FilterOption
              label="Study Test with correct answers"
              checked={filters.showCorrectAnswers}
              onChange={(checked) => setFilters({ ...filters, showCorrectAnswers: checked })}
            />
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-600/20 text-red-200 p-4 mb-6 rounded flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => {
                setError(null);
                fetchUserProgress();
              }}
              className="text-sm bg-red-600/30 hover:bg-red-600/50 px-3 py-1 rounded"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id}
              className="bg-surface-dark rounded-lg overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="p-6">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">{category.title}</h2>
                </div>
                
                {/* Category Description */}
                <p className="text-gray-400 text-sm mb-6">{category.description}</p>
                
                {/* Progress and Start Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-dark rounded-full flex items-center justify-center">
                      <span className="text-accent-lilac font-semibold">
                        {getCategoryProgress(category.id)}%
                      </span>
                    </div>
                    <span className="ml-3 text-gray-400 text-sm">Completed</span>
                  </div>
                  
                  <button
                    onClick={() => handleCategoryClick(category.id)}
                    className="px-6 py-2 bg-accent-lilac text-white rounded-lg hover:bg-accent-lilac/90 transition-colors text-sm font-medium"
                  >
                    Start
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
export { categories };