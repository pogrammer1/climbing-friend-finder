import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600">
              Ready to find your next climbing partner? Here's what's happening in your climbing community.
            </p>
          </div>

          {/* User Profile Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="font-medium">{user?.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Experience Level</p>
                <p className="font-medium capitalize">{user?.experience}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Climbing Types</p>
                <p className="font-medium">{user?.climbingType.join(', ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-blue-600 text-2xl mb-2">👥</div>
              <h3 className="font-semibold text-gray-800 mb-2">Find Partners</h3>
              <p className="text-sm text-gray-600 mb-4">
                Discover climbers in your area with similar preferences
              </p>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                onClick={() => navigate('/search')}
              >
                Start Searching
              </button>
            </div>

            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-green-600 text-2xl mb-2">📝</div>
              <h3 className="font-semibold text-gray-800 mb-2">Update Profile</h3>
              <p className="text-sm text-gray-600 mb-4">
                Keep your climbing preferences and availability current
              </p>
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                onClick={() => navigate('/profile')}
              >
                Edit Profile
              </button>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <div className="text-purple-600 text-2xl mb-2">💬</div>
              <h3 className="font-semibold text-gray-800 mb-2">Messages</h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect with potential climbing partners
              </p>
              <button
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                onClick={() => navigate('/messages')}
              >
                View Messages
              </button>
            </div>
          </div>

          {/* Coming Soon Features */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Coming Soon</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Real-time chat with climbing partners</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Climbing trip planning and coordination</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Gym and outdoor location recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 