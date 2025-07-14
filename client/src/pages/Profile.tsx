import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileEditForm from '../components/ProfileEditForm';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

const Profile: React.FC = () => {
  const { user, token } = useAuth();
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const isOwnProfile = !userId || (user && userId === user._id);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (userId) {
        try {
          const response = await fetch(`/api/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (response.ok) {
            setProfile(data);
          } else {
            setError(data.message || 'Failed to load profile');
          }
        } catch (err) {
          setError('Failed to load profile');
        }
      } else {
        setProfile(user);
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, [userId, user]);

  useEffect(() => {
    if (!isOwnProfile && profile && profile.followers && user) {
      setIsFollowing(profile.followers.some((id: string) => id === user?._id));
    }
  }, [profile, user, isOwnProfile]);

  const handleFollow = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setProfile((prev: any) => ({
          ...prev,
          followers: [...(prev.followers || []), user?._id]
        }));
        setIsFollowing(true);
      }
    } catch {}
  };

  const handleUnfollow = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/users/${userId}/unfollow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setProfile((prev: any) => ({
          ...prev,
          followers: (prev.followers || []).filter((id: string) => id !== user?._id)
        }));
        setIsFollowing(false);
      }
    } catch {}
  };

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

      console.log('Profile updated successfully!', data);
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

  const handleProfilePictureSuccess = (profilePicture: string) => {
    setSuccess('Profile picture updated successfully!');
    setIsUploadingPicture(false);
    // Refresh the page to show updated data
    window.location.reload();
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
          ) : isUploadingPicture ? (
            <ProfilePictureUpload
              onUploadSuccess={handleProfilePictureSuccess}
              onCancel={() => setIsUploadingPicture(false)}
              currentProfilePicture={profile?.profilePicture}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
                {/* Only show edit/upload for own profile */}
                {!userId && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsUploadingPicture(true)}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      Upload Picture
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                {/* Success Message */}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                    {success}
                  </div>
                )}

                {/* Profile Picture */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-gray-300">
                      {profile?.profilePicture ? (
                        <img
                          src={profile.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">@{profile?.username}</h2>
                  <div className="flex gap-6 mt-2">
                    <div className="text-center">
                      <span className="font-bold text-lg">{profile?.followers ? profile.followers.length : 0}</span>
                      <span className="text-gray-600 text-sm block">Followers</span>
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-lg">{profile?.following ? profile.following.length : 0}</span>
                      <span className="text-gray-600 text-sm block">Following</span>
                    </div>
                  </div>
                 {/* Follow/Unfollow button for other users */}
                 {!isOwnProfile && user && (
                   <button
                     onClick={isFollowing ? handleUnfollow : handleFollow}
                     className={`mt-4 px-6 py-2 rounded-md font-semibold text-white transition-colors duration-200 ${isFollowing ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                   >
                     {isFollowing ? 'Unfollow' : 'Follow'}
                   </button>
                 )}
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Username</p>
                      <p className="font-medium">{profile?.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{profile?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">First Name</p>
                      <p className="font-medium">{profile?.firstName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Name</p>
                      <p className="font-medium">{profile?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{profile?.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-medium">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {profile?.bio && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Bio</p>
                      <p className="font-medium">{profile.bio}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Climbing Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Experience Level</p>
                      <p className="font-medium capitalize">{profile?.experience}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Climbing Types</p>
                      <p className="font-medium">{profile?.climbingType.join(', ')}</p>
                    </div>
                  </div>
                  
                  {profile?.preferredGyms && profile.preferredGyms.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Preferred Gyms</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.preferredGyms.map((gym: string) => (
                          <span key={gym} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {gym}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profile?.availability && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Availability</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(profile.availability).map(([day, available]) => (
                          Boolean(available) && (
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