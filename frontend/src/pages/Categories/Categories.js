import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import questionService from '../../services/questionService';
import CategoryCard from '../../components/CategoryCard';
import SavedTestsModal from '../../components/SavedTests/SavedTestsModal';

/**
 * Array of ATPL question categories with their metadata
 * Each category contains:
 * - id: Unique identifier for the category (e.g., '010' for Air Law)
 * - title: Display name of the category
 * - description: Brief explanation of the category content
 * - image: Path to the category's illustration image
 * - subcategories: Array of subcategories with their codes and names
 */
const categories = [
  {
    id: '010',
    title: 'Air Law',
    description: 'Aviation laws, regulations and procedures',
    image: '/images/categories/regulations.jpg',
    subcategories: [
      { code: '010-01', name: 'International Law' },
      { code: '010-02', name: 'Airworthiness of Aircraft' },
      { code: '010-03', name: 'Aircraft Nationality and Registration Marks' },
      { code: '010-04', name: 'Personnel Licensing' },
      { code: '010-05', name: 'Rules of the Air' },
      { code: '010-06', name: 'Air Traffic Services and Air Traffic Management' },
      { code: '010-07', name: 'Aerodromes' },
      { code: '010-08', name: 'Facilitation' },
      { code: '010-09', name: 'Search and Rescue' },
      { code: '010-10', name: 'Security' },
      { code: '010-11', name: 'Aircraft Accident Investigation' },
      { code: '010-12', name: 'Air Law - National Law' }
    ]
  },
  {
    id: '021',
    title: 'Airframe and Systems',
    description: 'Aircraft structure, systems, and power plants',
    image: '/images/categories/systems.jpg',
    subcategories: [
      { code: '021-01', name: 'System Design, Loads, Stresses, Maintenance' },
      { code: '021-02', name: 'Airframe' },
      { code: '021-03', name: 'Hydraulics' },
      { code: '021-04', name: 'Landing Gear, Wheels, Tires, Brakes' },
      { code: '021-05', name: 'Flight Controls' },
      { code: '021-06', name: 'Pneumatics - Pressurization and Air Conditioning' },
      { code: '021-07', name: 'Anti and De-icing Systems' },
      { code: '021-08', name: 'Fuel System' },
      { code: '021-09', name: 'Electrics' },
      { code: '021-10', name: 'Piston Engines' },
      { code: '021-11', name: 'Turbine Engines' },
      { code: '021-12', name: 'Protection and Detection Systems' },
      { code: '021-13', name: 'Oxygen Systems' }
    ]
  },
  {
    id: '022',
    title: 'Instrumentation',
    description: 'Aircraft instruments and electronics',
    image: '/images/categories/systems.jpg',
    subcategories: [
      { code: '022-01', name: 'Sensors and Instruments' },
      { code: '022-02', name: 'Measurement of Air Data Parameters' },
      { code: '022-03', name: 'Magnetism - Direct Reading Compass and Flux Valve' },
      { code: '022-04', name: 'Gyroscopic Instruments' },
      { code: '022-05', name: 'Inertial Navigation and Reference Systems' },
      { code: '022-06', name: 'Aircraft Equipment and Systems' },
      { code: '022-07', name: 'Electronic Displays' },
      { code: '022-08', name: 'Servomechanisms' }
    ]
  },
  {
    id: '031',
    title: 'Mass and Balance',
    description: 'Weight, balance, and loading',
    image: '/images/categories/general.jpg',
    subcategories: [
      { code: '031-01', name: 'Purpose of Mass and Balance Considerations' },
      { code: '031-02', name: 'Loading' },
      { code: '031-03', name: 'Fundamentals of CG Calculations' },
      { code: '031-04', name: 'Mass and Balance Details of Aircraft' },
      { code: '031-05', name: 'Determination of CG Position' },
      { code: '031-06', name: 'Cargo Handling' }
    ]
  },
  {
    id: '032',
    title: 'Performance',
    description: 'Aircraft performance and flight planning',
    image: '/images/categories/general.jpg',
    subcategories: [
      { code: '032-01', name: 'General Performance Theory' },
      { code: '032-02', name: 'Performance Class B - Single Engine' },
      { code: '032-03', name: 'Performance Class B - Multi Engine' },
      { code: '032-04', name: 'Performance Class A' }
    ]
  },
  {
    id: '033',
    title: 'Flight Planning',
    description: 'Navigation and route planning',
    image: '/images/categories/navigation.jpg',
    subcategories: [
      { code: '033-01', name: 'Flight Planning for VFR Flights' },
      { code: '033-02', name: 'Flight Planning for IFR Flights' },
      { code: '033-03', name: 'Fuel Planning' },
      { code: '033-04', name: 'Pre-flight Preparation' },
      { code: '033-05', name: 'ATS Flight Plan' }
    ]
  },
  {
    id: '034',
    title: 'Performance - Helicopters',
    description: 'Helicopter-specific performance considerations',
    image: '/images/categories/helicopter.jpg',
    subcategories: [
      { code: '034-01', name: 'General Performance Theory' },
      { code: '034-02', name: 'Performance Class 3 Single Engine Helicopters' },
      { code: '034-03', name: 'Performance Class 2' },
      { code: '034-04', name: 'Performance Class 1 Helicopters Certified in the Transport Category' }
    ]
  },
  {
    id: '040',
    title: 'Human Performance',
    description: 'Human factors and limitations',
    image: '/images/categories/general.jpg',
    subcategories: [
      { code: '040-01', name: 'Human Factors: Basic Concepts' },
      { code: '040-02', name: 'Basic Aviation Physiology and Health Maintenance' },
      { code: '040-03', name: 'Basic Aviation Psychology' }
    ]
  },
  {
    id: '050',
    title: 'Meteorology',
    description: 'Weather and atmospheric conditions',
    image: '/images/categories/weather.jpg',
    subcategories: [
      { code: '050-01', name: 'The Atmosphere' },
      { code: '050-02', name: 'Wind' },
      { code: '050-03', name: 'Thermodynamics' },
      { code: '050-04', name: 'Clouds and Fog' },
      { code: '050-05', name: 'Precipitation' },
      { code: '050-06', name: 'Air Masses and Fronts' },
      { code: '050-07', name: 'Pressure Systems' },
      { code: '050-08', name: 'Climatology' },
      { code: '050-09', name: 'Flight Hazards' },
      { code: '050-10', name: 'Meteorological Information' }
    ]
  },
  {
    id: '061',
    title: 'General Navigation',
    description: 'Basic navigation principles and methods',
    image: '/images/categories/navigation.jpg',
    subcategories: [
      { code: '061-01', name: 'Basics of Navigation' },
      { code: '061-02', name: 'Magnetism and Compasses' },
      { code: '061-03', name: 'Charts' },
      { code: '061-04', name: 'Dead Reckoning Navigation' },
      { code: '061-05', name: 'In-Flight Navigation' }
    ]
  },
  {
    id: '062',
    title: 'Radio Navigation',
    description: 'Radio navigation systems and procedures',
    image: '/images/categories/navigation.jpg',
    subcategories: [
      { code: '062-01', name: 'Basic Radio Propagation Theory' },
      { code: '062-02', name: 'Radio Aids' },
      { code: '062-03', name: 'Radar' },
      { code: '062-04', name: 'Area Navigation Systems' },
      { code: '062-05', name: 'Satellite Navigation Systems' },
      { code: '062-06', name: 'PBN' }
    ]
  },
  {
    id: '070',
    title: 'Operational Procedures',
    description: 'Standard operating procedures and safety',
    image: '/images/categories/operations.jpg',
    subcategories: [
      { code: '070-01', name: 'General Requirements' },
      { code: '070-02', name: 'Special Operational Procedures and Hazards (General Aspects)' },
      { code: '070-03', name: 'Emergency Procedures' }
    ]
  },
  {
    id: '081',
    title: 'Principles of Flight',
    description: 'Aerodynamics and flight mechanics',
    image: '/images/categories/principles.jpg',
    subcategories: [
      { code: '081-01', name: 'Subsonic Aerodynamics' },
      { code: '081-02', name: 'High Speed Aerodynamics' },
      { code: '081-03', name: 'Types of Aircraft' },
      { code: '081-04', name: 'Flight Mechanics' },
      { code: '081-05', name: 'Flight Stability' },
      { code: '081-06', name: 'Flight Control' },
      { code: '081-07', name: 'Limitations' },
      { code: '081-08', name: 'Propellers' }
    ]
  },
  // ... other categories with their subcategories
];

