/**
 * ProximityMap Component — Multi-Style Edition
 * Interactive Leaflet map showing well, home, and 5km radius circle
 * Supports multiple tile layer styles selectable by the user
 * Fully responsive across all screen sizes
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { calculateBounds, formatDistance } from '../../utils/geoUtils';

// Fix Leaflet default icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ── Map style definitions ──────────────────────────────────────────────────
//
// Each style has a base tile layer; some have an optional labels overlay.
// Icons are simple emoji for zero-dependency rendering.
// ──────────────────────────────────────────────────────────────────────────
const MAP_STYLES = [
  {
    id: 'satellite',
    label: 'Satellite',
    shortLabel: 'SAT',
    icon: '🛰️',
    base: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics',
      maxZoom: 19,
    },
    labels: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      opacity: 0.85,
      maxZoom: 19,
    },
    accentColor: '#0ea5e9',
  },
  {
    id: 'street',
    label: 'Street',
    shortLabel: 'STR',
    icon: '🗺️',
    base: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    },
    labels: null,
    accentColor: '#3b82f6',
  },
  {
    id: 'topo',
    label: 'Topo',
    shortLabel: 'TOPO',
    icon: '⛰️',
    base: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
      maxZoom: 17,
    },
    labels: null,
    accentColor: '#84cc16',
  },
  {
    id: 'terrain',
    label: 'Terrain',
    shortLabel: 'TER',
    icon: '🏔️',
    base: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles © Esri — Source: Esri',
      maxZoom: 13,
    },
    labels: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      opacity: 0.9,
      maxZoom: 13,
    },
    accentColor: '#a78bfa',
  },
  {
    id: 'dark',
    label: 'Dark',
    shortLabel: 'DRK',
    icon: '🌑',
    base: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    },
    labels: null,
    accentColor: '#f472b6',
  },
  {
    id: 'light',
    label: 'Light',
    shortLabel: 'LGT',
    icon: '☀️',
    base: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    },
    labels: null,
    accentColor: '#f97316',
  },
];

/**
 * Custom SVG marker icon factory
 */
function createCustomIcon(color, symbol) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${color}" flood-opacity="0.4"/>
        </filter>
      </defs>
      <path d="M17 2C9.82 2 4 7.82 4 15c0 10.5 13 27 13 27S30 25.5 30 15C30 7.82 24.18 2 17 2z"
        fill="${color}" stroke="white" stroke-width="1.5" filter="url(#shadow)"/>
      <text x="17" y="20" text-anchor="middle" font-size="13" fill="white" font-family="Arial" font-weight="bold">
        ${symbol}
      </text>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -44],
    className: '',
  });
}

const wellIcon = createCustomIcon('#0ea5e9', '⛽');
const homeIcon = createCustomIcon('#f59e0b', '🏠');

/**
 * Auto-zoom/pan to fit both markers
 */
function MapController({ well, home }) {
  const map = useMap();
  const hasZoomed = useRef(false);

  useEffect(() => {
    if (well && home) {
      const bounds = calculateBounds(
        [well.lat, well.lon],
        [home.lat, home.lon]
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      hasZoomed.current = true;
    } else if (well && !hasZoomed.current) {
      map.setView([well.lat, well.lon], 12);
    }
  }, [well, home, map]);

  return null;
}

/**
 * Invalidates map size on window resize and on mount
 */
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => map.invalidateSize(), 150);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [map]);

  return null;
}

/**
 * Map Style Selector Panel
 * Renders as a compact pill-row; collapses to a toggle button on very small screens.
 */
