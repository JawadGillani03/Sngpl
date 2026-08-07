/**
 * CsvUploadPanel
 * Lets the user upload (or drag & drop) a CSV of house coordinates and
 * runs bulk proximity analysis against the given wells.
 *
 * CSV format: a header row plus one row per house.
 * Accepted headers (case-insensitive):
 *   name column:  name | house | house_name | label | title
 *   lat column:   lat | latitude
 *   lon column:   lon | lng | longitude
 *
 * Example:
 *   name,lat,lon
 *   Ali's House,33.5731,73.0617
 *   Sara's House,33.60,73.05
 *
 * Drop this file at: src/components/CSV/CsvUploadPanel.jsx
 */

import React, { useRef, useState } from 'react';
import { RiUploadCloud2Line, RiFileTextLine, RiCloseLine } from 'react-icons/ri';
import { parseHouseCsv, analyzeCsvProximity } from '../../utils/csvProximity';

export default function CsvUploadPanel({ wells, radiusMeters = 5000, onResults, darkMode }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const [skippedCount, setSkippedCount] = useState(0);
  const [houseCount, setHouseCount] = useState(0);

  const handleFile = (file) => {
    if (!file) return;
    setError(null);

    if (!wells || wells.length === 0) {
      setError('No wells are loaded to compare against.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const { houses, skipped } = parseHouseCsv(text);

        if (houses.length === 0) {
          setError('No valid coordinate rows were found in this CSV.');
          return;
        }

        const results = analyzeCsvProximity(houses, wells, radiusMeters);

        setFileName(file.name);
        setHouseCount(houses.length);
        setSkippedCount(skipped.length);
        onResults?.(results, houses);
      } catch (err) {
        setError(err.message || 'Could not parse this CSV file.');
      }
    };
    reader.onerror = () => setError('Could not read this file.');
    reader.readAsText(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const clear = () => {
    setFileName(null);
    setError(null);
    setSkippedCount(0);
    setHouseCount(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onResults?.(null, []);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`
        rounded-xl border-2 border-dashed p-3 sm:p-4 transition-all
        ${darkMode
          ? 'border-well-700 hover:border-petroleum-500/50 bg-well-900/40'
          : 'border-stone-200 hover:border-petroleum-300 bg-stone-50'
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleInputChange}
        className="hidden"
      />

      {!fileName ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`
            w-full flex flex-col items-center justify-center gap-2 py-4
            text-xs sm:text-sm font-body
            ${darkMode ? 'text-well-400 hover:text-petroleum-400' : 'text-stone-500 hover:text-petroleum-600'}
          `}
        >
          <RiUploadCloud2Line className="text-2xl" />
          <span className="font-medium">Upload house coordinates (CSV)</span>
          <span className="text-[10px] sm:text-xs opacity-70">
            Columns: name, lat, lon &middot; or drag &amp; drop
          </span>
        </button>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <RiFileTextLine className={`text-lg flex-shrink-0 ${darkMode ? 'text-petroleum-400' : 'text-petroleum-600'}`} />
            <div className="min-w-0">
              <p className={`text-xs sm:text-sm font-medium truncate ${darkMode ? 'text-well-100' : 'text-stone-800'}`}>
                {fileName}
              </p>
              <p className={`text-[10px] sm:text-xs ${darkMode ? 'text-well-500' : 'text-stone-400'}`}>
                {houseCount} house{houseCount === 1 ? '' : 's'} loaded
                {skippedCount > 0 ? ` · ${skippedCount} row${skippedCount === 1 ? '' : 's'} skipped` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={clear}
            className={`p-1.5 rounded-lg flex-shrink-0 ${darkMode ? 'hover:bg-well-800 text-well-400' : 'hover:bg-stone-200 text-stone-400'}`}
            title="Remove file"
          >
            <RiCloseLine className="text-lg" />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-[10px] sm:text-xs text-red-500 font-body">{error}</p>
      )}
    </div>
  );
}