/**
 * GeoWell Proximity Utilities
 * Core geographic calculation functions
 */

const EARTH_RADIUS_KM = 6371;
const PROXIMITY_RADIUS_KM = 5;

/**
 * Haversine Formula
 * Calculates the great-circle distance between two points on Earth
 * 
 * @param {number} lat1 - Latitude of point 1 (degrees)
 * @param {number} lon1 - Longitude of point 1 (degrees)
 * @param {number} lat2 - Latitude of point 2 (degrees)
 * @param {number} lon2 - Longitude of point 2 (degrees)
 * @returns {number} Distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  // Convert degrees to radians
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Determines if a home is within the proximity radius of a well
 * 
 * @param {number} distance - Distance in kilometers
 * @param {number} radius - Radius threshold (default: 5km)
 * @returns {{ isInside: boolean, status: string, color: string }}
 */
export function getProximityStatus(distance, radius = PROXIMITY_RADIUS_KM) {
  const isInside = distance <= radius;
  return {
    isInside,
    status: isInside ? 'Inside 5 KM Radius' : 'Outside 5 KM Radius',
    statusShort: isInside ? 'INSIDE' : 'OUTSIDE',
    color: isInside ? 'safe' : 'danger',
    hexColor: isInside ? '#10b981' : '#ef4444',
    bgClass: isInside
      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      : 'bg-red-500/10 border-red-500/30 text-red-400',
  };
}

/**
 * Validates coordinate input values
 * 
 * @param {string|number} lat - Latitude value
 * @param {string|number} lon - Longitude value
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateCoordinates(lat, lon) {
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  if (isNaN(latNum) || isNaN(lonNum)) {
    return { valid: false, error: 'Coordinates must be valid numbers' };
  }
  if (latNum < -90 || latNum > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }
  if (lonNum < -180 || lonNum > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }
  return { valid: true, error: null };
}

/**
 * Formats distance for display
 * 
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export function formatDistance(distance) {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} m`;
  }
  return `${distance.toFixed(3)} km`;
}

/**
 * Calculates bearing from well to home
 * 
 * @param {number} lat1 - Well latitude
 * @param {number} lon1 - Well longitude
 * @param {number} lat2 - Home latitude
 * @param {number} lon2 - Home longitude
 * @returns {string} Cardinal bearing direction
 */
export function getBearing(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

  let bearing = toDeg(Math.atan2(y, x));
  bearing = ((bearing + 360) % 360).toFixed(1);

  // Convert to cardinal direction
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(bearing / 45) % 8;
  return { degrees: bearing, cardinal: directions[idx] };
}

/**
 * Calculates map bounds that include both markers
 * with some padding
 * 
 * @param {Array} well - [lat, lon]
 * @param {Array} home - [lat, lon]
 * @returns {Array} Leaflet bounds [[minLat, minLon], [maxLat, maxLon]]
 */
export function calculateBounds(well, home) {
  const padding = 0.05; // ~5km padding
  const minLat = Math.min(well[0], home[0]) - padding;
  const maxLat = Math.max(well[0], home[0]) + padding;
  const minLon = Math.min(well[1], home[1]) - padding;
  const maxLon = Math.max(well[1], home[1]) + padding;
  return [
    [minLat, minLon],
    [maxLat, maxLon],
  ];
}

/**
 * Exports history records to CSV format
 * 
 * @param {Array} records - Array of calculation records
 * @returns {string} CSV string content
 */
export function exportToCSV(records) {
  const headers = [
    'Date',
    'Well Name',
    'Well Lat',
    'Well Lon',
    'Home Name',
    'Home Lat',
    'Home Lon',
    'Distance (km)',
    'Status',
    'Bearing (°)',
    'Direction',
  ];

  const rows = records.map((r) => {
    const bearing = getBearing(
      r.well.lat,
      r.well.lon,
      r.home.lat,
      r.home.lon
    );
    return [
      new Date(r.timestamp).toLocaleString(),
      r.well.name,
      r.well.lat,
      r.well.lon,
      r.home.name,
      r.home.lat,
      r.home.lon,
      r.distance.toFixed(4),
      r.status,
      bearing.degrees,
      bearing.cardinal,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Triggers a CSV download in the browser/Electron
 * 
 * @param {string} csvContent - CSV string
 * @param {string} filename - Output filename
 */
export function downloadCSV(csvContent, filename = 'geowell-analysis.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Generates a unique ID for records
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export { PROXIMITY_RADIUS_KM };
