import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  location: string;
  experience: string;
  climbingType: string[];
  availability: {
    weekdays: boolean;
    weekends: boolean;
    evenings: boolean;
  };
  bio: string;
  preferredGyms: string[];
  profilePicture?: string;
  climbingGrade: {
    bouldering?: string;
    sport?: string;
    trad?: string;
  };
  createdAt: string;
}

interface SearchFilters {
  location: string;
  experienceLevel: string;
  climbingTypes: string[];
  availability: string[];
}

interface SearchResults {
  users: User[];
  pagination: {
    current: number;
    total: number;
    hasMore: boolean;
  };
}

const Search: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    experienceLevel: '',
    climbingTypes: [],
    availability: []
  });
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const experienceLevels = [
    'beginner',
    'intermediate',
    'advanced',
    'expert'
  ];

  const climbingTypeOptions = [
    'bouldering',
    'sport',
    'trad',
    'gym',
    'outdoor'
  ];

  const availabilityOptions = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const searchUsers = async (page = 1) => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams();
      
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.experienceLevel) queryParams.append('experienceLevel', filters.experienceLevel);
      if (filters.climbingTypes.length > 0) {
        filters.climbingTypes.forEach(type => queryParams.append('climbingTypes', type));
      }
      if (filters.availability.length > 0) {
        filters.availability.forEach(day => queryParams.append('availability', day));
      }
      
      queryParams.append('page', page.toString());
      queryParams.append('limit', '10');

      const response = await fetch(`/api/users/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers(1);
  };

  const handlePageChange = (page: number) => {
    searchUsers(page);
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      experienceLevel: '',
      climbingTypes: [],
      availability: []
    });
    setResults(null);
  };

  const handleStartConversation = async (recipientId: string) => {
    try {
      const response = await fetch('/api/messages/start-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Navigate to messages page with the new conversation
        navigate('/messages');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Find Climbing Partners</h1>
          
          {/* Search Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Filters</h2>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="City, State"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={filters.experienceLevel}
                    onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any Level</option>
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                {/* Climbing Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Climbing Types
                  </label>
                  <select
                    multiple
                    value={filters.climbingTypes}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      handleFilterChange('climbingTypes', selected);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {climbingTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Days
                  </label>
                  <select
                    multiple
                    value={filters.availability}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      handleFilterChange('availability', selected);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availabilityOptions.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Clear Filters
                </button>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Search Results */}
          {results && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Search Results ({results.users.length} users found)
              </h2>
              
              {results.users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No climbing partners found matching your criteria.</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or expanding your search.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.users.map((user) => (
                    <div key={user._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Profile Picture */}
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                              {user.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={`${user.firstName} ${user.lastName}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">@{user.username}</p>
                          
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-700">
                                  <span className="font-medium">Location:</span> {user.location}
                                </p>
                                <p className="text-gray-700">
                                  <span className="font-medium">Experience:</span> {user.experience}
                                </p>
                                <p className="text-gray-700">
                                  <span className="font-medium">Climbing Types:</span> {user.climbingType.join(', ')}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-700">
                                  <span className="font-medium">Available:</span> {[
                                    user.availability.weekdays ? 'Weekdays' : '',
                                    user.availability.weekends ? 'Weekends' : '',
                                    user.availability.evenings ? 'Evenings' : ''
                                  ].filter(Boolean).join(', ')}
                                </p>
                                <p className="text-gray-700">
                                  <span className="font-medium">Preferred Gyms:</span> {user.preferredGyms.join(', ') || 'None specified'}
                                </p>
                              </div>
                            </div>
                            
                            {user.bio && (
                              <p className="text-gray-600 mt-2 text-sm">{user.bio}</p>
                            )}
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => handleStartConversation(user._id)}
                          className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {results.pagination.total > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex gap-2">
                    {Array.from({ length: results.pagination.total }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-md text-sm ${
                          page === results.pagination.current
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search; 