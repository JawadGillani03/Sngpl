/**
 * ProximityResultsPanel
 * Displays bulk CSV proximity results:
 *  - a list of wells, each with the houses inside its 5km radius
 *  - a separate list of houses that fell outside every well's radius
 *
 * Drop this file at: src/components/UI/ProximityResultsPanel.jsx
 */

import React, { useState } from 'react';
import { RiGasStationLine, RiHome4Line, RiAlertLine } from 'react-icons/ri';
import { formatDistance } from '../../utils/geoUtils';

export default function ProximityResultsPanel({ results, darkMode }) {
  const [openWellId, setOpenWellId] = useState(null);

  if (!results) return null;

  const { byWell, unmatchedHouses, byHouse } = results;
  const wellsWithHouses = byWell.filter((w) => w.housesInRange.length > 0);
  const totalInRange = byHouse.filter((h) => h.inAnyRadius).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Summary */}
      <div
        className={`
          flex items-center justify-between rounded-xl px-3 py-2.5 text-xs sm:text-sm font-body
          ${darkMode ? 'bg-well-900/60 text-well-300 border border-well-700' : 'bg-stone-50 text-stone-600 border border-stone-200'}
        `}
      >
        <span>
          <span className="font-semibold text-emerald-500">{totalInRange}</span> in range ·{' '}
          <span className="font-semibold text-red-400">{unmatchedHouses.length}</span> out of range
        </span>
        <span className="opacity-60">{byHouse.length} total</span>
      </div>

      {/* Wells with houses in range */}
      {wellsWithHouses.length === 0 && (
        <p className={`text-xs font-body text-center py-2 ${darkMode ? 'text-well-500' : 'text-stone-400'}`}>
          No houses fell within 5 km of any well.
        </p>
      )}

      {wellsWithHouses.map(({ well, housesInRange }) => {
        const isOpen = openWellId === well.id;
        return (
          <div
            key={well.id}
            className={`rounded-xl border overflow-hidden ${darkMode ? 'border-well-700' : 'border-stone-200'}`}
          >
            <button
              onClick={() => setOpenWellId(isOpen ? null : well.id)}
              className={`
                w-full flex items-center justify-between px-3 py-2.5
                text-xs sm:text-sm font-body font-medium
                ${darkMode ? 'bg-well-900/60 text-well-100 hover:bg-well-900' : 'bg-white text-stone-800 hover:bg-stone-50'}
              `}
            >
              <span className="flex items-center gap-2 min-w-0">
                <RiGasStationLine className="text-petroleum-500 flex-shrink-0" />
                <span className="truncate">{well.name}</span>
              </span>
              <span
                className={`
                  flex-shrink-0 ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold
                  ${darkMode ? 'bg-petroleum-500/20 text-petroleum-300' : 'bg-petroleum-50 text-petroleum-600'}
                `}
              >
                {housesInRange.length} house{housesInRange.length === 1 ? '' : 's'}
              </span>
            </button>

            {isOpen && (
              <ul className={`divide-y ${darkMode ? 'divide-well-800' : 'divide-stone-100'}`}>
                {housesInRange.map(({ house, distance }) => (
                  <li
                    key={house.id}
                    className={`
                      flex items-center justify-between px-3 py-2 text-xs font-body
                      ${darkMode ? 'text-well-300' : 'text-stone-600'}
                    `}
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      <RiHome4Line className="text-amber-500 flex-shrink-0" />
                      <span className="truncate">{house.name}</span>
                    </span>
                    <span className="font-mono text-[10px] flex-shrink-0 ml-2">
                      {formatDistance(distance)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {/* Houses out of range of every well */}
      {unmatchedHouses.length > 0 && (
        <div className={`rounded-xl border overflow-hidden ${darkMode ? 'border-well-700' : 'border-stone-200'}`}>
          <div
            className={`
              flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-body font-medium
              ${darkMode ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-600'}
            `}
          >
            <RiAlertLine />
            <span>
              {unmatchedHouses.length} house{unmatchedHouses.length === 1 ? '' : 's'} outside every well's radius
            </span>
          </div>
          <ul className={`divide-y ${darkMode ? 'divide-well-800' : 'divide-stone-100'}`}>
            {unmatchedHouses.map(({ house, nearestWell, nearestDistance }) => (
              <li
                key={house.id}
                className={`
                  flex items-center justify-between px-3 py-2 text-xs font-body
                  ${darkMode ? 'text-well-400' : 'text-stone-500'}
                `}
              >
                <span className="truncate">{house.name}</span>
                <span className="font-mono text-[10px] text-right flex-shrink-0 ml-2 opacity-70">
                  nearest: {nearestWell?.name ?? '—'} ({formatDistance(nearestDistance)})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}