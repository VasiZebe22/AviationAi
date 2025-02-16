import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import DashboardCard from '../../components/Dashboard/DashboardCard';
import StatItem from '../../components/Dashboard/StatItem';
import ProfileSection from '../../components/Dashboard/ProfileSection';
import LearningOverviewChart from '../../components/Dashboard/charts/LearningOverviewChart';
import PerformanceChart from '../../components/Dashboard/charts/PerformanceChart';
import SkillsAnalysisChart from '../../components/Dashboard/charts/SkillsAnalysisChart';
import StudyTimeChart from '../../components/Dashboard/charts/StudyTimeChart';
import QuestionsToReview from '../../components/Dashboard/QuestionsToReview';
import RecentSavedTests from '../../components/Dashboard/RecentSavedTests';
import { analyticsService } from '../../services/analytics';

// Register Chart.js components
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const [progressData, setProgressData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadData = async (forceRefresh = false) => {
    try {
      setIsRefreshing(forceRefresh);
      const data = forceRefresh 
        ? await analyticsService.refreshUserProgress(currentUser.uid)
        : await analyticsService.getUserProgress(currentUser.uid);
      
      setProgressData(data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      showToast('error', 'Failed to load dashboard data');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.uid]);

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
      showToast('success', 'Profile updated successfully');
    } catch (error) {
      showToast('error', 'Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
        <div className="flex justify-between items-center mb-6">
        </div>
        
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
          <div className="bg-dark-lighter rounded-lg p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
              <h2 className="text-gray-100 uppercase text-sm font-medium tracking-wider">Learning Progress</h2>
              <button
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="px-3 py-1.5 bg-dark-lighter text-xs text-gray-300 rounded-md hover:bg-dark-lightest transition-colors duration-200 flex items-center gap-2"
              >
                <svg
                  className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <LearningOverviewChart 
                progressData={progressData} 
                selectedCategory={{
                  value: selectedCategory,
                  setter: setSelectedCategory
                }}
                isLoading={isRefreshing}
              />
              <PerformanceChart 
                progressData={progressData}
                selectedCategory={{
                  value: selectedCategory,
                  setter: setSelectedCategory
                }}
                isLoading={isRefreshing}
              />
              <SkillsAnalysisChart 
                progressData={progressData} 
                isLoading={isRefreshing}
              />
              <StudyTimeChart 
                progressData={progressData}
                isLoading={isRefreshing}
              />
              <QuestionsToReview progressData={progressData} isLoading={isRefreshing} />
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Profile Card */}
            <DashboardCard title="Profile" className="lg:col-span-2">
              <ProfileSection userData={{
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
              }} onSave={handleProfileUpdate} />
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
                  {[{ action: "Query about flight regulations", time: "2 hours ago" },
                  { action: "Weather interpretation practice", time: "5 hours ago" },
                  { action: "Navigation calculations", time: "1 day ago" }].filter(activity => activity.action.toLowerCase().includes('practice'))
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
                <StatItem value="Premium" label="Current Plan" trend={0} />
                <StatItem value={150} label="Credits Available" trend={-5} />
                <StatItem value={45} label="Queries This Month" trend={12} />
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-400">Credit Usage</span>
                  <span className="text-xs font-medium text-gray-400">15%</span>
                </div>
                <div className="w-full bg-dark rounded-full h-1.5">
                  <div 
                    className="bg-accent-lilac h-1.5 rounded-full"
                    style={{ width: `15%` }}
                  />
                </div>
              </div>
            </DashboardCard>

            {/* Quick Actions Card */}
            <DashboardCard title="Quick Actions">
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/chat')}
                  className="w-full px-4 py-2.5 bg-accent-lilac text-xs font-medium text-white rounded-md hover:bg-accent-lilac-light transition-colors duration-200 flex items-center justify-center space-x-2"
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

                {/* Recent Saved Tests Section */}
                <div className="mt-4 pt-4 border-t border-dark-lighter">
                  <h3 className="text-xs font-medium text-gray-400 mb-3">Recent Tests</h3>
                  <RecentSavedTests />
                  <button
                    onClick={() => navigate('/saved-tests')}
                    className="w-full mt-2 px-4 py-2 text-xs text-gray-400 hover:text-gray-300 transition-colors duration-200 flex items-center justify-center"
                  >
                    View All Saved Tests
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </DashboardCard>

            {/* Recent Activity Card */}
            <DashboardCard title="Recent Activity" className="lg:col-span-3">
              <div className="space-y-3">
                {[{ action: "Query about flight regulations", time: "2 hours ago" },
                { action: "Weather interpretation practice", time: "5 hours ago" },
                { action: "Navigation calculations", time: "1 day ago" }].map((activity, index) => (
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
