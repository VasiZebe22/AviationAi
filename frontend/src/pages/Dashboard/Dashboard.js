import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const DashboardCard = ({ title, children, className = '' }) => (
  <motion.div
    className={`bg-surface-dark rounded-lg shadow-lg backdrop-blur-sm bg-opacity-90 ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="border-b border-dark-lightest px-5 py-4">
      <h2 className="text-sm font-medium tracking-wide text-gray-300 uppercase">{title}</h2>
    </div>
    <div className="p-5">
      {children}
    </div>
  </motion.div>
);

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
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await new Promise(resolve => 
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
        setUserData(response);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load user data");
        setIsLoading(false);
      }
    };

    fetchUserData();
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

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Profile Card */}
            <DashboardCard title="Profile" className="lg:col-span-2">
              <ProfileSection userData={userData} onSave={handleProfileUpdate} />
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
