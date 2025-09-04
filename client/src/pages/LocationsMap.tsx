import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LocationMap from '../components/LocationMap';

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
  description?: string;
  website?: string;
  distance?: number;
  amenities?: string[];
}

const LocationsMap: React.FC = () => {
  const { token } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    climbingType: '',
    radius: 25
  });
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [filters, userLocation]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Could not get user location:', error);
          // Fallback to general area or just fetch all locations
          fetchLocations();
        }
      );
    } else {
      fetchLocations();
    }
  };

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      let url = `${API_BASE_URL}/api/locations?limit=100`;
      
      // Add filters
      if (filters.type) {
        url += `&type=${filters.type}`;
      }
      if (filters.climbingType) {
        url += `&climbingType=${filters.climbingType}`;
      }
      
      // Use nearby endpoint if user location is available
      if (userLocation) {
        url = `${API_BASE_URL}/api/locations/nearby/${userLocation[0]}/${userLocation[1]}?radius=${filters.radius}&limit=100`;
        if (filters.type) {
          url += `&type=${filters.type}`;
        }
        if (filters.climbingType) {
          url += `&climbingType=${filters.climbingType}`;
        }
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      
      const data = await response.json();
      setLocations(data);
    } catch (err) {
      setError('Failed to load locations. Please try again.');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleFilterChange = (field: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading climbing locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Climbing Locations</h1>
          <p className="text-gray-600">Discover climbing gyms and outdoor spots near you</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Location Type
              </label>
              <select
                id="type"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="gym">Gyms</option>
                <option value="outdoor">Outdoor</option>
                <option value="crag">Crags</option>
                <option value="boulder_field">Boulder Fields</option>
              </select>
            </div>

            <div>
              <label htmlFor="climbingType" className="block text-sm font-medium text-gray-700 mb-1">
                Climbing Style
              </label>
              <select
                id="climbingType"
                value={filters.climbingType}
                onChange={(e) => handleFilterChange('climbingType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Styles</option>
                <option value="bouldering">Bouldering</option>
                <option value="sport">Sport</option>
                <option value="trad">Trad</option>
                <option value="top-rope">Top Rope</option>
                <option value="lead">Lead</option>
              </select>
            </div>

            <div>
              <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
                Radius (km)
              </label>
              <select
                id="radius"
                value={filters.radius}
                onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!userLocation}
              >
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchLocations}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Map and Location Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Map View</h2>
                <span className="text-sm text-gray-600">
                  {locations.length} location{locations.length !== 1 ? 's' : ''} found
                </span>
              </div>
              <LocationMap
                locations={locations}
                center={userLocation || undefined}
                zoom={userLocation ? 10 : 6}
                height="500px"
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
              />
            </div>
          </div>

          {/* Location Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Location Details</h2>
              
              {selectedLocation ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">{selectedLocation.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{selectedLocation.type}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-700">Address:</p>
                    <p className="text-gray-600">{selectedLocation.address}</p>
                    <p className="text-gray-600">{selectedLocation.city}, {selectedLocation.state}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-700">Climbing Types:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedLocation.climbingTypes.map((type) => (
                        <span key={type} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded capitalize">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {selectedLocation.amenities && selectedLocation.amenities.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-700">Amenities:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedLocation.amenities.map((amenity) => (
                          <span key={amenity} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded capitalize">
                            {amenity.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedLocation.description && (
                    <div>
                      <p className="font-medium text-gray-700">Description:</p>
                      <p className="text-gray-600 text-sm">{selectedLocation.description}</p>
                    </div>
                  )}
                  
                  {selectedLocation.distance && (
                    <div>
                      <p className="font-medium text-gray-700">Distance:</p>
                      <p className="text-blue-600 font-medium">{selectedLocation.distance}km away</p>
                    </div>
                  )}
                  
                  {selectedLocation.website && (
                    <div>
                      <a
                        href={selectedLocation.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Click on a marker on the map to see location details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationsMap;