import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebase';
import './ProfileEdit.css';

const ProfileEdit = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    displayName: currentUser?.user?.displayName || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(auth.currentUser, {
        displayName: formData.displayName
      });
      setSuccess('Name updated successfully!');
    } catch (err) {
      setError('Failed to update name: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        formData.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, formData.newPassword);
      
      setSuccess('Password updated successfully!');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else {
        setError('Failed to update password: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-edit-container">
      <h2>Edit Profile</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-section">
        <h3>Update Display Name</h3>
        <form onSubmit={handleNameUpdate}>
          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            Update Name
          </button>
        </form>
      </div>

      <div className="profile-section">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordUpdate}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <button type="submit" disabled={loading}>
            Update Password
          </button>
        </form>
      </div>

      <button className="back-button" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default ProfileEdit;
