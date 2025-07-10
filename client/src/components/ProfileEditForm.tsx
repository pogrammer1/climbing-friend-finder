import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProfileEditFormProps {
  onSave: (userData: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
  success?: string;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ 
  onSave, 
  onCancel, 
  isLoading = false, 
  error, 
  success 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    experience: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    climbingType: [] as string[],
    preferredGyms: [] as string[],
    availability: {
      weekdays: false,
      weekends: false,
      evenings: false
    }
  });

  const [newGym, setNewGym] = useState('');

  const climbingTypeOptions = ['bouldering', 'sport', 'trad', 'gym', 'outdoor'];
  const experienceOptions = ['beginner', 'intermediate', 'advanced', 'expert'];

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        location: user.location || '',
        experience: user.experience || 'beginner',
        climbingType: user.climbingType || [],
        preferredGyms: user.preferredGyms || [],
        availability: user.availability || {
          weekdays: false,
          weekends: false,
          evenings: false
        }
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClimbingTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      climbingType: prev.climbingType.includes(type)
        ? prev.climbingType.filter(t => t !== type)
        : [...prev.climbingType, type]
    }));
  };

  const handleAvailabilityChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: !prev.availability[day as keyof typeof prev.availability]
      }
    }));
  };

  const addGym = () => {
    if (newGym.trim() && !formData.preferredGyms.includes(newGym.trim())) {
      setFormData(prev => ({
        ...prev,
        preferredGyms: [...prev.preferredGyms, newGym.trim()]
      }));
      setNewGym('');
    }
  };

  const removeGym = (gym: string) => {
    setFormData(prev => ({
      ...prev,
      preferredGyms: prev.preferredGyms.filter(g => g !== gym)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, State or Country"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="mt-4">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              placeholder="Tell us about yourself and your climbing journey..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Climbing Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Climbing Information</h3>
          
          <div className="mb-4">
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
              Experience Level *
            </label>
            <select
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {experienceOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Climbing Types * (Select at least one)
            </label>
            <div className="space-y-2">
              {climbingTypeOptions.map(type => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.climbingType.includes(type)}
                    onChange={() => handleClimbingTypeChange(type)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Gyms
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newGym}
                onChange={(e) => setNewGym(e.target.value)}
                placeholder="Add a gym"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGym())}
              />
              <button
                type="button"
                onClick={addGym}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.preferredGyms.map(gym => (
                <span
                  key={gym}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {gym}
                  <button
                    type="button"
                    onClick={() => removeGym(gym)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability
            </label>
            <div className="space-y-2">
              {Object.entries(formData.availability).map(([day, available]) => (
                <label key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={() => handleAvailabilityChange(day)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 capitalize">{day}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-md transition-colors duration-200"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditForm; 