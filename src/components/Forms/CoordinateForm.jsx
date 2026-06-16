/**
 * CoordinateForm Component
 * Input form for well or home coordinates
 * Fully responsive across all screen sizes
 * Includes 5km well proximity check for home coordinates
 *
 * CHANGES FROM PREVIOUS VERSION
 * ──────────────────────────────
 * • Removed RiMenuLine / RiCloseLine imports — those icons were for the old
 *   App-level sidebar toggle; the collapse button now uses RiArrowUpSLine /
 *   RiArrowDownSLine so it's visually distinct from the hamburger menu.
 * • Collapse toggle is now shown on ALL screen sizes (not just lg:hidden) so
 *   users can collapse either card on any viewport to reclaim vertical space —
 *   especially useful on mobile where the top-bar + bottom-bar eat into height.
 * • Dropdown panel z-index raised to z-[70] so it clears the Sidebar's fixed
 *   top-bar (z-40) and drawer (z-[60]) on mobile.
 * • No other logic changes.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  RiMapPinLine,
  RiHomeLine,
  RiErrorWarningLine,
  RiDatabase2Line,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiCheckLine,
  RiRadarLine,
  RiSignalWifiErrorLine,
} from 'react-icons/ri';

// ─── Haversine distance (km) between two lat/lon points ───────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function CoordinateForm({
  type = 'well',         // 'well' | 'home'
  form,
  onUpdate,
  errors,
  darkMode,
  onSaveWell,
  savedWells,            // optional: external array of saved wells to check against
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showPredefined, setShowPredefined] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [wellsInRange, setWellsInRange] = useState([]);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const isWell = type === 'well';
  const Icon   = isWell ? RiMapPinLine : RiHomeLine;
  const label  = isWell ? 'Well' : 'Home';

  const nameError  = errors[`${type}_name`];
  const coordError = errors[`${type}_coords`];

  // ─── Predefined wells data ─────────────────────────────────────────────────
  const predefinedWells = [
    { name: 'Dhok Hussain Well-1',  lat: 33.451539, lon: 71.585795, region: 'Dhok Hussain' },
    { name: 'Dhok Hussain Well-2',  lat: 33.453823, lon: 71.590830, region: 'Dhok Hussain' },
    { name: 'Tough Well-1',         lat: 33.564671, lon: 71.526270, region: 'Tough' },
    { name: 'Tough Well-2',         lat: 33.566764, lon: 71.523612, region: 'Tough' },
    { name: 'Tough Well-3',         lat: 33.568457, lon: 71.520554, region: 'Tough' },
    { name: 'Shekian Well-1',       lat: 33.583988, lon: 71.509603, region: 'Shekian' },
    { name: 'Makori East Well-1',   lat: 33.260341, lon: 71.335008, region: 'Makori East' },
    { name: 'Makori East Well-2',   lat: 33.269111, lon: 71.327344, region: 'Makori East' },
    { name: 'Makori East Well-3',   lat: 33.265298, lon: 71.344397, region: 'Makori East' },
    { name: 'Tolang Wast Well-1',   lat: 33.532068, lon: 71.638509, region: 'Tolang' },
    { name: 'Tolang Wast Well-2',   lat: 33.526168, lon: 71.641537, region: 'Tolang' },
    { name: 'Bilitang Well-1',   lat: 33.511638, lon: 71.596968, region: 'Bilitang' },
  ];

  // Merge predefined + any externally saved wells (deduplicate by name)
  const allWells = [
    ...predefinedWells,
    ...(savedWells || []).filter(
      (sw) => !predefinedWells.some((pw) => pw.name === sw.name)
    ),
  ];

  // ─── Proximity check ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isWell) { setWellsInRange([]); return; }

    const lat = parseFloat(form.lat);
    const lon = parseFloat(form.lon);

    if (isNaN(lat) || isNaN(lon)) { setWellsInRange([]); return; }

    const inRange = allWells
      .map((w) => ({ ...w, distance: haversineKm(lat, lon, w.lat, w.lon) }))
      .filter((w) => w.distance <= 5)
      .sort((a, b) => a.distance - b.distance);

    setWellsInRange(inRange);
  }, [form.lat, form.lon, isWell, savedWells]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Dropdown: filter + group ──────────────────────────────────────────────
  const filteredWells = predefinedWells.filter(
    (well) =>
      well.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      well.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedWells = filteredWells.reduce((groups, well) => {
    if (!groups[well.region]) groups[well.region] = [];
    groups[well.region].push(well);
    return groups;
  }, {});

  // ─── Auto-expand on error ──────────────────────────────────────────────────
  useEffect(() => {
    if ((nameError || coordError) && !isExpanded) setIsExpanded(true);
  }, [nameError, coordError, isExpanded]);

  // ─── Dropdown: auto-focus search ──────────────────────────────────────────
  useEffect(() => {
    if (showPredefined && searchInputRef.current)
      setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [showPredefined]);

  // ─── Dropdown: close on outside click ─────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showPredefined && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowPredefined(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPredefined]);

  // ─── Dropdown: close on Escape ────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showPredefined) {
        setShowPredefined(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPredefined]);

  const loadPredefinedWell = (well) => {
    onUpdate('name', well.name);
    onUpdate('lat', well.lat);
    onUpdate('lon', well.lon);
    setShowPredefined(false);
    setSearchTerm('');
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const hasValidCoords = form.lat && form.lon && !coordError;

  const inputClass = (hasError) => `
    w-full px-3 py-2.5 rounded-lg font-mono text-sm
    border transition-all duration-200 outline-none
    focus:ring-2 focus:ring-petroleum-500/30
    ${hasError
      ? 'border-red-500/60 bg-red-500/5 focus:border-red-400'
      : darkMode
        ? 'border-well-700 bg-well-900 text-white placeholder-well-600 focus:border-petroleum-500 focus:bg-well-800'
        : 'border-stone-200 bg-white text-stone-900 placeholder-stone-300 focus:border-petroleum-400'
    }
  `;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={`
        rounded-xl border overflow-visible transition-all duration-200
        ${darkMode
          ? 'bg-gradient-to-br from-well-900 to-well-950 border-well-800'
          : 'bg-white border-stone-200 shadow-sm hover:shadow-md'
        }
      `}
    >
      {/* ── Card Header ── */}
      <div
        className={`
          flex items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b
          ${darkMode
            ? 'bg-well-800/30 border-well-700'
            : 'bg-gradient-to-r from-stone-50 to-white border-stone-200'
          }
        `}
      >
        {/* Left: icon + title */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Icon badge */}
          <div
            className={`
              w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0
              transition-all duration-200
              ${isWell
                ? darkMode
                  ? 'bg-petroleum-600/20 text-petroleum-400'
                  : 'bg-petroleum-100 text-petroleum-600'
                : darkMode
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-amber-100 text-amber-600'
              }
            `}
          >
            <Icon className="text-base sm:text-lg" />
          </div>

          {/* Title */}
          <div className="min-w-0">
            <h3
              className={`
                font-display font-semibold text-sm sm:text-base leading-tight truncate
                ${darkMode ? 'text-white' : 'text-well-900'}
              `}
            >
              {label} Coordinates
            </h3>
            <p
              className={`
                text-xs font-body hidden sm:block truncate
                ${darkMode ? 'text-well-500' : 'text-stone-400'}
              `}
            >
              Enter {label.toLowerCase()} location data
            </p>
          </div>
        </div>

        {/* Right: action buttons + collapse toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

          {/* Predefined Wells dropdown — well type only */}
          {isWell && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowPredefined(!showPredefined)}
                className={`
                  flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg
                  text-xs font-medium transition-all duration-200 border whitespace-nowrap
                  ${showPredefined
                    ? darkMode
                      ? 'bg-petroleum-600/20 border-petroleum-500 text-petroleum-400'
                      : 'bg-petroleum-50 border-petroleum-300 text-petroleum-600'
                    : darkMode
                      ? 'border-well-700 text-well-300 hover:bg-well-800 hover:text-white'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }
                `}
              >
                <RiDatabase2Line className="text-sm flex-shrink-0" />
                <span className="hidden xs:inline sm:hidden">Wells</span>
                <span className="hidden sm:inline">Predefined Wells</span>
                <RiArrowDownSLine
                  className={`text-sm flex-shrink-0 transition-transform duration-200 ${showPredefined ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown panel
                  z-[70] ensures it clears the Sidebar drawer (z-[60]) and
                  top-bar (z-40) on mobile */}
              {showPredefined && (
                <div
                  className={`
                    absolute -right-1/2 mt-2 z-[70] rounded-xl shadow-2xl border overflow-hidden
                    w-[calc(100vw-2rem)] max-w-xs sm:max-w-sm md:w-96
                    animate-fade-in
                    ${darkMode ? 'bg-well-900 border-well-700' : 'bg-white border-stone-200'}
                  `}
                >
                  {/* Search */}
                  <div className={`p-3 border-b ${darkMode ? 'border-well-800' : 'border-stone-100'}`}>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search wells or regions…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`
                        w-full px-3 py-2 rounded-lg text-sm border
                        transition-all duration-200 outline-none
                        ${darkMode
                          ? 'bg-well-800 border-well-700 text-white placeholder-well-500 focus:border-petroleum-500'
                          : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:border-petroleum-400'
                        }
                      `}
                    />
                  </div>

                  {/* Wells list */}
                  <div className="max-h-72 ml-5 sm:max-h-96 overflow-y-auto overscroll-contain">
                    {Object.keys(groupedWells).length === 0 ? (
                      <div className="p-8 text-center">
                        <RiDatabase2Line
                          className={`text-3xl mx-auto mb-2 ${darkMode ? 'text-well-600' : 'text-stone-300'}`}
                        />
                        <p className={`text-sm ${darkMode ? 'text-well-500' : 'text-stone-400'}`}>
                          No wells found
                        </p>
                      </div>
                    ) : (
                      Object.entries(groupedWells).map(([region, wells]) => (
                        <div key={region}>
                          <div
                            className={`
                              px-3 py-2 text-xs font-semibold uppercase tracking-wider sticky top-0
                              ${darkMode
                                ? 'bg-well-800/80 text-petroleum-400 backdrop-blur-sm'
                                : 'bg-stone-50/90 text-petroleum-600 backdrop-blur-sm'
                              }
                            `}
                          >
                            {region}
                          </div>
                          {wells.map((well, idx) => (
                            <button
                              key={idx}
                              onClick={() => loadPredefinedWell(well)}
                              className={`
                                group w-full text-left px-3 py-3 border-b last:border-b-0
                                transition-all duration-150 hover:pl-4
                                ${darkMode
                                  ? 'hover:bg-well-800 border-well-800'
                                  : 'hover:bg-stone-50 border-stone-100'
                                }
                              `}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p
                                  className={`
                                    font-body text-sm font-medium truncate
                                    ${darkMode ? 'text-white' : 'text-well-900'}
                                  `}
                                >
                                  {well.name}
                                </p>
                                <RiCheckLine
                                  className={`
                                    text-sm flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity
                                    ${darkMode ? 'text-petroleum-400' : 'text-petroleum-500'}
                                  `}
                                />
                              </div>
                              <p className={`font-mono text-xs mt-0.5 ${darkMode ? 'text-well-500' : 'text-stone-400'}`}>
                                {well.lat.toFixed(6)}°, {well.lon.toFixed(6)}°
                              </p>
                            </button>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Save Well button */}
          {isWell && onSaveWell && (
            <button
              onClick={onSaveWell}
              className={`
                flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg
                text-xs font-medium transition-all duration-200 border whitespace-nowrap
                ${darkMode
                  ? 'bg-petroleum-600/20 border-petroleum-500/40 text-petroleum-400 hover:bg-petroleum-600/30'
                  : 'bg-petroleum-500 text-white border-petroleum-600 hover:bg-petroleum-600'
                }
              `}
            >
              <span aria-hidden="true">+</span>
              <span className="hidden xs:inline sm:hidden">Save</span>
              <span className="hidden sm:inline">Save Well</span>
            </button>
          )}

          {/* Collapse / expand toggle — all screen sizes */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse form' : 'Expand form'}
            className={`
              flex-shrink-0 p-1.5 rounded-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-petroleum-500/30
              ${darkMode
                ? 'text-well-400 hover:bg-well-700 hover:text-white'
                : 'text-stone-400 hover:bg-stone-100 hover:text-stone-700'
              }
            `}
          >
            {isExpanded
              ? <RiArrowUpSLine className="text-base" />
              : <RiArrowDownSLine className="text-base" />
            }
          </button>
        </div>
      </div>

      {/* ── Collapsible Form Body ── */}
      <div
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">

          {/* ── Name field ── */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-well-300' : 'text-stone-600'}`}
            >
              {label} Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              placeholder={isWell ? 'e.g., Alpha-7 Petroleum Well' : 'e.g., Johnson Residence'}
              className={inputClass(nameError)}
            />
            {nameError && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400 font-body animate-shake">
                <RiErrorWarningLine className="text-sm flex-shrink-0" />
                <span>{nameError}</span>
              </div>
            )}
          </div>

          {/* ── Lat / Lon ── */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-well-300' : 'text-stone-600'}`}
              >
                Latitude <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={form.lat}
                onChange={(e) => onUpdate('lat', e.target.value)}
                placeholder="e.g., 33.5731"
                className={inputClass(coordError)}
              />
            </div>
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-well-300' : 'text-stone-600'}`}
              >
                Longitude <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={form.lon}
                onChange={(e) => onUpdate('lon', e.target.value)}
                placeholder="e.g., 71.0617"
                className={inputClass(coordError)}
              />
            </div>
          </div>

          {/* Coordinate error */}
          {coordError && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 font-body animate-shake">
              <RiErrorWarningLine className="text-sm flex-shrink-0" />
              <span>{coordError}</span>
            </div>
          )}

          {/* ── Coordinate preview ── */}
          {hasValidCoords && (
            <div
              className={`
                px-3 py-2.5 rounded-lg font-mono text-xs
                transition-all duration-200
                ${darkMode
                  ? 'bg-gradient-to-r from-petroleum-600/10 to-transparent border border-petroleum-500/20 text-petroleum-400'
                  : 'bg-gradient-to-r from-petroleum-50 to-transparent border border-petroleum-200 text-petroleum-600'
                }
              `}
            >
              <div className="flex items-start gap-2">
                <span className="text-base leading-none mt-0.5" aria-hidden="true">📍</span>
                <span className="break-all leading-relaxed">
                  {parseFloat(form.lat).toFixed(6)}°, {parseFloat(form.lon).toFixed(6)}°
                </span>
              </div>
            </div>
          )}

          {/* ── Well Proximity Banner (home only) ── */}
          {!isWell && hasValidCoords && (
            <>
              {wellsInRange.length > 0 ? (
                /* ✅ One or more wells within 5 km */
                <div
                  className={`
                    rounded-xl border overflow-hidden
                    transition-all duration-300 animate-fade-in
                    ${darkMode
                      ? 'bg-emerald-500/5 border-emerald-500/25'
                      : 'bg-emerald-50 border-emerald-200'
                    }
                  `}
                >
                  {/* Header */}
                  <div
                    className={`
                      flex items-center gap-2 px-3 py-2 border-b
                      ${darkMode ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-emerald-200 bg-emerald-100/60'}
                    `}
                  >
                    <div className="relative flex-shrink-0">
                      <RiRadarLine
                        className={`text-base ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}
                      />
                      <span
                        className={`
                          absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-ping
                          ${darkMode ? 'bg-emerald-400' : 'bg-emerald-500'}
                        `}
                      />
                      <span
                        className={`
                          absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full
                          ${darkMode ? 'bg-emerald-400' : 'bg-emerald-500'}
                        `}
                      />
                    </div>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      Home lies within{' '}
                      <span className={`font-bold ${darkMode ? 'text-emerald-200' : 'text-emerald-800'}`}>
                        {wellsInRange.length} well{wellsInRange.length > 1 ? 's' : ''}
                      </span>{' '}
                      radius
                    </p>
                  </div>

                  {/* Wells list */}
                  <div className="divide-y divide-emerald-500/10">
                    {wellsInRange.map((well, idx) => (
                      <div
                        key={well.name}
                        className={`
                          flex items-center gap-3 px-3 py-2.5
                          ${darkMode ? 'hover:bg-emerald-500/5' : 'hover:bg-emerald-100/50'}
                          transition-colors duration-150
                        `}
                      >
                        {/* Rank badge */}
                        <span
                          className={`
                            w-5 h-5 rounded-full flex items-center justify-center
                            text-xs font-bold flex-shrink-0
                            ${idx === 0
                              ? darkMode
                                ? 'bg-emerald-500/30 text-emerald-300'
                                : 'bg-emerald-500 text-white'
                              : darkMode
                                ? 'bg-well-700 text-well-400'
                                : 'bg-stone-200 text-stone-500'
                            }
                          `}
                        >
                          {idx + 1}
                        </span>

                        {/* Well info */}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`
                              text-xs font-semibold truncate
                              ${idx === 0
                                ? darkMode ? 'text-emerald-300' : 'text-emerald-700'
                                : darkMode ? 'text-well-200' : 'text-stone-700'
                              }
                            `}
                          >
                            {well.name}
                          </p>
                          {well.region && (
                            <p className={`text-xs truncate ${darkMode ? 'text-well-500' : 'text-stone-400'}`}>
                              {well.region}
                            </p>
                          )}
                        </div>

                        {/* Distance badge */}
                        <span
                          className={`
                            font-mono text-xs px-2 py-0.5 rounded-full flex-shrink-0
                            ${idx === 0
                              ? darkMode
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-emerald-100 text-emerald-700'
                              : darkMode
                                ? 'bg-well-800 text-well-400'
                                : 'bg-stone-100 text-stone-500'
                            }
                          `}
                        >
                          {well.distance.toFixed(2)} km
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* ❌ No well within 5 km */
                <div
                  className={`
                    flex items-center gap-2.5 px-3 py-2.5 rounded-xl border
                    transition-all duration-300 animate-fade-in
                    ${darkMode
                      ? 'bg-well-800/40 border-well-700'
                      : 'bg-stone-50 border-stone-200'
                    }
                  `}
                >
                  <RiSignalWifiErrorLine
                    className={`text-base flex-shrink-0 ${darkMode ? 'text-well-500' : 'text-stone-400'}`}
                  />
                  <p className={`text-xs ${darkMode ? 'text-well-500' : 'text-stone-400'}`}>
                    No well within 5 km radius
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}