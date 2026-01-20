 // =====================================================
// FILE: src/components/MapView.jsx (FREE VERSION)
// PURPOSE: Leaflet map instead of Google Maps
// =====================================================

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom blue marker for user location
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom red marker for places
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map center when location changes
const MapUpdater = ({ center }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
};

const MapView = ({ center, places, onMapLoad }) => {
  React.useEffect(() => {
    // Notify parent that map is loaded
    if (onMapLoad) {
      onMapLoad(true);
    }
  }, [onMapLoad]);

  return (
    <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        {/* OpenStreetMap tiles (free!) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Update map center when location changes */}
        <MapUpdater center={[center.lat, center.lng]} />

        {/* User location marker (blue) */}
        <Marker position={[center.lat, center.lng]} icon={blueIcon}>
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <strong>Your Location</strong>
            </div>
          </Popup>
        </Marker>

        {/* Place markers (red) */}
        {places.map((place) => {
          const position = [
            place.geometry.location.lat,
            place.geometry.location.lng
          ];
          
          return (
            <Marker
              key={place.place_id}
              position={position}
              icon={redIcon}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
                    {place.name}
                  </h3>
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                    {place.vicinity}
                  </p>
                  {place.rating && (
                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#f59e0b' }}>
                      ⭐ {place.rating.toFixed(1)}
                    </p>
                  )}
                  {place.phone && (
                    <p style={{ margin: '4px 0', fontSize: '12px' }}>
                      📞 {place.phone}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;


