// =====================================================
// FILE: src/pages/Home.jsx (UPDATED)
// Add location search integration
// =====================================================

import React, { useState, useEffect } from "react";
import MapView from "../components/MapView";
import Filters from "../components/Filters";
import PlaceCard from "../components/PlaceCard";
import LocationSearch from "../components/LocationSearch";
import { fetchNearbyPlaces, SERVICE_TYPES } from "../utils/placesApi";
import { reverseGeocode } from "../utils/geocoding";

const Home = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedService, setSelectedService] = useState("restaurant");
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationName, setLocationName] = useState("Detecting...");
  const [useManualLocation, setUseManualLocation] = useState(false);

  const [filterRating, setFilterRating] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Get user location on mount
  useEffect(() => {
    detectCurrentLocation();
  }, []);

  const detectCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      setLocationName("Detecting...");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setError(null);
          setLoading(false);

          // Get location name
          try {
            const name = await reverseGeocode(location);
            setLocationName(name);
          } catch (err) {
            setLocationName("Current Location");
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          const defaultLocation = { lat: 26.9124, lng: 75.7873 };
          setUserLocation(defaultLocation);
          setLocationName("Jaipur, Rajasthan, India (Default)");
          setError("Location access denied. Using default location.");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    } else {
      setError("Geolocation not supported.");
      const defaultLocation = { lat: 26.9124, lng: 75.7873 };
      setUserLocation(defaultLocation);
      setLocationName("Jaipur, Rajasthan, India (Default)");
    }
  };

  // Handle manual location selection
  const handleLocationSelect = (location) => {
    setUserLocation({ lat: location.lat, lng: location.lng });
    setLocationName(location.name || "Selected Location");
    setUseManualLocation(true);
    setError(null);
  };

  // Fetch places when service/location changes
  useEffect(() => {
    if (mapLoaded && userLocation) {
      loadPlaces();
    }
  }, [mapLoaded, userLocation, selectedService]);

  const loadPlaces = async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await fetchNearbyPlaces(userLocation, selectedService);
      setPlaces(results);
      setFilteredPlaces(results);
    } catch (err) {
      setError(err.message);
      setPlaces([]);
      setFilteredPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...places];

    if (filterRating) {
      filtered = filtered.filter((place) => place.rating && place.rating >= 4);
    }

    if (filterOpen) {
      filtered = filtered.filter(
        (place) => place.opening_hours && place.opening_hours.open_now,
      );
    }

    setFilteredPlaces(filtered);
  }, [filterRating, filterOpen, places]);

  if (!userLocation) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Detecting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <span className="header-icon">📍</span>
              <h1 className="header-title">Service Finder</h1>
            </div>
            <div className="header-right">
              <span className="location-icon">🧭</span>
              <span className="location-name">{locationName}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Location Search Section */}
          <div className="section location-section">
            <div className="location-header">
              <h2 className="section-title">Choose Location</h2>
              <button
                className="current-location-trigger"
                onClick={detectCurrentLocation}
                title="Use my current location"
              >
                <span>📍</span>
                <span>Use Current Location</span>
              </button>
            </div>
            <LocationSearch
              onLocationSelect={handleLocationSelect}
              currentLocation={userLocation}
            />
          </div>

          <div className="section">
            <h2 className="section-title">Select Service Type</h2>
            <div className="service-grid">
              {Object.entries(SERVICE_TYPES).map(([key, { label, icon }]) => (
                <button
                  key={key}
                  onClick={() => setSelectedService(key)}
                  className={`service-btn ${selectedService === key ? "active" : ""}`}
                >
                  <div className="service-icon">{icon}</div>
                  <div className="service-label">{label}</div>
                </button>
              ))}
            </div>
          </div>

          <Filters
            filterRating={filterRating}
            filterOpen={filterOpen}
            onRatingChange={setFilterRating}
            onOpenChange={setFilterOpen}
          />

          <div className="section">
            <h2 className="section-title">Map View</h2>
            <MapView
              center={userLocation}
              places={filteredPlaces}
              onMapLoad={setMapLoaded}
            />
          </div>

          <div className="results-section">
            <div className="results-header">
              <h2 className="section-title">
                Nearby {SERVICE_TYPES[selectedService].label}
              </h2>
              <span className="results-count">
                {filteredPlaces.length} place
                {filteredPlaces.length !== 1 ? "s" : ""} found
              </span>
            </div>

            {loading && (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            )}

            {!loading && filteredPlaces.length === 0 && (
              <div className="no-results">
                <p>
                  No places found. Try a different service type or location.
                </p>
              </div>
            )}

            {!loading && filteredPlaces.length > 0 && (
              <div className="places-grid">
                {filteredPlaces.map((place) => (
                  <PlaceCard key={place.place_id} place={place} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
        
        </div>
      </footer>
    </div>
  );
};

export default Home;
