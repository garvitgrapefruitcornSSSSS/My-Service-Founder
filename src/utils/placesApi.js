 // =====================================================
// FILE: src/utils/placesApi.js (FREE VERSION)
// PURPOSE: Use OpenStreetMap Overpass API (100% Free)
// =====================================================

import axios from 'axios';

/**
 * OpenStreetMap service type mapping
 */
export const SERVICE_TYPES = {
  restaurant: {
    osmTag: 'restaurant',
    label: 'Restaurants',
    icon: '🍽️',
    query: 'amenity=restaurant'
  },
  medical: {
    osmTag: 'pharmacy',
    label: 'Medical Stores',
    icon: '⚕️',
    query: 'amenity=pharmacy'
  },
  charging: {
    osmTag: 'charging_station',
    label: 'EV Charging',
    icon: '⚡',
    query: 'amenity=charging_station'
  }
};

/**
 * Cache configuration
 */
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const cache = {};

const getCacheKey = (location, serviceType) => {
  const lat = location.lat.toFixed(3);
  const lng = location.lng.toFixed(3);
  return `${lat},${lng}-${serviceType}`;
};

const isCacheValid = (cacheEntry) => {
  if (!cacheEntry) return false;
  return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
};

/**
 * Fetches nearby places using OpenStreetMap Overpass API
 * @param {Object} location - { lat, lng }
 * @param {string} serviceType - 'restaurant' | 'medical' | 'charging'
 * @returns {Promise<Array>} Array of place objects
 */
export const fetchNearbyPlaces = async (location, serviceType) => {
  // Check cache first
  const cacheKey = getCacheKey(location, serviceType);
  const cachedData = cache[cacheKey];

  if (isCacheValid(cachedData)) {
    console.log('✅ Using cached data - No API call!');
    return cachedData.results;
  }

  try {
    console.log('🌐 Fetching from Overpass API (OpenStreetMap)...');
    
    const serviceConfig = SERVICE_TYPES[serviceType];
    const radius = 3000; // 3km

    // Overpass API query
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="${serviceConfig.osmTag}"](around:${radius},${location.lat},${location.lng});
        way["amenity"="${serviceConfig.osmTag}"](around:${radius},${location.lat},${location.lng});
        relation["amenity"="${serviceConfig.osmTag}"](around:${radius},${location.lat},${location.lng});
      );
      out body;
      >;
      out skel qt;
    `;

    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    // Transform OSM data to our format
    const places = response.data.elements
      .filter(element => element.tags && element.tags.name)
      .map((element, index) => {
        const tags = element.tags || {};
        
        // Calculate center for ways/relations
        let lat = element.lat;
        let lng = element.lon;
        
        if (!lat && element.center) {
          lat = element.center.lat;
          lng = element.center.lon;
        }

        return {
          place_id: element.id || `osm-${index}`,
          name: tags.name || 'Unknown Place',
          vicinity: [
            tags['addr:street'],
            tags['addr:housenumber'],
            tags['addr:city'] || tags['addr:suburb']
          ].filter(Boolean).join(', ') || 'Address not available',
          
          // Rating simulation (OSM doesn't have ratings)
          rating: Math.random() > 0.3 ? (3.5 + Math.random() * 1.5) : null,
          user_ratings_total: Math.floor(Math.random() * 500) + 10,
          
          // Opening hours
          opening_hours: {
            open_now: tags.opening_hours ? 
              isOpenNow(tags.opening_hours) : 
              Math.random() > 0.3 // Random if not specified
          },
          
          // Geometry
          geometry: {
            location: { lat, lng }
          },
          
          // Additional info
          phone: tags.phone || tags['contact:phone'],
          website: tags.website || tags['contact:website'],
          
          // Photos (OSM doesn't provide photos)
          photos: null,
          
          // Source
          source: 'OpenStreetMap'
        };
      })
      .filter(place => place.geometry.location.lat && place.geometry.location.lng);

    // Cache results
    cache[cacheKey] = {
      results: places,
      timestamp: Date.now()
    };

    return places;

  } catch (error) {
    console.error('Overpass API error:', error);
    throw new Error('Failed to fetch places. Please try again.');
  }
};

/**
 * Simple opening hours parser
 * Note: This is simplified - real OSM opening_hours can be very complex
 */
const isOpenNow = (openingHoursString) => {
  if (!openingHoursString) return false;
  
  // Common patterns
  if (openingHoursString.includes('24/7')) return true;
  if (openingHoursString.toLowerCase().includes('closed')) return false;
  
  // Default to open if we can't parse
  return true;
};

/**
 * Gets photo URL (placeholder since OSM doesn't have photos)
 */
export const getPlacePhotoUrl = (place) => {
  // You could integrate with Wikimedia Commons or Mapillary for real photos
  // For now, use category-based placeholders
  const placeholders = {
    restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    pharmacy: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=300&fit=crop',
    charging_station: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=300&fit=crop'
  };
  
  const serviceType = Object.keys(SERVICE_TYPES).find(key => 
    place.vicinity?.toLowerCase().includes(SERVICE_TYPES[key].label.toLowerCase())
  ) || 'restaurant';
  
  return placeholders[SERVICE_TYPES[serviceType].osmTag] || 
         'https://via.placeholder.com/400x300?text=No+Image';
};

/**
 * Clear cache
 */
export const clearCache = () => {
  Object.keys(cache).forEach(key => delete cache[key]);
  console.log('🗑️ Cache cleared');
};


