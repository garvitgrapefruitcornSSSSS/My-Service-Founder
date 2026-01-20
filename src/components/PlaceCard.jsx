 
// =====================================================
// FILE: src/components/PlaceCard.jsx (UPDATED)
// Minor changes for OSM data
// =====================================================

import React from 'react';
import { getPlacePhotoUrl } from '../utils/placesApi';

const PlaceCard = ({ place }) => {
  const lat = place.geometry.location.lat;
  const lng = place.geometry.location.lng;

  const getRideLinks = () => ({
    uber: `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}`,
    ola: `https://book.olacabs.com/?lat=${lat}&lng=${lng}`,
    rapido: `https://www.rapido.bike/ride?drop_lat=${lat}&drop_lng=${lng}`
  });

  const rideLinks = getRideLinks();
  const isOpen = place.opening_hours?.open_now;

  return (
    <div className="place-card">
      <div className="place-image-container">
        <img
          src={getPlacePhotoUrl(place)}
          alt={place.name}
          className="place-image"
        />
        {place.opening_hours && (
          <span className={`status-badge ${isOpen ? 'open' : 'closed'}`}>
            {isOpen ? 'Open' : 'Closed'}
          </span>
        )}
        {/* OSM attribution badge */}
        <span className="osm-badge">📍 OSM</span>
      </div>

      <div className="place-details">
        <h3 className="place-name">{place.name}</h3>

        {place.rating && (
          <div className="place-rating">
            <span className="rating-star">⭐</span>
            <span className="rating-value">{place.rating.toFixed(1)}</span>
            {place.user_ratings_total && (
              <span className="rating-count">
                ({place.user_ratings_total} reviews)
              </span>
            )}
          </div>
        )}

        <div className="place-address">
          <span className="address-icon">📍</span>
          <p className="address-text">{place.vicinity}</p>
        </div>

        {/* Additional OSM info */}
        {place.phone && (
          <div className="place-contact">
            <span>📞</span>
            <a href={`tel:${place.phone}`} className="contact-link">
              {place.phone}
            </a>
          </div>
        )}

        {place.website && (
          <div className="place-contact">
            <span>🌐</span>
            <a 
              href={place.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-link"
            >
              Website
            </a>
          </div>
        )}

        <div className="ride-section">
          <p className="ride-label">Book a ride:</p>
          <div className="ride-buttons">
            <a href={rideLinks.uber} target="_blank" rel="noopener noreferrer" className="ride-btn uber">
              Uber
            </a>
            <a href={rideLinks.ola} target="_blank" rel="noopener noreferrer" className="ride-btn ola">
              Ola
            </a>
            <a href={rideLinks.rapido} target="_blank" rel="noopener noreferrer" className="ride-btn rapido">
              Rapido
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;