function MapStyleSelector({ styles, activeId, onChange, darkMode }) {
  const [expanded, setExpanded] = useState(false);
  const activeStyle = styles.find((s) => s.id === activeId);

  return (
    <div
      className={`
        absolute top-2 right-2 sm:top-3 sm:right-3 z-[999]
        flex flex-col items-end gap-1
      `}
    >
      {/* Toggle button (always visible on mobile, hidden on sm+ when expanded) */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className={`
          sm:hidden
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg backdrop-blur-sm
          text-[10px] font-body font-semibold transition-all
          ${darkMode
            ? 'bg-well-900/90 text-well-200 border border-well-600 hover:border-well-400'
            : 'bg-white/90 text-stone-700 border border-stone-300 hover:border-stone-400'
          }
        `}
      >
        <span>{activeStyle?.icon}</span>
        <span>{activeStyle?.shortLabel}</span>
        <span className="opacity-60">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Style buttons — always visible on sm+, toggle on mobile */}
      <div
        className={`
          flex flex-col sm:flex-row gap-1
          ${expanded ? 'flex' : 'hidden sm:flex'}
        `}
      >
        {styles.map((style) => {
          const isActive = style.id === activeId;
          return (
            <button
              key={style.id}
              onClick={() => {
                onChange(style.id);
                setExpanded(false);
              }}
              title={style.label}
              className={`
                flex items-center gap-1 sm:gap-1.5
                px-2 py-1 sm:px-2.5 sm:py-1.5
                rounded-lg backdrop-blur-sm
                text-[9px] xs:text-[10px] sm:text-xs font-body font-medium
                transition-all duration-150 cursor-pointer
                ${isActive
                  ? darkMode
                    ? 'bg-petroleum-600/90 text-white border border-petroleum-400 shadow-md'
                    : 'bg-petroleum-500/90 text-white border border-petroleum-400 shadow-md'
                  : darkMode
                    ? 'bg-well-900/80 text-well-300 border border-well-700 hover:border-well-500 hover:bg-well-800/80'
                    : 'bg-white/80 text-stone-600 border border-stone-200 hover:border-stone-400 hover:bg-white/95'
                }
              `}
            >
              <span className="leading-none">{style.icon}</span>
              {/* Show label text on sm+ only */}
              <span className="hidden sm:inline">{style.label}</span>
              {/* Show short label on mobile */}
              <span className="sm:hidden">{style.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ProximityMap({ result, darkMode }) {
  const [activeStyleId, setActiveStyleId] = useState('satellite');
  const [mapKey, setMapKey] = useState(Date.now());
  const mapRef = useRef(null);

  const defaultCenter = [33.5731, 73.0617];

  const well     = result?.well;
  const home     = result?.home;
  const isInside = result?.isInside;

  const activeStyle = MAP_STYLES.find((s) => s.id === activeStyleId);

  const circleColor =
    isInside === undefined
      ? (activeStyle?.accentColor ?? '#0ea5e9')
      : isInside
        ? '#10b981'
        : '#ef4444';

  // Remount map when dark mode OR map style changes
  // (remount is needed for some tile layers that don't hot-swap cleanly)
  useEffect(() => {
    setMapKey(Date.now());
  }, [darkMode, activeStyleId]);

  return (
    <div
      className={`
        relative rounded-xl overflow-hidden border flex-1 min-h-0 w-full
        ${darkMode ? 'border-well-700' : 'border-stone-200'}
      `}
      style={{ minHeight: 'clamp(260px, 45vw, 400px)', height: '100%' }}
    >
      {/* ── Map source label (top-left) ── */}
      <div
        className={`
          absolute top-2 left-2 sm:top-3 sm:left-3 z-[999]
          px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg backdrop-blur-sm
          flex items-center gap-1 sm:gap-1.5
          text-[9px] xs:text-[10px] sm:text-xs font-body pointer-events-none
          ${darkMode
            ? 'bg-well-900/80 text-well-300 border border-well-700'
            : 'bg-white/80 text-stone-600 border border-stone-200'
          }
        `}
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse-slow flex-shrink-0"
          style={{ backgroundColor: activeStyle?.accentColor ?? '#0ea5e9' }}
        />
        <span className="hidden xs:inline">{activeStyle?.label} View</span>
        <span className="xs:hidden">{activeStyle?.shortLabel}</span>
      </div>

      {/* ── Map style selector (top-right) ── */}
      <MapStyleSelector
        styles={MAP_STYLES}
        activeId={activeStyleId}
        onChange={setActiveStyleId}
        darkMode={darkMode}
      />

      {/* ── Legend (bottom-left) ── */}
      {result && (
        <div
          className={`
            absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-[999]
            px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg backdrop-blur-sm
            pointer-events-none
            max-w-[calc(100%-16px)] sm:max-w-[240px] md:max-w-none
            ${darkMode
              ? 'bg-well-900/80 text-well-300 border border-well-700'
              : 'bg-white/80 text-stone-600 border border-stone-200'
            }
          `}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[9px] xs:text-[10px] sm:text-xs font-body">
              <span className="w-2 h-2 rounded-full bg-petroleum-500 flex-shrink-0" />
              <span className="truncate">{well?.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] xs:text-[10px] sm:text-xs font-body">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <span className="truncate">{home?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[9px] xs:text-[10px] sm:text-xs font-mono">
            <span
              className={`
                w-2 h-2 rounded-full border-2 flex-shrink-0
                ${isInside ? 'border-emerald-400' : 'border-red-400'}
              `}
            />
            <span className={isInside ? 'text-emerald-400' : 'text-red-400'}>
              {formatDistance(result.distance)}
            </span>
          </div>
        </div>
      )}

      {/* ── Leaflet map ── */}
      <MapContainer
        key={mapKey}
        ref={mapRef}
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={true}
      >
        <MapResizeHandler />

        {/* ── Active base tile layer ── */}
        <TileLayer
          key={`base-${activeStyleId}`}
          attribution={activeStyle?.base.attribution ?? ''}
          url={activeStyle?.base.url ?? ''}
          maxZoom={activeStyle?.base.maxZoom ?? 19}
        />

        {/* ── Optional labels overlay ── */}
        {activeStyle?.labels && (
          <TileLayer
            key={`labels-${activeStyleId}`}
            url={activeStyle.labels.url}
            maxZoom={activeStyle.labels.maxZoom ?? 19}
            opacity={activeStyle.labels.opacity ?? 0.85}
            attribution=""
          />
        )}

        {/* Auto-zoom */}
        {well && <MapController well={well} home={home} />}

        {/* Well marker */}
        {well && (
          <Marker position={[well.lat, well.lon]} icon={wellIcon}>
            <Popup>
              <div className="font-body text-xs max-w-[180px] sm:max-w-[200px]">
                <p className="font-semibold text-petroleum-600 dark:text-petroleum-400 break-words">
                  ⛽ {well.name}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-[10px] mt-1 font-mono break-all">
                  {well.lat.toFixed(6)}°, {well.lon.toFixed(6)}°
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 5 km radius circle */}
        {well && (
          <Circle
            center={[well.lat, well.lon]}
            radius={5000}
            pathOptions={{
              color: circleColor,
              fillColor: circleColor,
              fillOpacity: 0.1,
              weight: 3,
              dashArray: isInside === undefined ? null : isInside ? null : '8, 6',
            }}
          />
        )}

        {/* Home marker */}
        {home && (
          <Marker position={[home.lat, home.lon]} icon={homeIcon}>
            <Popup>
              <div className="font-body text-xs max-w-[180px] sm:max-w-[200px]">
                <p className="font-semibold text-amber-600 dark:text-amber-400 break-words">
                  🏠 {home.name}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-[10px] mt-1 font-mono break-all">
                  {home.lat.toFixed(6)}°, {home.lon.toFixed(6)}°
                </p>
                {result && (
                  <p
                    className={`
                      text-[10px] mt-2 font-semibold
                      ${isInside
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-500 dark:text-red-400'
                      }
                    `}
                  >
                    {formatDistance(result.distance)} from well
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}