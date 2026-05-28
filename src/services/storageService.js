/**
 * Storage Service
 * Manages persistence of wells, homes, and calculation history
 * using localStorage
 */

const KEYS = {
  WELLS: 'geowell_wells',
  HISTORY: 'geowell_history',
  THEME: 'geowell_theme',
  SETTINGS: 'geowell_settings',
};

const MAX_HISTORY = 100;

/**
 * Generic get with JSON parsing
 */
function get(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Generic set with JSON serialization
 */
function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ─── Wells ───────────────────────────────────────────────────────────────────

export const wellsStorage = {
  getAll: () => get(KEYS.WELLS, []),
  
  save: (wells) => set(KEYS.WELLS, wells),
  
  add: (well) => {
    const wells = get(KEYS.WELLS, []);
    wells.push({ ...well, savedAt: new Date().toISOString() });
    return set(KEYS.WELLS, wells);
  },
  
  remove: (id) => {
    const wells = get(KEYS.WELLS, []).filter((w) => w.id !== id);
    return set(KEYS.WELLS, wells);
  },
  
  update: (id, updates) => {
    const wells = get(KEYS.WELLS, []).map((w) =>
      w.id === id ? { ...w, ...updates } : w
    );
    return set(KEYS.WELLS, wells);
  },
};

// ─── History ─────────────────────────────────────────────────────────────────

export const historyStorage = {
  getAll: () => get(KEYS.HISTORY, []),
  
  add: (record) => {
    let history = get(KEYS.HISTORY, []);
    // Prepend new records, keep max limit
    history = [record, ...history].slice(0, MAX_HISTORY);
    return set(KEYS.HISTORY, history);
  },
  
  remove: (id) => {
    const history = get(KEYS.HISTORY, []).filter((r) => r.id !== id);
    return set(KEYS.HISTORY, history);
  },
  
  clear: () => set(KEYS.HISTORY, []),
  
  getByWell: (wellId) =>
    get(KEYS.HISTORY, []).filter((r) => r.well.id === wellId),
};

// ─── Theme ────────────────────────────────────────────────────────────────────

export const themeStorage = {
  get: () => get(KEYS.THEME, 'dark'),
  set: (theme) => set(KEYS.THEME, theme),
};

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settingsStorage = {
  get: () =>
    get(KEYS.SETTINGS, {
      radiusKm: 5,
      mapTile: 'osm',
      autoFit: true,
    }),
  set: (settings) => set(KEYS.SETTINGS, settings),
};
