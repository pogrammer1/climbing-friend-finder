import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileEditForm from '../components/ProfileEditForm';

const Profile: React.FC = () => {
  const { user, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSaveProfile = async (userData: any) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh the page to show updated data
      window.location.reload();
      
    } catch (error: any) {
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {isEditing ? (
            <ProfileEditForm
              onSave={handleSaveProfile}
              onCancel={() => setIsEditing(false)}
              isLoading={isLoading}
              error={error}
              success={success}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Edit Profile
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Success Message */}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                    {success}
                  </div>
                )}

                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
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
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{user?.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-medium">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {user?.bio && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Bio</p>
                      <p className="font-medium">{user.bio}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Climbing Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Experience Level</p>
                      <p className="font-medium capitalize">{user?.experience}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Climbing Types</p>
                      <p className="font-medium">{user?.climbingType.join(', ')}</p>
                    </div>
                  </div>
                  
                  {user?.preferredGyms && user.preferredGyms.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Preferred Gyms</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {user.preferredGyms.map(gym => (
                          <span key={gym} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {gym}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {user?.availability && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Availability</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(user.availability).map(([day, available]) => (
                          available && (
                            <span key={day} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm capitalize">
                              {day}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 