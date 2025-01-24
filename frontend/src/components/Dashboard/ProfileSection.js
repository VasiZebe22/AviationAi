import React, { useState, useEffect } from 'react';
import { updateUserProfile, updateUserPassword } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

const ProfileSection = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when currentUser changes
  useEffect(() => {
    if (currentUser?.user) {
      setFormData(prev => ({
        ...prev,
        username: currentUser.user.displayName || ''
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username cannot be empty');
      return false;
    }
    
    if (formData.newPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setError('Current password is required to change password');
        return false;
      }
      if (formData.newPassword.length < 8) {
        setError('New password must be at least 8 characters long');
        return false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Update username if changed
      if (formData.username !== currentUser?.user?.displayName) {
        await updateUserProfile(formData.username);
      }

      // Update password if provided
      if (formData.newPassword) {
        await updateUserPassword(formData.currentPassword, formData.newPassword);
      }

      // Reset form and close edit mode
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if no user is logged in
  if (!currentUser?.user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-dark-lighter flex items-center justify-center text-2xl text-gray-400 font-medium">
              {formData.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-100">{formData.username}</h3>
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
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-dark-lighter text-gray-100 text-xs rounded-md border border-dark-lightest focus:ring-2 focus:ring-accent-lilac focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-dark-lighter text-gray-100 text-xs rounded-md border border-dark-lightest focus:ring-2 focus:ring-accent-lilac focus:border-transparent"
              required={!!formData.newPassword}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-dark-lighter text-gray-100 text-xs rounded-md border border-dark-lightest focus:ring-2 focus:ring-accent-lilac focus:border-transparent"
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-dark-lighter text-gray-100 text-xs rounded-md border border-dark-lightest focus:ring-2 focus:ring-accent-lilac focus:border-transparent"
              minLength={8}
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs">{error}</div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-accent-lilac hover:bg-accent-lilac-dark text-white text-xs rounded-md transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setError('');
                setFormData(prev => ({
                  ...prev,
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                }));
              }}
              className="px-4 py-2 bg-dark-lighter text-gray-300 hover:text-white text-xs rounded-md transition-colors duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileSection;
