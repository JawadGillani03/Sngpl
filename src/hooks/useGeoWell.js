/**
 * useGeoWell Hook
 * Central state management for the GeoWell application
 * Handles wells, calculations, history, and theme
 */

import { useState, useCallback, useEffect } from 'react';
import {
  haversineDistance,
  getProximityStatus,
  validateCoordinates,
  generateId,
  exportToCSV,
  downloadCSV,
  getBearing,
} from '../utils/geoUtils';
import {
  wellsStorage,
  historyStorage,
  themeStorage,
} from '../services/storageService';
import { EXAMPLE_WELLS, EXAMPLE_HISTORY } from '../assets/exampleData';

export function useGeoWell() {
  // ── Theme ──────────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => themeStorage.get() === 'dark');

  const toggleTheme = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      themeStorage.set(next ? 'dark' : 'light');
      return next;
    });
  }, []);

  // ── Wells list (saved wells) ───────────────────────────────────────────────
  const [savedWells, setSavedWells] = useState(() => {
    const stored = wellsStorage.getAll();
    return stored.length > 0 ? stored : EXAMPLE_WELLS;
  });

  // ── Calculation history ────────────────────────────────────────────────────
  const [history, setHistory] = useState(() => {
    const stored = historyStorage.getAll();
    return stored.length > 0 ? stored : EXAMPLE_HISTORY;
  });

  // ── Current form state ─────────────────────────────────────────────────────
  const [wellForm, setWellForm] = useState({
    name: '',
    lat: '',
    lon: '',
  });

  const [homeForm, setHomeForm] = useState({
    name: '',
    lat: '',
    lon: '',
  });

  // ── Calculation result ─────────────────────────────────────────────────────
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'history' | 'wells'

  // Persist wells to storage when changed
  useEffect(() => {
    wellsStorage.save(savedWells);
  }, [savedWells]);

  // ── Form handlers ──────────────────────────────────────────────────────────
  const updateWellForm = useCallback((field, value) => {
    setWellForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [`well_${field}`]: null }));
  }, []);

  const updateHomeForm = useCallback((field, value) => {
    setHomeForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [`home_${field}`]: null }));
  }, []);

  // ── Load a saved well into the form ───────────────────────────────────────
  const loadWellIntoForm = useCallback((well) => {
    setWellForm({ name: well.name, lat: String(well.lat), lon: String(well.lon) });
    setActiveTab('calculator');
  }, []);

  // ── Validate form ──────────────────────────────────────────────────────────
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!wellForm.name.trim()) newErrors.well_name = 'Well name is required';
    if (!homeForm.name.trim()) newErrors.home_name = 'Home name is required';

    const wellCoords = validateCoordinates(wellForm.lat, wellForm.lon);
    if (!wellCoords.valid) {
      newErrors.well_coords = wellCoords.error;
    }

    const homeCoords = validateCoordinates(homeForm.lat, homeForm.lon);
    if (!homeCoords.valid) {
      newErrors.home_coords = homeCoords.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [wellForm, homeForm]);

  // ── Run calculation ────────────────────────────────────────────────────────
  const calculate = useCallback(() => {
    if (!validateForm()) return;

    const wLat = parseFloat(wellForm.lat);
    const wLon = parseFloat(wellForm.lon);
    const hLat = parseFloat(homeForm.lat);
    const hLon = parseFloat(homeForm.lon);

    const distance = haversineDistance(wLat, wLon, hLat, hLon);
    const proximity = getProximityStatus(distance);
    const bearing = getBearing(wLat, wLon, hLat, hLon);

    const newResult = {
      well: { name: wellForm.name, lat: wLat, lon: wLon },
      home: { name: homeForm.name, lat: hLat, lon: hLon },
      distance,
      bearing,
      ...proximity,
      timestamp: new Date().toISOString(),
    };

    setResult(newResult);

    // Save to history
    const historyRecord = {
      id: generateId(),
      ...newResult,
    };

    const newHistory = [historyRecord, ...history].slice(0, 100);
    setHistory(newHistory);
    historyStorage.add(historyRecord);
  }, [wellForm, homeForm, validateForm, history]);

  // ── Save current well to saved wells list ─────────────────────────────────
  const saveWell = useCallback(() => {
    if (!wellForm.name || !wellForm.lat || !wellForm.lon) return;
    const well = {
      id: generateId(),
      name: wellForm.name,
      lat: parseFloat(wellForm.lat),
      lon: parseFloat(wellForm.lon),
      type: 'Unknown',
      savedAt: new Date().toISOString(),
    };
    setSavedWells((prev) => [well, ...prev]);
  }, [wellForm]);

  // ── Delete a saved well ────────────────────────────────────────────────────
  const deleteWell = useCallback((id) => {
    setSavedWells((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // ── Delete a history record ───────────────────────────────────────────────
  const deleteHistoryRecord = useCallback((id) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
    historyStorage.remove(id);
  }, []);

  // ── Clear all history ─────────────────────────────────────────────────────
  const clearHistory = useCallback(() => {
    setHistory([]);
    historyStorage.clear();
  }, []);

  // ── Reset calculator form ─────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setWellForm({ name: '', lat: '', lon: '' });
    setHomeForm({ name: '', lat: '', lon: '' });
    setResult(null);
    setErrors({});
  }, []);

  // ── Export to CSV ─────────────────────────────────────────────────────────
  const handleExportCSV = useCallback(() => {
    if (history.length === 0) return;
    const csv = exportToCSV(history);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `geowell-analysis-${date}.csv`);
  }, [history]);

  // ── Load example data ─────────────────────────────────────────────────────
  const loadExample = useCallback(() => {
    setWellForm({
      name: 'Alpha-7 Petroleum Well',
      lat: '33.5731',
      lon: '73.0617',
    });
    setHomeForm({
      name: 'Residence Alpha',
      lat: '33.5950',
      lon: '73.0480',
    });
    setResult(null);
    setErrors({});
  }, []);

  return {
    // Theme
    darkMode,
    toggleTheme,
    // Forms
    wellForm,
    homeForm,
    updateWellForm,
    updateHomeForm,
    errors,
    // Wells
    savedWells,
    saveWell,
    deleteWell,
    loadWellIntoForm,
    // Calculation
    result,
    calculate,
    resetForm,
    loadExample,
    // History
    history,
    deleteHistoryRecord,
    clearHistory,
    // Export
    handleExportCSV,
    // Navigation
    activeTab,
    setActiveTab,
  };
}
