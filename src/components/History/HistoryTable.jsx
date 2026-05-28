/**
 * HistoryTable Component
 * Displays paginated calculation history with delete and export actions
 */

import React, { useState } from 'react';
import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiDeleteBinLine,
  RiMapPin2Line,
  RiHomeLine,
} from 'react-icons/ri';
import { formatDistance } from '../../utils/geoUtils';

const PAGE_SIZE = 10;

export default function HistoryTable({
  history,
  onDelete,
  onClear,
  darkMode,
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(history.length / PAGE_SIZE);
  const pageItems = history.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (history.length === 0) {
    return (
      <div className={`
        rounded-xl border flex flex-col items-center justify-center py-12 sm:py-16 px-4
        ${darkMode ? 'bg-well-900 border-well-800 text-well-500' : 'bg-stone-50 border-stone-200 text-stone-400'}
      `}>
        <RiMapPin2Line className="text-3xl sm:text-4xl mb-3 opacity-40" />
        <p className="font-body text-sm text-center">No calculations yet</p>
        <p className="font-body text-xs mt-1 opacity-60 text-center">Run the proximity calculator to see history here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-up">
      {/* Table header actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className={`font-body text-sm ${darkMode ? 'text-well-400' : 'text-stone-500'}`}>
          {history.length} total records
        </p>
        <button
          onClick={onClear}
          className={`
            self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body
            transition-all border w-fit
            ${darkMode
              ? 'border-red-800/40 text-red-400 hover:bg-red-500/10'
              : 'border-red-200 text-red-500 hover:bg-red-50'
            }
          `}
        >
          <RiDeleteBinLine />
          Clear All
        </button>
      </div>

      {/* Desktop Table View - hidden on mobile */}
      <div className={`hidden md:block rounded-xl border overflow-hidden ${darkMode ? 'border-well-800' : 'border-stone-200'}`}>
        {/* Table header */}
        <div className={`
          grid grid-cols-12 gap-2 px-4 py-2.5 text-xs font-display font-semibold uppercase tracking-wider
          ${darkMode ? 'bg-well-800 text-well-500' : 'bg-stone-50 text-stone-400'}
        `}>
          <div className="col-span-1">Status</div>
          <div className="col-span-3">Well</div>
          <div className="col-span-3">Home</div>
          <div className="col-span-2">Distance</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1" />
        </div>

        {/* Rows */}
        {pageItems.map((record, idx) => (
          <div
            key={record.id}
            className={`
              grid grid-cols-12 gap-2 px-4 py-3 items-center border-t
              transition-colors
              ${darkMode
                ? 'border-well-800 hover:bg-well-800/50'
                : 'border-stone-100 hover:bg-stone-50'
              }
            `}
          >
            {/* Status icon */}
            <div className="col-span-1">
              {record.isInside ? (
                <RiCheckboxCircleLine className="text-emerald-400 text-lg" title="Inside radius" />
              ) : (
                <RiCloseCircleLine className="text-red-400 text-lg" title="Outside radius" />
              )}
            </div>

            {/* Well */}
            <div className="col-span-3 min-w-0">
              <div className="flex items-center gap-1.5">
                <RiMapPin2Line className={`flex-shrink-0 text-xs ${darkMode ? 'text-petroleum-400' : 'text-petroleum-500'}`} />
                <p className={`font-body text-sm truncate ${darkMode ? 'text-well-200' : 'text-well-800'}`}>
                  {record.well.name}
                </p>
              </div>
              <p className={`font-mono text-xs truncate pl-4 ${darkMode ? 'text-well-600' : 'text-stone-400'}`}>
                {record.well.lat.toFixed(4)}, {record.well.lon.toFixed(4)}
              </p>
            </div>

            {/* Home */}
            <div className="col-span-3 min-w-0">
              <div className="flex items-center gap-1.5">
                <RiHomeLine className={`flex-shrink-0 text-xs ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                <p className={`font-body text-sm truncate ${darkMode ? 'text-well-200' : 'text-well-800'}`}>
                  {record.home.name}
                </p>
              </div>
              <p className={`font-mono text-xs truncate pl-4 ${darkMode ? 'text-well-600' : 'text-stone-400'}`}>
                {record.home.lat.toFixed(4)}, {record.home.lon.toFixed(4)}
              </p>
            </div>

            {/* Distance */}
            <div className="col-span-2">
              <p className={`font-mono text-sm font-semibold ${record.isInside ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatDistance(record.distance)}
              </p>
              <p className={`text-xs font-body ${darkMode ? 'text-well-600' : 'text-stone-400'}`}>
                {record.isInside ? '✓ Inside' : '✗ Outside'}
              </p>
            </div>

            {/* Date */}
            <div className="col-span-2">
              <p className={`font-body text-xs ${darkMode ? 'text-well-400' : 'text-stone-500'}`}>
                {new Date(record.timestamp).toLocaleDateString()}
              </p>
              <p className={`font-mono text-xs ${darkMode ? 'text-well-600' : 'text-stone-400'}`}>
                {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Delete */}
            <div className="col-span-1 flex justify-end">
              <button
                onClick={() => onDelete(record.id)}
                className={`
                  p-1.5 rounded-lg transition-all
                  ${darkMode
                    ? 'text-well-600 hover:text-red-400 hover:bg-red-500/10'
                    : 'text-stone-300 hover:text-red-500 hover:bg-red-50'
                  }
                `}
              >
                <RiDeleteBinLine className="text-sm" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Card View - visible on mobile */}
      <div className="md:hidden space-y-3">
        {pageItems.map((record) => (
          <div
            key={record.id}
            className={`
              rounded-xl border p-4 space-y-3 transition-colors
              ${darkMode
                ? 'bg-well-900 border-well-800'
                : 'bg-white border-stone-200'
              }
            `}
          >
            {/* Header with status and delete */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {record.isInside ? (
                  <RiCheckboxCircleLine className="text-emerald-400 text-lg" />
                ) : (
                  <RiCloseCircleLine className="text-red-400 text-lg" />
                )}
                <span className={`text-xs font-semibold ${record.isInside ? 'text-emerald-400' : 'text-red-400'}`}>
                  {record.isInside ? 'Inside Radius' : 'Outside Radius'}
                </span>
              </div>
              <button
                onClick={() => onDelete(record.id)}
                className={`
                  p-1.5 rounded-lg transition-all
                  ${darkMode
                    ? 'text-well-600 hover:text-red-400 hover:bg-red-500/10'
                    : 'text-stone-300 hover:text-red-500 hover:bg-red-50'
                  }
                `}
              >
                <RiDeleteBinLine className="text-sm" />
              </button>
            </div>

            {/* Well info */}
            <div className="space-y-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <RiMapPin2Line className={`text-xs ${darkMode ? 'text-petroleum-400' : 'text-petroleum-500'}`} />
                  <p className={`text-xs font-semibold ${darkMode ? 'text-well-400' : 'text-stone-500'}`}>Well</p>
                </div>
                <p className={`font-body text-sm font-medium ${darkMode ? 'text-well-200' : 'text-well-800'}`}>
                  {record.well.name}
                </p>
                <p className={`font-mono text-xs mt-0.5 ${darkMode ? 'text-well-600' : 'text-stone-400'}`}>
                  {record.well.lat.toFixed(4)}, {record.well.lon.toFixed(4)}
                </p>
              </div>

              {/* Home info */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <RiHomeLine className={`text-xs ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                  <p className={`text-xs font-semibold ${darkMode ? 'text-well-400' : 'text-stone-500'}`}>Home</p>
                </div>
                <p className={`font-body text-sm font-medium ${darkMode ? 'text-well-200' : 'text-well-800'}`}>
                  {record.home.name}
                </p>
                <p className={`font-mono text-xs mt-0.5 ${darkMode ? 'text-well-600' : 'text-stone-400'}`}>
                  {record.home.lat.toFixed(4)}, {record.home.lon.toFixed(4)}
                </p>
              </div>

              {/* Distance and Date */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-well-400' : 'text-stone-500'}`}>Distance</p>
                  <p className={`font-mono text-sm font-semibold ${record.isInside ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatDistance(record.distance)}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-well-400' : 'text-stone-500'}`}>Date</p>
                  <p className={`font-body text-sm ${darkMode ? 'text-well-200' : 'text-well-800'}`}>
                    {new Date(record.timestamp).toLocaleDateString()}
                  </p>
                  <p className={`font-mono text-xs ${darkMode ? 'text-well-600' : 'text-stone-400'}`}>
                    {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-body transition-all
              ${darkMode
                ? 'text-well-400 hover:bg-well-800 disabled:opacity-30'
                : 'text-stone-500 hover:bg-stone-100 disabled:opacity-30'
              }
            `}
          >
            ← Prev
          </button>
          <span className={`font-mono text-sm ${darkMode ? 'text-well-400' : 'text-stone-500'}`}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-body transition-all
              ${darkMode
                ? 'text-well-400 hover:bg-well-800 disabled:opacity-30'
                : 'text-stone-500 hover:bg-stone-100 disabled:opacity-30'
              }
            `}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}