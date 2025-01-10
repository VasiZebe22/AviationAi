import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Radar, Bar } from 'react-chartjs-2';
import questionService from '../../services/questionService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardCard = ({ title, children, className = '', dashboard = null }) => {
  const handleResetStudyTime = async () => {
    if (!dashboard) return;
    const { showToast, setIsLoading, setProgressData } = dashboard;

    if (window.confirm('Are you sure you want to reset your study time stats? This cannot be undone.')) {
      try {
        setIsLoading(true);
        await questionService.resetStudyTime();
        showToast('success', 'Study time stats have been reset');
        // Refresh all dashboard data to ensure consistency
        const stats = await questionService.getDashboardStats();
        setProgressData(prev => ({
          ...prev,
          studyTime: stats.studyTime
        }));
      } catch (error) {
        showToast('error', 'Failed to reset study time stats');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResetAllProgress = async () => {
    if (!dashboard) return;
    const { showToast, setIsLoading, setProgressData } = dashboard;

    if (window.confirm('Are you sure you want to reset all progress? This action cannot be undone and will delete all your progress data.')) {
      try {
        setIsLoading(true);
        await questionService.resetAllProgress();
        showToast('success', 'All progress has been reset');
        
        // Refresh all dashboard data
        const stats = await questionService.getDashboardStats();
        setProgressData({
          monthlyProgress: stats.monthlyProgress,
          performance: {
            correct: stats.correctAnswers,
            incorrect: stats.incorrectAnswers
          },
          categoryProgress: Object.entries(stats.byCategory).map(([code, data]) => ({
            code,
            name: data.name,
            total: data.total,
            correct: data.correct,
            percentage: Math.round((data.correct / data.total) * 100) || 0
          })),
          skillsBreakdown: Object.entries(stats.byCategory)
            .filter(([_, data]) => data.skillScore !== undefined)
            .map(([code, data]) => ({
              code,
              name: data.name,
              skillScore: data.skillScore || 0
            })),
          byCategory: stats.byCategory,
          studyTime: stats.studyTime
        });
      } catch (error) {
        showToast('error', 'Failed to reset progress');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <motion.div
      className={`bg-surface-dark rounded-lg shadow-lg backdrop-blur-sm bg-opacity-90 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border-b border-dark-lightest px-5 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium tracking-wide text-gray-300 uppercase">{title}</h2>
          {title === "Learning Progress" && dashboard && (
            <div className="relative group">
              <button className="p-1 text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
              <div className="absolute hidden group-hover:block right-0 mt-2 w-48 bg-dark-lighter rounded-lg shadow-lg border border-gray-700 z-50">
                <div className="py-1">
                  <button
                    onClick={handleResetStudyTime}
                    className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-dark-lightest hover:text-white text-left"
                  >
                    Reset Study Time Stats
                  </button>
                  <button
                    onClick={handleResetAllProgress}
                    className="w-full px-4 py-2 text-sm text-red-400 hover:bg-dark-lightest hover:text-red-300 text-left"
                  >
                    Reset All Progress
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </motion.div>
  );
};

const StatItem = ({ value, label, trend }) => (
  <div className="flex flex-col p-4 bg-dark bg-opacity-50 rounded-lg">
    <div className="flex items-baseline justify-between">
      <span className="text-2xl font-semibold text-gray-100">{value}</span>
      {trend && (
        <span className={`text-xs font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="text-xs font-medium text-gray-400 mt-1">{label}</div>
  </div>
);

const ProfileSection = ({ userData, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userData.name.split(' ')[0] || '',
    lastName: userData.name.split(' ')[1] || '',
    email: userData.email,
    timezone: userData.timezone || 'UTC',
    notifications: userData.notifications || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-dark-lighter flex items-center justify-center text-2xl text-gray-400 font-medium">
              {formData.firstName[0]}{formData.lastName[0]}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-100">{formData.firstName} {formData.lastName}</h3>
              <p className="text-xs text-gray-400">{formData.email}</p>
              <p className="text-xs text-gray-500 mt-1">Timezone: {formData.timezone}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-accent-lilac hover:text-accent-lilac-dark transition-colors duration-200"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-dark-lighter text-gray-100 text-xs rounded-md border border-dark-lightest focus:ring-2 focus:ring-accent-lilac focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-dark-lighter text-gray-100 text-xs rounded-md border border-dark-lightest focus:ring-2 focus:ring-accent-lilac focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-dark-lighter text-gray-100 text-xs rounded-md border border-dark-lightest focus:ring-2 focus:ring-accent-lilac focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Timezone
            </label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-dark-lighter text-gray-100 text-xs rounded-md border border-dark-lightest focus:ring-2 focus:ring-accent-lilac focus:border-transparent"
            >
              <option value="UTC">UTC</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
              <option value="GMT">GMT</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="notifications"
              id="notifications"
              checked={formData.notifications}
              onChange={handleChange}
              className="h-4 w-4 rounded border-dark-lightest bg-dark-lighter text-accent-lilac focus:ring-accent-lilac"
            />
            <label htmlFor="notifications" className="text-xs text-gray-300">
              Receive email notifications
            </label>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="px-4 py-2 bg-accent-lilac hover:bg-accent-lilac-dark text-white text-xs font-medium rounded-md transition-colors duration-200"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-dark-lighter hover:bg-dark-lightest text-gray-300 text-xs font-medium rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedOverviewCategory, setSelectedOverviewCategory] = useState('all');
  const [selectedPerformanceCategory, setSelectedPerformanceCategory] = useState('all');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await new Promise(resolve => 
          setTimeout(() => resolve({
            name: currentUser?.displayName || "User",
            email: currentUser?.email || "",
            subscription: "Premium",
            credits: 150,
            queriesThisMonth: 45,
            creditUsage: 15,
            timezone: "UTC",
            notifications: true,
            recentActivity: [
              { action: "Query about flight regulations", time: "2 hours ago" },
              { action: "Weather interpretation practice", time: "5 hours ago" },
              { action: "Navigation calculations", time: "1 day ago" }
            ]
          }), 1000)
        );
        setUserData(userResponse);

        // Fetch all dashboard stats at once
        const stats = await questionService.getDashboardStats();
        
        // Process stats for charts
        const progressStats = {
          monthlyProgress: stats.monthlyProgress,
          performance: {
            correct: stats.correctAnswers,
            incorrect: stats.incorrectAnswers
          },
          categoryProgress: Object.entries(stats.byCategory).map(([code, data]) => ({
            code,
            name: data.name,
            total: data.total,
            correct: data.correct,
            percentage: Math.round((data.correct / data.total) * 100) || 0
          })),
          skillsBreakdown: Object.entries(stats.byCategory)
            .filter(([_, data]) => data.skillScore !== undefined)
            .map(([code, data]) => ({
              code,
              name: data.name,
              skillScore: data.skillScore || 0
            })),
          byCategory: stats.byCategory,
          studyTime: stats.studyTime
        };

        setProgressData(progressStats);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load user data");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      showToast('error', 'Failed to log out');
    }
  };

  const handleProfileUpdate = async (data) => {
    try {
      // Here you would typically make an API call to update the user's profile
      setUserData(prev => ({
        ...prev,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        timezone: data.timezone,
        notifications: data.notifications,
      }));
      showToast('success', 'Profile updated successfully');
    } catch (error) {
      showToast('error', 'Failed to update profile');
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-dark p-4">
      <div className="bg-red-900/50 text-red-200 p-3 rounded-lg text-xs">
        Error: {error}
      </div>
    </div>
  );

  if (!userData) return (
    <div className="min-h-screen bg-dark p-4">
      <div className="bg-surface-dark p-3 rounded-lg text-gray-400 text-xs">
        No user data available
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
        <div className="flex flex-col space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-medium text-gray-100">Dashboard</h1>
              <p className="text-xs text-gray-400 mt-0.5">Manage your account and view activity</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-dark-lighter text-xs text-gray-300 rounded-md hover:bg-dark-lightest transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>

          {/* Progress Section */}
          <DashboardCard 
            title="Learning Progress" 
            className="lg:col-span-3"
            dashboard={{
              showToast,
              setIsLoading,
              setProgressData
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Learning Overview Chart */}
              <div className="lg:col-span-2 bg-surface-dark/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-300">Learning Overview</h3>
                  <select
                    className="bg-dark text-gray-300 text-sm rounded px-3 py-1 border border-gray-700 w-36"
                    onChange={(e) => setSelectedOverviewCategory(e.target.value)}
                    value={selectedOverviewCategory}
                  >
                    <option value="all">All Categories</option>
                    {progressData?.monthlyProgress.categories.map(cat => (
                      <option key={cat.code} value={cat.code}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="h-[200px]">
                  <Line
                    data={{
                      labels: progressData?.monthlyProgress.months.map(m => {
                        const [year, month] = m.month.split('-');
                        return new Date(year, month - 1).toLocaleString('default', { month: 'short' });
                      }) || [],
                      datasets: [
                        {
                          label: 'Correct Answers',
                          data: progressData?.monthlyProgress.months.map(m => {
                            if (selectedOverviewCategory === 'all') {
                              return m.correct;
                            }
                            const categoryData = m.byCategory.find(c => c.code === selectedOverviewCategory);
                            return categoryData ? categoryData.correct : 0;
                          }) || [],
                          borderColor: '#10B981', // green
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          fill: true,
                          tension: 0.4
                        },
                        {
                          label: 'Incorrect Answers',
                          data: progressData?.monthlyProgress.months.map(m => {
                            if (selectedOverviewCategory === 'all') {
                              return m.incorrect;
                            }
                            const categoryData = m.byCategory.find(c => c.code === selectedOverviewCategory);
                            return categoryData ? categoryData.incorrect : 0;
                          }) || [],
                          borderColor: '#EF4444', // red
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          fill: true,
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          },
                          ticks: {
                            color: '#9CA3AF'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            color: '#9CA3AF'
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: true,
                          position: 'top',
                          labels: {
                            color: '#9CA3AF',
                            usePointStyle: true,
                            padding: 20
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Average Performance */}
              <div className="bg-surface-dark/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-300">Average Performance</h3>
                  <select
                    className="bg-dark text-gray-300 text-sm rounded px-3 py-1 border border-gray-700 w-36"
                    onChange={(e) => setSelectedPerformanceCategory(e.target.value)}
                    value={selectedPerformanceCategory}
                  >
                    <option value="all">All Categories</option>
                    {progressData?.monthlyProgress.categories.map(cat => (
                      <option key={cat.code} value={cat.code}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="h-[200px] flex items-center justify-center">
                  <Doughnut
                    data={{
                      labels: ['Correct', 'Incorrect'],
                      datasets: [{
                        data: [
                          selectedPerformanceCategory === 'all' 
                            ? progressData?.performance.correct || 0
                            : progressData?.byCategory[selectedPerformanceCategory]?.correct || 0,
                          selectedPerformanceCategory === 'all'
                            ? progressData?.performance.incorrect || 0
                            : (progressData?.byCategory[selectedPerformanceCategory]?.total || 0) - (progressData?.byCategory[selectedPerformanceCategory]?.correct || 0)
                        ],
                        backgroundColor: [
                          '#8B5CF6',
                          'rgba(139, 92, 246, 0.1)'
                        ],
                        borderWidth: 0
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '75%',
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                  <div className="absolute text-2xl font-bold text-white">
                    {progressData ? 
                      selectedPerformanceCategory === 'all' 
                        ? Math.round((progressData.performance.correct / (progressData.performance.correct + progressData.performance.incorrect)) * 100)
                        : Math.round((progressData.byCategory[selectedPerformanceCategory]?.correct || 0) / (progressData.byCategory[selectedPerformanceCategory]?.total || 1) * 100)
                    : 0}%
                  </div>
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="bg-surface-dark/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-300">Skills Analysis</h3>
                  <div className="group relative">
                    <div className="text-xs text-gray-400 cursor-help">Based on multiple factors</div>
                    <div className="absolute hidden group-hover:block w-64 p-4 mt-2 right-0 bg-dark-lighter rounded-lg shadow-lg border border-gray-700 z-10">
                      <div className="text-xs space-y-2">
                        <div className="font-medium text-gray-300 mb-2">Skill Score Components:</div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-400">Accuracy (40%): Basic correct rate</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-400">Consistency (30%): Recent improvements</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-gray-400">Speed (15%): Answer time progress</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-400">Retention (15%): Long-term memory</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-[200px]">
                  <Radar
                    data={{
                      labels: progressData?.skillsBreakdown.map(skill => skill.name) || [],
                      datasets: [{
                        label: 'Skill Level',
                        data: progressData?.skillsBreakdown.map(skill => skill.skillScore) || [],
                        backgroundColor: 'rgba(16, 185, 129, 0.2)', // green
                        borderColor: '#10B981',
                        pointBackgroundColor: '#10B981',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#10B981',
                        borderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        r: {
                          angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          },
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          },
                          pointLabels: {
                            color: '#9CA3AF'
                          },
                          ticks: {
                            display: false
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Study Time */}
              <div className="bg-surface-dark/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Daily Study Time</h3>
                <div className="h-[200px]">
                  <Bar
                    data={{
                      labels: progressData?.studyTime?.labels || [],
                      datasets: [{
                        label: 'Hours',
                        data: progressData?.studyTime?.data.map(time => Math.round(time * 10) / 10) || [],
                        backgroundColor: '#8B5CF6'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          },
                          ticks: {
                            color: '#9CA3AF'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            color: '#9CA3AF'
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Wrong Answers */}
              <div className="bg-surface-dark/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Questions to Review</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-red-500">
                      {progressData?.performance.incorrect || 0}
                    </span>
                    <span className="text-sm text-gray-400">Questions</span>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/questions/all', { 
                        state: { 
                          mode: 'practice',
                          filters: { 
                            incorrectlyAnswered: true
                          },
                          title: 'Practice Wrong Answers'
                        } 
                      });
                    }}
                    className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors duration-200 flex items-center justify-between"
                  >
                    <span>Practice Wrong Answers</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  <div className="text-xs text-gray-500">
                    Focus on these questions to improve your performance
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Profile Card */}
            <DashboardCard title="Profile" className="lg:col-span-2">
              <ProfileSection userData={userData} onSave={handleProfileUpdate} />
            </DashboardCard>

            {/* Practice Card */}
            <DashboardCard title="Practice Questions">
              <div className="space-y-4">
                <div className="text-sm text-gray-300 mb-4">
                  Test your knowledge across different aviation topics
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => navigate('/practice')}
                    className="w-full px-4 py-3 bg-accent-lilac hover:bg-accent-lilac-light text-white rounded-lg transition-colors duration-200 flex items-center justify-between group"
                  >
                    <span>Start Practice</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  {userData.recentActivity
                    .filter(activity => activity.action.toLowerCase().includes('practice'))
                    .map((activity, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{activity.action}</span>
                        <span className="text-gray-500">{activity.time}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </DashboardCard>

            {/* Overview Card */}
            <DashboardCard title="Overview">
              <div className="space-y-4">
                <StatItem value={userData.subscription} label="Current Plan" trend={0} />
                <StatItem value={userData.credits} label="Credits Available" trend={-5} />
                <StatItem value={userData.queriesThisMonth} label="Queries This Month" trend={12} />
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-400">Credit Usage</span>
                  <span className="text-xs font-medium text-gray-400">{userData.creditUsage}%</span>
                </div>
                <div className="w-full bg-dark rounded-full h-1.5">
                  <div 
                    className="bg-accent-lilac h-1.5 rounded-full"
                    style={{ width: `${userData.creditUsage}%` }}
                  />
                </div>
              </div>
            </DashboardCard>

            {/* Quick Actions Card */}
            <DashboardCard title="Quick Actions">
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full px-4 py-2.5 bg-accent-lilac text-xs font-medium text-white rounded-md hover:bg-accent-lilac-dark transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>New Conversation</span>
                </button>
                <button
                  onClick={() => navigate('/features')}
                  className="w-full px-4 py-2.5 bg-dark text-xs font-medium text-gray-300 rounded-md hover:bg-dark-lighter transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Explore Features</span>
                </button>
              </div>
            </DashboardCard>

            {/* Recent Activity Card */}
            <DashboardCard title="Recent Activity" className="lg:col-span-3">
              <div className="space-y-3">
                {userData.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-dark bg-opacity-50 rounded-md hover:bg-dark-lighter transition-colors duration-200"
                  >
                    <span className="text-sm text-gray-300">{activity.action}</span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
