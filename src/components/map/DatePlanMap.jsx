import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Navigation, ExternalLink, MapPin } from 'lucide-react';

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createNumberedIcon = (num) => L.divIcon({
  html: `<div style="background:linear-gradient(135deg,#ec4899,#a855f7);color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${num}</div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

export default function DatePlanMap({ plan }) {
  const [locations, setLocations] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    geocodeAll();
  }, []);

  const geocodeAll = async () => {
    setIsGeocoding(true);
    const results = await Promise.all(
      plan.itinerary.map(async (item, index) => {
        const query = plan.location ? `${item.location}, ${plan.location}` : item.location;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          if (data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), item, index };
          }
        } catch (e) {}
        return null;
      })
    );
    setLocations(results.filter(Boolean));
    setIsGeocoding(false);
  };

  const filteredLocations = activeFilter === 'all'
    ? locations
    : locations.filter(l => l.index === parseInt(activeFilter));

  const center = locations.length > 0
    ? [
        locations.reduce((s, l) => s + l.lat, 0) / locations.length,
        locations.reduce((s, l) => s + l.lng, 0) / locations.length,
      ]
    : [40.7128, -74.006];

  const directionsUrl = locations.length >= 2
    ? `https://www.google.com/maps/dir/${locations.map(l => `${l.lat},${l.lng}`).join('/')}`
    : null;

  return (
    <div>
      {/* Filter Buttons */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeFilter === 'all' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-pink-100'}`}
          >
            All Stops
          </button>
          {plan.itinerary.map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveFilter(activeFilter === String(i) ? 'all' : String(i))}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${activeFilter === String(i) ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-pink-100'}`}
            >
              Stop {i + 1}
            </button>
          ))}
        </div>
        {directionsUrl && (
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
              <Navigation className="w-4 h-4 mr-1" />
              Get Directions
            </Button>
          </a>
        )}
      </div>

      {isGeocoding ? (
        <div className="h-72 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-pink-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mb-3"></div>
          <p className="text-gray-500 text-sm">Plotting your date locations on the map...</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-pink-100">
          <MapPin className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">Could not locate venues on map</p>
          <p className="text-gray-400 text-xs mt-1">Try adding a specific city to your plan</p>
        </div>
      ) : (
        <div className="h-80 rounded-xl overflow-hidden border border-pink-100 shadow-md">
          <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredLocations.map((loc) => (
              <Marker key={loc.index} position={[loc.lat, loc.lng]} icon={createNumberedIcon(loc.index + 1)}>
                <Popup maxWidth={220}>
                  <div className="min-w-[180px]">
                    <p className="font-bold text-gray-900 text-sm mb-1">Stop {loc.index + 1} · {loc.item.time}</p>
                    <p className="text-pink-600 font-medium text-sm mb-1">{loc.item.activity}</p>
                    <p className="text-xs text-gray-600 mb-1">📍 {loc.item.location}</p>
                    {loc.item.cost > 0 && <p className="text-xs text-gray-600 mb-1">💰 {plan.currency_symbol || '$'}{loc.item.cost}</p>}
                    {loc.item.insider_tip && <p className="text-xs text-yellow-700 mb-2 italic">💡 {loc.item.insider_tip}</p>}
                    <div className="flex gap-1 flex-wrap mt-2">
                      {loc.item.booking_url && (
                        <a href={loc.item.booking_url} target="_blank" rel="noopener noreferrer" className="text-xs bg-pink-500 text-white px-2 py-1 rounded hover:bg-pink-600">Book</a>
                      )}
                      {loc.item.website && (
                        <a href={loc.item.website} target="_blank" rel="noopener noreferrer" className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700">Website</a>
                      )}
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(loc.item.location + (plan.location ? ', ' + plan.location : ''))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Maps
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            {filteredLocations.length > 1 && (
              <Polyline
                positions={filteredLocations.map(l => [l.lat, l.lng])}
                color="#ec4899"
                weight={2.5}
                dashArray="6,10"
                opacity={0.8}
              />
            )}
          </MapContainer>
        </div>
      )}
    </div>
  );
}