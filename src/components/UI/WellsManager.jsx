/**
 * WellsManager Component
 * View, manage, and load saved wells
 * Fully responsive across all screen sizes
 */

import React from 'react';
import {
  RiMapPin2Line,
  RiDeleteBinLine,
  RiArrowRightLine,
  RiDropLine,
} from 'react-icons/ri';

export default function WellsManager({
  savedWells,
  predefinedWells = [], // Add this prop
  onDelete,
  onLoad,
  darkMode,
}) {
  // Combine predefined and saved wells
  const allWells = [
    ...predefinedWells.map(well => ({
      ...well,
      isPredefined: true,
      savedAt: new Date().toISOString(),
    })),
    ...savedWells
  ];

  // ── Empty state ──
  if (allWells.length === 0) {
    return (
      <div
        className={`
          rounded-xl border flex flex-col items-center justify-center
          py-10 sm:py-12 md:py-16 px-4
          ${darkMode
            ? 'bg-well-900 border-well-800 text-well-500'
            : 'bg-stone-50 border-stone-200 text-stone-400'
          }
        `}
      >
        <RiDropLine className="text-3xl sm:text-4xl mb-3 opacity-40" />
        <p className="font-body text-sm text-center">No saved wells</p>
        <p className="font-body text-xs mt-1 opacity-60 text-center max-w-[250px]">
          Enter well coordinates and click "Save" to store them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 sm:space-y-3 animate-fade-up">
      {/* Count label - show breakdown */}
      <p className={`font-body text-xs sm:text-sm ${darkMode ? 'text-well-400' : 'text-stone-500'}`}>
        {predefinedWells.length > 0 && `${predefinedWells.length} default wells • `}
        {savedWells.length} saved {savedWells.length === 1 ? 'well' : 'wells'}
      </p>

      {/* Well cards */}
      <div className="grid gap-2.5 sm:gap-3">
        {allWells.map((well) => (
          <div
            key={well.id + (well.isPredefined ? '-predefined' : '')}
            className={`
              rounded-xl border transition-all duration-200
              ${well.isPredefined 
                ? (darkMode 
                    ? 'bg-well-800/50 border-well-700/50' 
                    : 'bg-stone-100/50 border-stone-300/50')
                : (darkMode 
                    ? 'bg-well-900 border-well-800 hover:border-well-700' 
                    : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-card')
              }
            `}
          >
            {/* ── Card inner: always flex-row, wraps content gracefully ── */}
            <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4 p-3 sm:p-3.5 md:p-4">

              {/* Icon badge */}
              <div
                className={`
                  w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
                  rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
                  ${well.isPredefined
                    ? (darkMode
                        ? 'bg-amber-600/15 text-amber-400'
                        : 'bg-amber-50 text-amber-600')
                    : (darkMode
                        ? 'bg-petroleum-600/15 text-petroleum-400'
                        : 'bg-petroleum-50 text-petroleum-600')
                  }
                `}
              >
                <RiMapPin2Line className="text-sm sm:text-base md:text-lg" />
              </div>

              {/* Info block — takes all remaining space */}
              <div className="flex-1 min-w-0">
                {/* Name with predefined badge */}
                <div className="flex items-center gap-2">
                  <p
                    className={`
                      font-body font-semibold text-sm leading-tight truncate
                      ${darkMode ? 'text-white' : 'text-well-900'}
                    `}
                  >
                    {well.name}
                  </p>
                  {well.isPredefined && (
                    <span className={`
                      font-body text-[10px] px-1.5 py-0.5 rounded-full 
                      ${darkMode 
                        ? 'bg-amber-600/20 text-amber-400' 
                        : 'bg-amber-100 text-amber-700'}
                    `}>
                      Default
                    </span>
                  )}
                </div>

                {/* Coordinates */}
                <p
                  className={`
                    font-mono text-[10px] sm:text-xs mt-0.5 truncate
                    ${darkMode ? 'text-well-500' : 'text-stone-400'}
                  `}
                >
                  {well.lat.toFixed(6)}, {well.lon.toFixed(6)}
                </p>

                {/* Region for predefined, Operator/type for saved */}
                {well.isPredefined ? (
                  <p
                    className={`
                      font-body text-[10px] sm:text-xs mt-0.5 truncate
                      ${darkMode ? 'text-well-600' : 'text-stone-300'}
                    `}
                  >
                    {well.region || 'Default well'}
                  </p>
                ) : (
                  well.operator && (
                    <p
                      className={`
                        font-body text-[10px] sm:text-xs mt-0.5 truncate
                        ${darkMode ? 'text-well-600' : 'text-stone-300'}
                      `}
                    >
                      {well.type && <span className="mr-1.5">{well.type}</span>}
                      {well.operator}
                    </p>
                  )
                )}

                {/* Date + depth on mobile */}
                <div className="flex items-center gap-2 mt-1.5 sm:hidden">
                  <p className={`font-body text-[10px] ${darkMode ? 'text-well-600' : 'text-stone-400'}`}>
                    {well.isPredefined ? 'Default' : new Date(well.savedAt).toLocaleDateString()}
                  </p>
                  {well.depth && (
                    <p className={`font-mono text-[10px] ${darkMode ? 'text-well-600' : 'text-stone-400'}`}>
                      · {well.depth}
                    </p>
                  )}
                </div>
              </div>

              {/* Date + depth on sm+ */}
              <div className="hidden sm:flex flex-col items-end gap-0.5 flex-shrink-0 mt-0.5">
                <p className={`font-body text-xs ${darkMode ? 'text-well-600' : 'text-stone-400'}`}>
                  {well.isPredefined ? 'Default' : new Date(well.savedAt).toLocaleDateString()}
                </p>
                {well.depth && (
                  <p className={`font-mono text-xs ${darkMode ? 'text-well-600' : 'text-stone-400'}`}>
                    {well.depth}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 self-center">
                {/* Load */}
                <button
                  onClick={() => onLoad(well)}
                  title="Load into calculator"
                  className={`
                    flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg
                    text-xs font-body transition-all border whitespace-nowrap
                    ${darkMode
                      ? 'border-petroleum-600/30 text-petroleum-400 hover:bg-petroleum-600/20'
                      : 'border-petroleum-300 text-petroleum-600 hover:bg-petroleum-50'
                    }
                  `}
                >
                  Use
                  <RiArrowRightLine className="text-xs sm:text-sm" />
                </button>

                {/* Delete - only for non-predefined wells */}
                {!well.isPredefined && (
                  <button
                    onClick={() => onDelete(well.id)}
                    title="Delete well"
                    className={`
                      p-1.5 rounded-lg transition-all flex-shrink-0
                      ${darkMode
                        ? 'text-well-600 hover:text-red-400 hover:bg-red-500/10'
                        : 'text-stone-300 hover:text-red-500 hover:bg-red-50'
                      }
                    `}
                  >
                    <RiDeleteBinLine className="text-sm" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}