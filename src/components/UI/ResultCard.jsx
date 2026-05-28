/**
 * ResultCard Component
 * Displays the distance calculation result with status badge,
 * bearing, and a prominent visual indicator
 * Fully responsive across all screen sizes
 */

import React from 'react';
import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiCompassLine,
  RiRulerLine,
  RiTimeLine,
} from 'react-icons/ri';
import { formatDistance } from '../../utils/geoUtils';

export default function ResultCard({ result, darkMode }) {
  if (!result) return null;

  const { well, home, distance, isInside, bearing } = result;

  const StatusIcon = isInside ? RiCheckboxCircleLine : RiCloseCircleLine;

  // Clamp bar fill: map 0–10 km → 0–100%
  const barPercent = Math.min((distance / 10) * 100, 100);
  // Percentage of the 5 km radius used
  const radiusPercent = ((distance / 5) * 100).toFixed(0);

  return (
    <div
      className={`
        rounded-xl border overflow-hidden animate-fade-up
        ${darkMode ? 'bg-well-900 border-well-800' : 'bg-white border-stone-200'}
      `}
    >
      {/* ── Status Banner ── */}
      <div
        className={`
          px-3 sm:px-4 md:px-5 py-3 sm:py-4
          flex items-center justify-between gap-2 border-b
          ${isInside
            ? darkMode
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-emerald-50 border-emerald-200'
            : darkMode
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-red-50 border-red-200'
          }
        `}
      >
        {/* Icon + text */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <StatusIcon
            className={`
              text-lg sm:text-xl md:text-2xl flex-shrink-0
              ${isInside ? 'text-emerald-400' : 'text-red-400'}
            `}
          />
          <div className="min-w-0">
            <p
              className={`
                font-display font-bold text-sm sm:text-base md:text-lg leading-tight
                ${isInside ? 'text-emerald-400' : 'text-red-400'}
              `}
            >
              {isInside ? 'Inside 5 KM Radius' : 'Outside 5 KM Radius'}
            </p>
            <p
              className={`
                font-body text-[10px] sm:text-xs mt-0.5 truncate
                ${darkMode ? 'text-well-400' : 'text-stone-500'}
              `}
            >
              {well.name} → {home.name}
            </p>
          </div>
        </div>

        {/* Status pill — always visible, shrinks gracefully */}
        <span
          className={`
            flex-shrink-0 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5
            rounded-full font-mono text-[9px] sm:text-[10px] md:text-xs
            font-bold uppercase tracking-wider whitespace-nowrap
            ${isInside
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }
          `}
        >
          {isInside ? 'INSIDE' : 'OUTSIDE'}
        </span>
      </div>

      {/* ── Metrics Grid ──
          xs: 1 col stacked
          sm: 3 cols side-by-side */}
      <div className="p-3 sm:p-4 md:p-5 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {/* Distance */}
        <div
          className={`
            rounded-lg p-2.5 sm:p-3 md:p-3.5 text-center
            ${darkMode ? 'bg-well-800' : 'bg-stone-50'}
          `}
        >
          <RiRulerLine
            className={`
              text-base sm:text-lg md:text-xl mx-auto mb-1
              ${darkMode ? 'text-petroleum-400' : 'text-petroleum-500'}
            `}
          />
          <p
            className={`
              font-mono font-bold text-sm sm:text-base md:text-lg leading-tight
              ${darkMode ? 'text-white' : 'text-well-900'}
            `}
          >
            {formatDistance(distance)}
          </p>
          <p
            className={`
              font-body text-[9px] sm:text-[10px] md:text-xs mt-0.5
              ${darkMode ? 'text-well-500' : 'text-stone-400'}
            `}
          >
            Distance
          </p>
        </div>

        {/* Bearing */}
        <div
          className={`
            rounded-lg p-2.5 sm:p-3 md:p-3.5 text-center
            ${darkMode ? 'bg-well-800' : 'bg-stone-50'}
          `}
        >
          <RiCompassLine
            className={`
              text-base sm:text-lg md:text-xl mx-auto mb-1
              ${darkMode ? 'text-petroleum-400' : 'text-petroleum-500'}
            `}
          />
          <p
            className={`
              font-mono font-bold text-sm sm:text-base md:text-lg leading-tight
              ${darkMode ? 'text-white' : 'text-well-900'}
            `}
          >
            {bearing.cardinal}
          </p>
          <p
            className={`
              font-body text-[9px] sm:text-[10px] md:text-xs mt-0.5
              ${darkMode ? 'text-well-500' : 'text-stone-400'}
            `}
          >
            {bearing.degrees}° Bearing
          </p>
        </div>

        {/* Radius % */}
        <div
          className={`
            rounded-lg p-2.5 sm:p-3 md:p-3.5 text-center
            ${darkMode ? 'bg-well-800' : 'bg-stone-50'}
          `}
        >
          <div
            className={`
              text-base sm:text-lg md:text-xl font-mono font-bold mx-auto mb-1
              ${isInside ? 'text-emerald-400' : 'text-red-400'}
            `}
          >
            {radiusPercent}%
          </div>
          <p
            className={`
              font-mono font-bold text-sm sm:text-base md:text-lg leading-tight
              ${darkMode ? 'text-white' : 'text-well-900'}
            `}
          >
            5.000 km
          </p>
          <p
            className={`
              font-body text-[9px] sm:text-[10px] md:text-xs mt-0.5
              ${darkMode ? 'text-well-500' : 'text-stone-400'}
            `}
          >
            Radius Limit
          </p>
        </div>
      </div>

      {/* ── Distance Bar ── */}
      <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
        {/* Labels */}
        <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-1">
          <span
            className={`
              font-body text-[9px] sm:text-[10px] md:text-xs flex-shrink-0
              ${darkMode ? 'text-well-500' : 'text-stone-400'}
            `}
          >
            0 km
          </span>
          <span
            className={`
              font-body text-[9px] sm:text-[10px] md:text-xs font-medium text-center
              min-w-0 truncate px-1
              ${darkMode ? 'text-well-300' : 'text-stone-600'}
            `}
          >
            {formatDistance(distance)} / 5 km
          </span>
          <span
            className={`
              font-body text-[9px] sm:text-[10px] md:text-xs flex-shrink-0
              ${darkMode ? 'text-well-500' : 'text-stone-400'}
            `}
          >
            5+ km
          </span>
        </div>

        {/* Track */}
        <div className="relative">
          <div
            className={`w-full h-1.5 sm:h-2 rounded-full overflow-hidden ${darkMode ? 'bg-well-800' : 'bg-stone-100'}`}
          >
            <div
              className={`
                h-full rounded-full transition-all duration-700 ease-out
                ${isInside ? 'bg-emerald-500' : 'bg-red-500'}
              `}
              style={{ width: `${barPercent}%` }}
            />
          </div>

          {/* 5 km marker at 50% of the 10 km scale */}
          <div className="relative mt-1" style={{ marginLeft: '50%' }}>
            <div
              className={`
                absolute -top-3 sm:-top-3.5 -translate-x-1/2
                w-px h-2.5 sm:h-3
                ${darkMode ? 'bg-well-600' : 'bg-stone-300'}
              `}
            />
            <p
              className={`
                absolute -translate-x-1/2 font-mono
                text-[9px] sm:text-[10px] md:text-xs
                whitespace-nowrap
                ${darkMode ? 'text-well-600' : 'text-stone-400'}
              `}
            >
              5km
            </p>
          </div>
        </div>
      </div>

      {/* ── Timestamp ── */}
      <div
        className={`
          px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 border-t
          flex items-center gap-1.5
          ${darkMode ? 'border-well-800' : 'border-stone-100'}
        `}
      >
        <RiTimeLine
          className={`
            text-xs sm:text-sm flex-shrink-0
            ${darkMode ? 'text-well-600' : 'text-stone-300'}
          `}
        />
        <p
          className={`
            font-mono text-[9px] sm:text-[10px] md:text-xs truncate
            ${darkMode ? 'text-well-600' : 'text-stone-400'}
          `}
        >
          Calculated {new Date(result.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}