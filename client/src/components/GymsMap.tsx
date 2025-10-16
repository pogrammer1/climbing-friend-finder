import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Gym {
  _id: string;
  name: string;
  city?: string;
  state?: string;
  location?: { coordinates: [number, number] };
}

// Fix Leaflet's default icon paths when using CRA
try {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
  });
} catch (e) {
  // ignore in test environments
}

const GymsMap: React.FC<{ onSelectGym?: (gymId: string) => void }> = ({ onSelectGym }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGyms(lat?: number, lng?: number) {
      try {
        let url = `${process.env.REACT_APP_API_URL}/api/gyms`;
        if (lat != null && lng != null) {
          url = `${process.env.REACT_APP_API_URL}/api/gyms/nearby?lat=${lat}&lng=${lng}&radius=20000`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setGyms(data);
          return data;
        }
      } catch (err) {
        console.error('Failed to load gyms for map', err);
      } finally {
        setLoading(false);
      }
      return [] as Gym[];
    }

    const init = async () => {
      let initialGyms: Gym[] = [];
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          initialGyms = await fetchGyms(pos.coords.latitude, pos.coords.longitude);
          initMap(initialGyms, pos.coords.latitude, pos.coords.longitude);
        }, async () => {
          initialGyms = await fetchGyms();
          if (initialGyms && initialGyms.length && initialGyms[0].location) {
            const [lng, lat] = initialGyms[0].location.coordinates;
            initMap(initialGyms, lat, lng);
          } else {
            initMap([], 30.2672, -97.7431);
          }
        });
      } else {
        initialGyms = await fetchGyms();
        if (initialGyms && initialGyms.length && initialGyms[0].location) {
          const [lng, lat] = initialGyms[0].location.coordinates;
          initMap(initialGyms, lat, lng);
        } else {
          initMap([], 30.2672, -97.7431);
        }
      }
    };

    const initMap = (initialGyms: Gym[], lat: number, lng: number) => {
      // create map if not exists
      if (!mapRef.current) {
        mapRef.current = L.map('gyms-map').setView([lat, lng], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapRef.current);
      }

      // clear previous markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      (initialGyms || []).forEach(g => {
        const coords = g.location?.coordinates || [0, 0];
        const [lng, lat] = coords;
        const marker = L.marker([lat, lng]).addTo(mapRef.current!);
        marker.bindPopup(`<div><strong>${g.name}</strong><div class='text-xs'>${g.city || ''}${g.state ? ', ' + g.state : ''}</div><div style="margin-top:6px"><button id=\"use-${g._id}\">Use this gym</button></div></div>`);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`use-${g._id}`);
          if (btn) {
            btn.addEventListener('click', () => onSelectGym && onSelectGym(g._id));
          }
        });
        marker.on('click', () => onSelectGym && onSelectGym(g._id));
        markersRef.current.push(marker);
      });
    };

    init();

    return () => {
      try {
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (e) { /* ignore */ }
    };
  }, [onSelectGym]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">Nearby Gyms</h3>
      {loading ? (
        <div className="flex items-center justify-center py-8">Loading map...</div>
      ) : gyms.length === 0 ? (
        <div className="text-sm text-gray-600">No gyms found nearby.</div>
      ) : null}

      <div id="gyms-map" style={{ height: 320, width: '100%' }} className="rounded-md overflow-hidden" />
    </div>
  );
};

export default GymsMap;
