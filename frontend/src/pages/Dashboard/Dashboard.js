import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Navbar from '../../components/Navbar/Navbar';
import Button from '../../components/Button/Button';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const DashboardCard = ({ title, children }) => (
  <motion.div
    className="dashboard-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <h2>{title}</h2>
    <div className="dashboard-card-content">
      {children}
    </div>
  </motion.div>
);

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const StatItem = ({ value, label }) => (
  <div className="stat-item">
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

StatItem.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Simulate API call
        const response = await new Promise(resolve => 
          setTimeout(() => resolve({
            name: "John Doe",
            email: "john@example.com",
            subscription: "Premium",
            credits: 150,
            queriesThisMonth: 45,
            recentActivity: [
              "Query about flight regulations",
              "Weather interpretation practice",
              "Navigation calculations"
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
  }, []);

  if (isLoading) return (
    <div className="loading-container">
      <div className="loading-ring"></div>
    </div>
  );
  if (error) return <div className="dashboard">Error: {error}</div>;
  if (!userData) return <div className="dashboard">No user data available</div>;

  return (
    <div className="dashboard">
      <Navbar />
      <div className="dashboard-container">
        <motion.div 
          className="dashboard-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Welcome back, {userData.name}</h1>
          <p>Manage your account and view your usage statistics</p>
        </motion.div>

        <div className="dashboard-grid">
          <DashboardCard title="Subscription">
            <p>Current Plan: <strong>{userData.subscription}</strong></p>
            <div className="stats-grid">
              <StatItem value={userData.credits} label="Credits Left" />
              <StatItem value={userData.queriesThisMonth} label="Queries This Month" />
            </div>
            <div style={{ marginTop: '20px' }}>
              <Button variant="primary">Upgrade Plan</Button>
            </div>
          </DashboardCard>

          <DashboardCard title="Account Settings">
            <p>Email: {userData.email}</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <Button variant="secondary">Edit Profile</Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate('/login');
                }}
              >
                Log Out
              </Button>
            </div>
          </DashboardCard>

          <DashboardCard title="Recent Activity">
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {userData.recentActivity.map((activity, index) => (
                <li key={index} style={{ marginBottom: '10px' }}>{activity}</li>
              ))}
            </ul>
          </DashboardCard>

          <DashboardCard title="Support">
            <p>Need help? Our support team is here for you.</p>
            <div style={{ marginTop: '20px' }}>
              <Button variant="secondary">Contact Support</Button>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
