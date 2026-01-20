// =====================================================
// FILE: src/components/LocationSearch.jsx (NEW FILE)
// PURPOSE: Manual location search component
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import { searchLocation, getRecentSearches, saveRecentSearch } from '../utils/geocoding';

const LocationSearch = ({ onLocationSelect, currentLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  
  const searchRef = useRef(null);
  const searchTimeout = useRef(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setError(null);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.trim().length < 3) {
      setSearchResults([]);
      setShowResults(query.length > 0);
      return;
    }

    // Set new timeout for debouncing
    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchLocation(query);
        setSearchResults(results);
        setShowResults(true);
      } catch (err) {
        setError(err.message);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce
  };

  const handleSelectLocation = (location) => {
    saveRecentSearch(location);
    setRecentSearches(getRecentSearches());
    setSearchQuery(location.display_name);
    setShowResults(false);
    onLocationSelect({
      lat: location.lat,
      lng: location.lng,
      name: location.display_name
    });
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      setSearchQuery('Using current location');
      setShowResults(false);
      onLocationSelect(currentLocation);
    }
  };

  return (
    <div className="location-search" ref={searchRef}>
      <div className="search-input-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search for a city, address, or landmark..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setShowResults(true)}
        />
        {searchQuery && (
          <button
            className="clear-search-btn"
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
              setShowResults(false);
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {showResults && (
        <div className="search-results-dropdown">
          {/* Current Location Option */}
          <div className="results-section">
            <button
              className="location-result-item current-location-btn"
              onClick={handleUseCurrentLocation}
            >
              <span className="result-icon">📍</span>
              <div className="result-info">
                <div className="result-name">Use Current Location</div>
                <div className="result-address">Detect my location automatically</div>
              </div>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="search-loading">
              <div className="small-spinner"></div>
              <span>Searching...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="search-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Search Results */}
          {!loading && searchResults.length > 0 && (
            <div className="results-section">
              <div className="results-section-title">Search Results</div>
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  className="location-result-item"
                  onClick={() => handleSelectLocation(result)}
                >
                  <span className="result-icon">📌</span>
                  <div className="result-info">
                    <div className="result-name">
                      {result.address?.city || result.address?.town || result.address?.village || result.type}
                    </div>
                    <div className="result-address">{result.display_name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && searchQuery.length >= 3 && searchResults.length === 0 && !error && (
            <div className="no-results-message">
              <span>🔍</span>
              <span>No locations found. Try a different search.</span>
            </div>
          )}

          {/* Recent Searches */}
          {!loading && searchQuery.length < 3 && recentSearches.length > 0 && (
            <div className="results-section">
              <div className="results-section-title">Recent Searches</div>
              {recentSearches.map((recent, index) => (
                <button
                  key={index}
                  className="location-result-item"
                  onClick={() => handleSelectLocation(recent)}
                >
                  <span className="result-icon">🕐</span>
                  <div className="result-info">
                    <div className="result-name">
                      {recent.address?.city || recent.address?.town || 'Location'}
                    </div>
                    <div className="result-address">{recent.display_name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;


