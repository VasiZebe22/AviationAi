import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import questionService from '../../services/questionService';

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

const Categories = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [mode, setMode] = useState('study');
  const [filters, setFilters] = useState({
    questionTypes: {
      all: true,
      withAnnexes: false,
      withoutAnnexes: false
    },
    realExamOnly: true,
    reviewQuestions: true,
    markedQuestions: true,
    unseenQuestions: true,
    incorrectlyAnswered: false,
    greenFlagged: false,
    yellowFlagged: false,
    redFlagged: false,
    showCorrectAnswers: false
  });

  useEffect(() => {
    fetchUserProgress();
  }, []);

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

  const handleCategoryClick = (categoryId) => {
    navigate(`/questions/${categoryId}`, {
      state: {
        mode,
        filters
      }
    });
  };

  const getCategoryProgress = (categoryId) => {
    if (!userProgress[categoryId]) return 0;
    return Math.round((userProgress[categoryId].completed / userProgress[categoryId].total) * 100);
  };

  const handleQuestionTypeChange = (type) => {
    // If clicking the currently selected option, do nothing
    if (filters.questionTypes[type] && Object.values(filters.questionTypes).filter(Boolean).length === 1) {
      return;
    }

    const newQuestionTypes = {
      all: false,
      withAnnexes: false,
      withoutAnnexes: false,
      [type]: true
    };
    setFilters(prev => ({
      ...prev,
      questionTypes: newQuestionTypes
    }));
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-lilac"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl text-gray-200 mb-8 text-center">Question Categories</h1>

        {/* Mode Selection */}
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

        {/* Filter Options */}
        <div className="bg-surface-dark rounded-lg p-6 mb-8 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question Type Selection */}
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => handleQuestionTypeChange('all')}
            >
              <input
                type="checkbox"
                checked={filters.questionTypes.all}
                onChange={() => {}}
                className="w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1"
              />
              <label className="ml-3 text-gray-300 cursor-pointer">All Questions</label>
            </div>
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => handleQuestionTypeChange('withAnnexes')}
            >
              <input
                type="checkbox"
                checked={filters.questionTypes.withAnnexes}
                onChange={() => {}}
                className={`w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1 
                  ${!filters.questionTypes.withAnnexes ? 'opacity-50' : ''}`}
              />
              <label className={`ml-3 text-gray-300 cursor-pointer ${!filters.questionTypes.withAnnexes ? 'opacity-50' : ''}`}>
                With Annexes
              </label>
            </div>
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => handleQuestionTypeChange('withoutAnnexes')}
            >
              <input
                type="checkbox"
                checked={filters.questionTypes.withoutAnnexes}
                onChange={() => {}}
                className={`w-4 h-4 text-accent-lilac bg-dark border-gray-700 rounded focus:ring-accent-lilac focus:ring-1 
                  ${!filters.questionTypes.withoutAnnexes ? 'opacity-50' : ''}`}
              />
              <label className={`ml-3 text-gray-300 cursor-pointer ${!filters.questionTypes.withoutAnnexes ? 'opacity-50' : ''}`}>
                Without Annexes
              </label>
            </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id}
              className="bg-surface-dark rounded-lg overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">{category.title}</h2>
                  <span className="text-sm text-gray-400">#{category.id}</span>
                </div>
                
                <p className="text-gray-400 text-sm mb-6">{category.description}</p>
                
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
