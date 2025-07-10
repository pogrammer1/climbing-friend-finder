import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Profile Settings</h1>
            
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">Profile Management</h2>
                <p className="text-blue-700">
                  Profile editing functionality is coming soon! You'll be able to update your climbing preferences, 
                  availability, and personal information.
                </p>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Username</p>
                    <p className="font-medium">{user?.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">First Name</p>
                    <p className="font-medium">{user?.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Name</p>
                    <p className="font-medium">{user?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Experience Level</p>
                    <p className="font-medium capitalize">{user?.experience}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Climbing Types</p>
                    <p className="font-medium">{user?.climbingType.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Coming Soon</h3>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Edit personal information</li>
                  <li>• Update climbing preferences</li>
                  <li>• Change password</li>
                  <li>• Upload profile picture</li>
                  <li>• Set availability schedule</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 