/**
 * StatsBar Component
 * Quick summary statistics displayed below the header
 * Fully responsive across all screen sizes
 */

import React from 'react';
import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiDatabase2Line,
  RiLineChartLine,
} from 'react-icons/ri';
import { formatDistance } from '../../utils/geoUtils';

export default function StatsBar({ history, savedWells, darkMode }) {
  const insideCount = history.filter((r) => r.isInside).length;
  const outsideCount = history.filter((r) => !r.isInside).length;
  const avgDistance =
    history.length > 0
      ? history.reduce((sum, r) => sum + r.distance, 0) / history.length
      : null;

  const stats = [
    {
      icon: RiDatabase2Line,
      label: 'Saved Wells',
      value: savedWells.length,
      color: 'text-petroleum-400',
      bg: darkMode ? 'bg-petroleum-600/10' : 'bg-petroleum-50',
    },
    {
      icon: RiLineChartLine,
      label: 'Total Analyses',
      value: history.length,
      color: darkMode ? 'text-well-300' : 'text-well-700',
      bg: darkMode ? 'bg-well-800' : 'bg-stone-50',
    },
    {
      icon: RiCheckboxCircleLine,
      label: 'Inside Radius',
      value: insideCount,
      color: 'text-emerald-400',
      bg: darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
    },
    {
      icon: RiCloseCircleLine,
      label: 'Outside Radius',
      value: outsideCount,
      color: 'text-red-400',
      bg: darkMode ? 'bg-red-500/10' : 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-5">
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <div
          key={label}
          className={`
            rounded-xl px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3
            flex items-center gap-2 sm:gap-2.5 md:gap-3
            ${darkMode
              ? 'bg-well-900 border border-well-800'
              : 'bg-white border border-stone-200'
            }
          `}
        >
          {/* Icon badge */}
          <div
            className={`
              w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9
              rounded-lg flex items-center justify-center flex-shrink-0
              ${bg}
            `}
          >
            <Icon className={`text-sm sm:text-base md:text-lg ${color}`} />
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p
              className={`
                font-mono font-bold leading-tight
                text-sm sm:text-base
                ${darkMode ? 'text-white' : 'text-well-900'}
              `}
            >
              {value}
            </p>
            <p
              className={`
                font-body leading-tight truncate
                text-[9px] xs:text-[10px] sm:text-xs
                ${darkMode ? 'text-well-500' : 'text-stone-400'}
              `}
            >
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}