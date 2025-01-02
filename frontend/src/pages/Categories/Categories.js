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
    navigate(`/questions/${categoryId}`);
  };

  const getCategoryProgress = (categoryId) => {
    if (!userProgress[categoryId]) return 0;
    return Math.round((userProgress[categoryId].completed / userProgress[categoryId].total) * 100);
  };

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