/**
 * Categories Component
 * Main component for displaying and managing ATPL question categories
 * Features:
 * - Study/Exam mode selection
 * - Question filtering options
 * - Category progress tracking
 * - Navigation to specific question sets
 * - Subcategory selection and filtering
 */
const Categories = () => {
  const navigate = useNavigate();
  
  // State Management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [mode, setMode] = useState('study');
  const [selectedSubcategories, setSelectedSubcategories] = useState({});
  const [isSavedTestsOpen, setIsSavedTestsOpen] = useState(false);

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
      const stats = await questionService.getBasicStats();
      const progressByCategory = {};
      Object.entries(stats.byCategory).forEach(([code, data]) => {
        progressByCategory[code] = {
          total: data.total,
          attempted: data.attempted,
          correct: data.correct
        };
      });
      setUserProgress(progressByCategory);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles navigation to questions page when a category is selected
   * Includes selected subcategories in the navigation state
   * @param {string} categoryId - The ID of the selected category
   */
  const handleCategoryStart = (categoryId) => {
    navigate(`/questions/${categoryId}`, {
      state: {
        mode,
        filters,
        selectedSubcategories: selectedSubcategories[categoryId] || []
      }
    });
  };

  /**
   * Calculates the completion percentage for a given category
   * @param {string} categoryId - The ID of the category
   * @returns {number} Percentage of completed questions (0-100)
   */
  const getCategoryProgress = (categoryId) => {
    const progress = userProgress[categoryId];
    if (!progress || !progress.total) return 'NaN';
    return Math.round((progress.attempted / progress.total) * 100);
  };

  const getCategoryCompletion = (categoryId) => {
    const progress = userProgress[categoryId];
    if (!progress) return 'No Questions Attempted';
    return `${progress.attempted}/${progress.total} Questions`;
  };

  /**
   * Handles subcategory selection for a category
   * @param {string} categoryId - The ID of the category
   * @param {string} subcategoryCode - The code of the selected subcategory
   */
  const handleSubcategoryChange = (categoryId, subcategoryCode) => {
    setSelectedSubcategories(prev => {
      const currentSelected = prev[categoryId] || [];
      const newSelected = currentSelected.includes(subcategoryCode)
        ? currentSelected.filter(code => code !== subcategoryCode)
        : [...currentSelected, subcategoryCode];
      
      return {
        ...prev,
        [categoryId]: newSelected
      };
    });
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
        {/* Navigation Buttons */}
        <div className="absolute right-0 top-1 flex gap-3">
          <button
            onClick={() => setIsSavedTestsOpen(true)}
            className="px-6 py-2.5 bg-accent-lilac text-white rounded-lg hover:bg-accent-lilac/90 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Saved Tests
          </button>

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

        {/* Saved Tests Modal */}
        <SavedTestsModal
          isOpen={isSavedTestsOpen}
          onClose={() => setIsSavedTestsOpen(false)}
        />
    
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
                checked={filters.reviewQuestions}
                onChange={(e) => setFilters({ ...filters, reviewQuestions: e.target.checked })}
                className="w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1"
              />
              <label className="ml-3 text-gray-300">Review Questions</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={filters.markedQuestions}
                onChange={(e) => setFilters({ ...filters, markedQuestions: e.target.checked })}
                className="w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1"
              />
              <label className="ml-3 text-gray-300">Marked Questions</label>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative isolate">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              progress={getCategoryProgress(category.id)}
              completion={getCategoryCompletion(category.id)}
              onStart={handleCategoryStart}
              selectedSubcategories={selectedSubcategories[category.id]}
              onSubcategoryChange={handleSubcategoryChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
export { categories };
