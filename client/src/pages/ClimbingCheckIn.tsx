import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Location {
  _id: string;
  name: string;
  type: 'gym' | 'outdoor' | 'crag' | 'boulder_field';
  address: string;
  city: string;
  state: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  climbingTypes: string[];
  distance?: number;
}

interface CheckIn {
  _id: string;
  userId: string;
  locationId: string;
  location: Location;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  checkedInAt: string;
  isActive: boolean;
}

const ClimbingCheckIn: React.FC = () => {
  const { token, user } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [nearbyClimbers, setNearbyClimbers] = useState<CheckIn[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentCheckIn, setCurrentCheckIn] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserLocation();
    fetchCurrentCheckIn();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyLocations();
      fetchNearbyClimbers();
    }
  }, [userLocation]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Could not get user location:', error);
          setError('Unable to get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  const fetchNearbyLocations = async () => {
    if (!userLocation) return;
    
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${API_BASE_URL}/api/locations/nearby/${userLocation[0]}/${userLocation[1]}?radius=25&limit=20`
      );
      
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (err) {
      console.error('Error fetching nearby locations:', err);
    }
  };

  const fetchCurrentCheckIn = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/checkins/current`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const checkIn = await response.json();
        if (checkIn) {
          setCurrentCheckIn(checkIn);
          setIsCheckedIn(true);
          setSelectedLocation(checkIn.location);
        }
      }
    } catch (err) {
      console.error('Error fetching current check-in:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyClimbers = async () => {
    if (!userLocation) return;
    
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${API_BASE_URL}/api/checkins/nearby/${userLocation[0]}/${userLocation[1]}?radius=25`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setNearbyClimbers(data);
      }
    } catch (err) {
      console.error('Error fetching nearby climbers:', err);
    }
  };

  const handleCheckIn = async (location: Location) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/checkins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          locationId: location._id,
          coordinates: userLocation
        })
      });

      if (response.ok) {
        const checkIn = await response.json();
        setCurrentCheckIn(checkIn);
        setIsCheckedIn(true);
        setSelectedLocation(location);
        fetchNearbyClimbers(); // Refresh nearby climbers
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to check in');
      }
    } catch (err) {
      setError('Failed to check in. Please try again.');
      console.error('Error checking in:', err);
    }
  };

  const handleCheckOut = async () => {
    if (!currentCheckIn) return;
    
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/checkins/${currentCheckIn._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setCurrentCheckIn(null);
        setIsCheckedIn(false);
        setSelectedLocation(null);
        fetchNearbyClimbers(); // Refresh nearby climbers
      } else {
        setError('Failed to check out');
      }
    } catch (err) {
      setError('Failed to check out. Please try again.');
      console.error('Error checking out:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Climbing Check-In</h1>
          <p className="text-gray-600">Let others know where you're climbing today</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Current Check-In Status */}
        {isCheckedIn && currentCheckIn ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Checked in at {currentCheckIn.location.name}
                </h3>
                <p className="text-green-600">
                  {currentCheckIn.location.city}, {currentCheckIn.location.state}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Since {new Date(currentCheckIn.checkedInAt).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={handleCheckOut}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Check Out
              </button>
            </div>
          </div>
        ) : (
          /* Nearby Locations for Check-In */
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Nearby Climbing Locations</h2>
            
            {locations.length > 0 ? (
              <div className="grid gap-4">
                {locations.slice(0, 10).map((location) => (
                  <div key={location._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{location.name}</h3>
                        <p className="text-sm text-gray-600">
                          {location.address}, {location.city}, {location.state}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded capitalize ${
                            location.type === 'gym' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {location.type}
                          </span>
                          {location.distance && (
                            <span className="text-xs text-blue-600">{location.distance}km away</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {location.climbingTypes.map((type) => (
                            <span key={type} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCheckIn(location)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors ml-4"
                      >
                        Check In
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No climbing locations found nearby. Make sure location services are enabled.
              </p>
            )}
          </div>
        )}

        {/* Nearby Climbers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Climbers Nearby ({nearbyClimbers.length})
          </h2>
          
          {nearbyClimbers.length > 0 ? (
            <div className="grid gap-4">
              {nearbyClimbers.map((checkIn) => (
                <div key={checkIn._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {checkIn.user.profilePicture ? (
                      <img 
                        src={checkIn.user.profilePicture} 
                        alt={`${checkIn.user.firstName} ${checkIn.user.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {checkIn.user.firstName[0]}{checkIn.user.lastName[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {checkIn.user.firstName} {checkIn.user.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        at {checkIn.location.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(checkIn.checkedInAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {checkIn.location.distance && `${checkIn.location.distance}km away`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No other climbers checked in nearby right now.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClimbingCheckIn;