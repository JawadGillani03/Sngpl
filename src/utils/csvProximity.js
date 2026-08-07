/**
 * csvProximity.js
 * Utilities for bulk CSV-based proximity analysis:
 * - Parse a CSV of house coordinates
 * - Compute distance from every house to every well
 * - Group results by well ("which well has which houses within 5km")
 * - Also report houses that fall outside every well's radius
 *
 * Drop this file at: src/utils/csvProximity.js
 */

// ---- CSV parsing ----------------------------------------------------------

const HEADER_ALIASES = {
  name: ['name', 'house', 'house_name', 'housename', 'label', 'title', 'id'],
  lat: ['lat', 'latitude', 'y'],
  lon: ['lon', 'lng', 'long', 'longitude', 'x'],
};

function normalizeHeader(h) {
  return h.trim().toLowerCase().replace(/\s+/g, '_');
}

function findColumn(headers, aliases) {
  const normalized = headers.map(normalizeHeader);
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias);
    if (idx !== -1) return idx;
  }
  return -1;
}

/** Minimal CSV line splitter that respects quoted fields (handles commas inside quotes) */
function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

/**
 * Parse raw CSV text into an array of { id, name, lat, lon }.
 * Accepts flexible header names (name/house/label, lat/latitude, lon/lng/longitude).
 * Throws a descriptive Error if required (lat/lon) columns are missing.
 *
 * Returns { houses, skipped } where `skipped` lists rows that had
 * invalid/missing coordinates (so the UI can warn the user without failing).
 */
export function parseHouseCsv(text) {
  const lines = text
    .split(/\r\n|\n|\r/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    throw new Error('The CSV file is empty.');
  }

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  const nameIdx = findColumn(headers, HEADER_ALIASES.name);
  const latIdx = findColumn(headers, HEADER_ALIASES.lat);
  const lonIdx = findColumn(headers, HEADER_ALIASES.lon);

  if (latIdx === -1 || lonIdx === -1) {
    throw new Error(
      `Couldn't find latitude/longitude columns. Found headers: ${headers.join(', ')}. ` +
      `Expected something like "name, lat, lon".`
    );
  }

  const houses = [];
  const skipped = [];

  for (let i = 1; i < lines.length; i++) {
    const row = splitCsvLine(lines[i]);
    const rawLat = row[latIdx];
    const rawLon = row[lonIdx];
    const lat = parseFloat(rawLat);
    const lon = parseFloat(rawLon);

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      skipped.push({ row: i + 1, reason: 'Invalid or missing coordinates' });
      continue;
    }

    houses.push({
      id: `house-${i}`,
      name: nameIdx !== -1 && row[nameIdx] ? row[nameIdx].trim() : `House ${i}`,
      lat,
      lon,
    });
  }

  return { houses, skipped };
}

// ---- Distance ---------------------------------------------------------------

const EARTH_RADIUS_M = 6371000;

/** Haversine distance in meters between two lat/lon points. */
export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

// ---- Bulk analysis ------------------------------------------------------------

/**
 * Compare every house against every well.
 *
 * @param {Array} houses  [{ id, name, lat, lon }]
 * @param {Array} wells   [{ id, name, lat, lon, region? }]  -- your existing 12-well dataset
 * @param {number} radiusMeters  default 5000 (5km)
 * @returns {{
 *   byWell: Array<{ well, housesInRange: Array<{ house, distance }> }>,
 *   byHouse: Array<{ house, matches: Array<{ well, distance }>, inAnyRadius: boolean, nearestWell, nearestDistance }>,
 *   unmatchedHouses: Array<{ house, nearestWell, nearestDistance }>,
 * }}
 */
export function analyzeCsvProximity(houses, wells, radiusMeters = 5000) {
  const byWellMap = new Map(
    wells.map((well) => [well.id, { well, housesInRange: [] }])
  );

  const byHouse = houses.map((house) => {
    let nearestWell = null;
    let nearestDistance = Infinity;
    const matches = [];

    for (const well of wells) {
      const distance = haversineDistanceMeters(house.lat, house.lon, well.lat, well.lon);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestWell = well;
      }

      if (distance <= radiusMeters) {
        matches.push({ well, distance });
        byWellMap.get(well.id)?.housesInRange.push({ house, distance });
      }
    }

    matches.sort((a, b) => a.distance - b.distance);

    return {
      house,
      matches,
      inAnyRadius: matches.length > 0,
      nearestWell,
      nearestDistance,
    };
  });

  for (const entry of byWellMap.values()) {
    entry.housesInRange.sort((a, b) => a.distance - b.distance);
  }

  const unmatchedHouses = byHouse
    .filter((h) => !h.inAnyRadius)
    .map((h) => ({
      house: h.house,
      nearestWell: h.nearestWell,
      nearestDistance: h.nearestDistance,
    }));

  return {
    byWell: Array.from(byWellMap.values()),
    byHouse,
    unmatchedHouses,
  };
}