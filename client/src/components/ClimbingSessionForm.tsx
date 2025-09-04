import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface Route {
  name?: string;
  grade: string;
  type: 'bouldering' | 'sport' | 'trad';
  status: 'sent' | 'project' | 'attempted' | 'onsight' | 'flash';
  attempts?: number;
  notes?: string;
}

interface Location {
  _id: string;
  name: string;
  type: 'gym' | 'outdoor' | 'crag' | 'boulder_field';
  address: string;
  city: string;
  state: string;
  climbingTypes: string[];
  distance?: number;
}

interface ClimbingSessionFormProps {
  session?: {
    _id: string;
    date: string;
    location: string;
    climbingType: string;
    routes: Route[];
    duration: number;
    notes?: string;
    partners?: string[];
    weather?: string;
    conditions?: string;
  };
  onSave: (sessionData: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

const ClimbingSessionForm: React.FC<ClimbingSessionFormProps> = ({
  session,
  onSave,
  onCancel,
  isLoading = false,
  error
}) => {
  // For potential future authentication needs
  useAuth();
  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format in local timezone
    location: '',
    locationId: '',
    climbingType: 'gym' as 'bouldering' | 'sport' | 'trad' | 'gym' | 'outdoor',
    routes: [] as Route[],
    duration: 120, // 2 hours default
    notes: '',
    partners: [] as string[],
    weather: '',
    conditions: ''
  });

  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [showCustomLocation, setShowCustomLocation] = useState(false);

  const [newPartner, setNewPartner] = useState('');
  const [newRoute, setNewRoute] = useState<Route>({
    name: '',
    grade: '',
    type: 'bouldering',
    status: 'attempted',
    attempts: 1,
    notes: ''
  });

  const climbingTypeOptions = ['bouldering', 'sport', 'trad', 'gym', 'outdoor'];
  const routeTypeOptions = ['bouldering', 'sport', 'trad'];
  const statusOptions = ['sent', 'project', 'attempted', 'onsight', 'flash'];
  const boulderingGrades = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10+'];
  const sportGrades = ['5.5', '5.6', '5.7', '5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c', '5.11d', '5.12+'];

  // Initialize form with existing session data
  useEffect(() => {
    if (session) {
      setFormData({
        date: new Date(session.date).toLocaleDateString('en-CA'), // YYYY-MM-DD format in local timezone
        location: session.location,
        locationId: '',
        climbingType: session.climbingType as any,
        routes: session.routes,
        duration: session.duration,
        notes: session.notes || '',
        partners: session.partners || [],
        weather: session.weather || '',
        conditions: session.conditions || ''
      });
    }
  }, [session]);

