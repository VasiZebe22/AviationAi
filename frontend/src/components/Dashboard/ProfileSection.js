import React, { useState } from 'react';

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

export default ProfileSection;
