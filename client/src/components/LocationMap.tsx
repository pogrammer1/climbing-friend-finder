import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.divIcon({
  html: `<div style="
    background-color: #3B82F6;
    width: 25px;
    height: 25px;
    border-radius: 50% 50% 50% 0;
    border: 3px solid white;
    transform: rotate(-45deg);
    margin: -12px 0 0 -12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  "><div style="
    width: 100%;
    height: 100%;
    border-radius: 50%;
    transform: rotate(45deg);
  "></div></div>`,
  className: 'custom-marker',
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

L.Marker.prototype.options.icon = DefaultIcon;

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
}

interface LocationMapProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onLocationSelect?: (location: Location) => void;
  selectedLocation?: Location | null;
}

// Component to update map view when center changes
const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

const LocationMap: React.FC<LocationMapProps> = ({
  locations,
  center = [39.8283, -98.5795], // Center of USA as default
  zoom = 6,
  height = '400px',
  onLocationSelect,
  selectedLocation
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation && center[0] === 39.8283 && center[1] === -98.5795) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [
            position.coords.latitude,
            position.coords.longitude
          ];
          setUserLocation(userCoords);
          setMapCenter(userCoords);
        },
        (error) => {
          console.log('Could not get user location for map:', error);
        }
      );
    } else {
      setMapCenter(center);
    }
  }, [center]);

  const getLocationIcon = (location: Location) => {
    const color = location.type === 'gym' ? '#10B981' : '#F59E0B'; // Green for gyms, orange for outdoor
    
    return L.divIcon({
      html: `<div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50% 50% 50% 0;
        border: 2px solid white;
        transform: rotate(-45deg);
        margin: -10px 0 0 -10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "><div style="
        width: 100%;
        height: 100%;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div></div>`,
      className: 'location-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10]
    });
  };

  const getUserLocationIcon = () => {
    return L.divIcon({
      html: `<div style="
        background-color: #3B82F6;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 2px #3B82F6, 0 2px 4px rgba(0,0,0,0.3);
        margin: -9px 0 0 -9px;
      "></div>`,
      className: 'user-location-marker',
      iconSize: [15, 15],
      iconAnchor: [9, 9]
    });
  };

  return (
    <div className="w-full" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        className="z-0"
      >
        <MapUpdater center={mapCenter} zoom={zoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation} icon={getUserLocationIcon()}>
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Location markers */}
        {locations.map((location) => (
          <Marker
            key={location._id}
            position={[location.coordinates.latitude, location.coordinates.longitude]}
            icon={getLocationIcon(location)}
            eventHandlers={{
              click: () => {
                if (onLocationSelect) {
                  onLocationSelect(location);
                }
              }
            }}
          >
            <Popup>
              <div className="min-w-64">
                <h3 className="font-bold text-lg mb-2">{location.name}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="inline-block w-12 font-medium">Type:</span>
                  <span className="capitalize">{location.type}</span>
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="inline-block w-12 font-medium">Address:</span>
                  {location.address}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="inline-block w-12 font-medium">City:</span>
                  {location.city}, {location.state}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="inline-block w-12 font-medium">Types:</span>
                  {location.climbingTypes.join(', ')}
                </p>
                {location.distance && (
                  <p className="text-sm text-blue-600 font-medium">
                    {location.distance}km away
                  </p>
                )}
                {location.description && (
                  <p className="text-sm text-gray-600 mt-2">{location.description}</p>
                )}
                {onLocationSelect && (
                  <button
                    onClick={() => onLocationSelect(location)}
                    className="mt-2 w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Select Location
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LocationMap;