  const fetchLocations = useCallback(async () => {
    setLoadingLocations(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/locations?limit=100`);
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
    setLoadingLocations(false);
  }, []);

  const fetchNearbyLocations = useCallback(async (lat: number, lng: number) => {
    setLoadingLocations(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/locations/nearby/${lat}/${lng}?radius=50&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      fetchLocations(); // Fallback to all locations
    }
    setLoadingLocations(false);
  }, [fetchLocations]);

  // Get user's location and fetch nearby locations
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchNearbyLocations(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.log('Could not get user location:', error);
            fetchLocations(); // Fallback to all locations
          }
        );
      } else {
        fetchLocations(); // Fallback to all locations
      }
    };

    fetchLocations();
    getUserLocation();
  }, [fetchLocations, fetchNearbyLocations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (location: Location) => {
    setFormData(prev => ({
      ...prev,
      location: location.name,
      locationId: location._id
    }));
    setLocationFilter('');
    setShowCustomLocation(false);
  };

  const handleCustomLocationToggle = () => {
    setShowCustomLocation(!showCustomLocation);
    if (!showCustomLocation) {
      setFormData(prev => ({
        ...prev,
        location: '',
        locationId: ''
      }));
    }
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(locationFilter.toLowerCase()) ||
    location.city.toLowerCase().includes(locationFilter.toLowerCase()) ||
    location.state.toLowerCase().includes(locationFilter.toLowerCase())
  );

  const addPartner = () => {
    if (newPartner.trim() && !formData.partners.includes(newPartner.trim())) {
      setFormData(prev => ({
        ...prev,
        partners: [...prev.partners, newPartner.trim()]
      }));
      setNewPartner('');
    }
  };

  const removePartner = (partner: string) => {
    setFormData(prev => ({
      ...prev,
      partners: prev.partners.filter(p => p !== partner)
    }));
  };

  const addRoute = () => {
    if (newRoute.grade && newRoute.type && newRoute.status) {
      setFormData(prev => ({
        ...prev,
        routes: [...prev.routes, { ...newRoute }]
      }));
      setNewRoute({
        name: '',
        grade: '',
        type: 'bouldering',
        status: 'attempted',
        attempts: 1,
        notes: ''
      });
    }
  };

  const removeRoute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      routes: prev.routes.filter((_, i) => i !== index)
    }));
  };

  // const updateRoute = (index: number, field: keyof Route, value: any) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     routes: prev.routes.map((route, i) => 
  //       i === index ? { ...route, [field]: value } : route
  //     )
  //   }));
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getGradeOptions = (type: string) => {
    return type === 'bouldering' ? boulderingGrades : sportGrades;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {session ? 'Edit Climbing Session' : 'Log New Climbing Session'}
      </h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              
              {!showCustomLocation ? (
                <div className="space-y-2">
                  {/* Location Search/Filter */}
                  <input
                    type="text"
                    placeholder="Search locations..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {/* Selected Location Display */}
                  {formData.location && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-md text-sm">
                      <span className="font-medium">Selected:</span> {formData.location}
                    </div>
                  )}
                  
                  {/* Location Options */}
                  {locationFilter && (
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                      {loadingLocations ? (
                        <div className="p-3 text-center text-gray-500">Loading locations...</div>
                      ) : filteredLocations.length > 0 ? (
                        filteredLocations.slice(0, 10).map((location) => (
                          <button
                            key={location._id}
                            type="button"
                            onClick={() => handleLocationSelect(location)}
                            className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                          >
                            <div className="font-medium">{location.name}</div>
                            <div className="text-sm text-gray-600">
                              {location.city}, {location.state} • {location.type}
                              {location.distance && ` • ${location.distance}km away`}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-500">No locations found</div>
                      )}
                    </div>
                  )}
                  
                  {/* Custom Location Toggle */}
                  <button
                    type="button"
                    onClick={handleCustomLocationToggle}
                    className="text-blue-600 hover:text-blue-700 text-sm underline"
                  >
                    Can't find your location? Enter manually
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter custom location"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleCustomLocationToggle}
                    className="text-blue-600 hover:text-blue-700 text-sm underline"
                  >
                    Choose from existing locations
                  </button>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="climbingType" className="block text-sm font-medium text-gray-700 mb-1">
                Climbing Type *
              </label>
              <select
                id="climbingType"
                name="climbingType"
                value={formData.climbingType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {climbingTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="1"
                max="1440"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="weather" className="block text-sm font-medium text-gray-700 mb-1">
                Weather (optional)
              </label>
              <input
                type="text"
                id="weather"
                name="weather"
                value={formData.weather}
                onChange={handleInputChange}
                placeholder="Sunny, cloudy, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="conditions" className="block text-sm font-medium text-gray-700 mb-1">
              Conditions (optional)
            </label>
            <input
              type="text"
              id="conditions"
              name="conditions"
              value={formData.conditions}
              onChange={handleInputChange}
              placeholder="Rock conditions, holds, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Partners */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Climbing Partners</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newPartner}
              onChange={(e) => setNewPartner(e.target.value)}
              placeholder="Partner name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addPartner}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Add
            </button>
          </div>
          {formData.partners.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.partners.map((partner, index) => (
                <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {partner}
                  <button
                    type="button"
                    onClick={() => removePartner(partner)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Routes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Routes Climbed</h3>
          
          {/* Add Route Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route Name</label>
                <input
                  type="text"
                  value={newRoute.name}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newRoute.type}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {routeTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <select
                  value={newRoute.grade}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, grade: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select grade</option>
                  {getGradeOptions(newRoute.type).map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newRoute.status}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attempts</label>
                <input
                  type="number"
                  value={newRoute.attempts}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, attempts: parseInt(e.target.value) || 1 }))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={newRoute.notes}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={addRoute}
              disabled={!newRoute.grade || !newRoute.type || !newRoute.status}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Add Route
            </button>
          </div>
          
          {/* Routes List */}
          {formData.routes.length > 0 && (
            <div className="space-y-2">
              {formData.routes.map((route, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{route.grade}</span>
                      <span className="text-sm text-gray-600">({route.type})</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        route.status === 'sent' ? 'bg-green-100 text-green-800' :
                        route.status === 'project' ? 'bg-purple-100 text-purple-800' :
                        route.status === 'attempted' ? 'bg-yellow-100 text-yellow-800' :
                        route.status === 'onsight' ? 'bg-blue-100 text-blue-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {route.status}
                      </span>
                    </div>
                    {route.name && <p className="text-sm text-gray-600">{route.name}</p>}
                    {route.notes && <p className="text-sm text-gray-500">{route.notes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRoute(index)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Session Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            placeholder="How was your session? Any highlights or observations?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
          >
            {isLoading ? 'Saving...' : (session ? 'Update Session' : 'Save Session')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClimbingSessionForm; 