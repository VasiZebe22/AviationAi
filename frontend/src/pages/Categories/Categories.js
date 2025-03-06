import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../../services/analytics';
import CategoryCard from '../../components/CategoryCard';
import SavedTestsModal from '../../components/SavedTests/SavedTestsModal';
import Navbar from '../../components/Navbar/Navbar';
import FilterPanel from '../../components/FilterPanel';
import ModeSelector from '../../components/ModeSelector';
import categories from '../../data/categoryData';

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
      const stats = await analyticsService.getBasicStats();
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

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-lilac"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-16">
        <div className="max-w-6xl mx-auto p-4 relative">
          {/* Saved Tests Modal */}
          <SavedTestsModal
            isOpen={isSavedTestsOpen}
            onClose={() => setIsSavedTestsOpen(false)}
          />
      
          {/* Add spacing without the header */}
          <div className="h-8"></div>

          {/* Mode Selection - Study or Exam */}
          <ModeSelector mode={mode} setMode={setMode} />

          {/* Filter Options Panel */}
          <FilterPanel filters={filters} setFilters={setFilters} />
        
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
    </>
  );
};

export default Categories;
export { categories };
