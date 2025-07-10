import React, { useState } from 'react';

interface RegisterFormProps {
  onRegister: (userData: RegisterData) => void;
  isLoading?: boolean;
  error?: string;
  success?: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  climbingType: string[];
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, isLoading = false, error, success }) => {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    experience: 'beginner',
    climbingType: []
  });

  const [confirmPassword, setConfirmPassword] = useState('');

  const climbingTypeOptions = ['bouldering', 'sport', 'trad', 'gym', 'outdoor'];
  const experienceOptions = ['beginner', 'intermediate', 'advanced', 'expert'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== confirmPassword) {
      return; // TODO: Show password mismatch error
    }
    
    if (formData.climbingType.length === 0) {
      return; // TODO: Show climbing type required error
    }
    
    onRegister(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Join Climbing Friend Finder
      </h2>
      
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
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Choose a username"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        {/* First Name */}
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
            placeholder="Enter your first name"
          />
        </div>

        {/* Last Name */}
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
            placeholder="Enter your last name"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm your password"
          />
        </div>

        {/* Experience Level */}
        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
            Climbing Experience *
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

        {/* Climbing Types */}
        <div>
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
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm; 