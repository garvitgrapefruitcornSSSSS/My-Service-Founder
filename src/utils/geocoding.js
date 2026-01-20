// =====================================================
// FILE: src/utils/geocoding.js (NEW FILE)
// PURPOSE: Geocoding service for location search
// =====================================================

import axios from 'axios';

/**
 * Search for location using Nominatim (OpenStreetMap's geocoding service)
 * @param {string} query - Search query (e.g., "Jaipur", "Delhi Airport")
 * @returns {Promise<Array>} Array of location results
 */
export const searchLocation = async (query) => {
  if (!query || query.trim().length < 3) {
    throw new Error('Please enter at least 3 characters');
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        limit: 5,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'ServiceFinderApp/1.0' // Nominatim requires user agent
      }
    });

    return response.data.map(result => ({
      display_name: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      type: result.type,
      address: result.address
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to search location. Please try again.');
  }
};

/**
 * Reverse geocode (coordinates → address)
 * @param {Object} location - { lat, lng }
 * @returns {Promise<string>} Address string
 */
export const reverseGeocode = async (location) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: location.lat,
        lon: location.lng,
        format: 'json'
      },
      headers: {
        'User-Agent': 'ServiceFinderApp/1.0'
      }
    });

    return response.data.display_name;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Unknown location';
  }
};

/**
 * Recent searches management
 */
const RECENT_SEARCHES_KEY = 'recent_location_searches';
const MAX_RECENT_SEARCHES = 5;

export const saveRecentSearch = (location) => {
  try {
    const recent = getRecentSearches();
    
    // Remove duplicate if exists
    const filtered = recent.filter(
      item => item.display_name !== location.display_name
    );
    
    // Add to beginning
    filtered.unshift(location);
    
    // Keep only MAX_RECENT_SEARCHES
    const trimmed = filtered.slice(0, MAX_RECENT_SEARCHES);
    
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save recent search:', error);
  }
};

export const getRecentSearches = () => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get recent searches:', error);
    return [];
  }
};

export const clearRecentSearches = () => {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
};


