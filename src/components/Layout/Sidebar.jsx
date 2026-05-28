/**
 * Sidebar Component
 * Navigation and branding for the GeoWell application
 * Fully responsive — mobile drawer + bottom nav, desktop sidebar
 */

import React from 'react';
import {
  RiMapPin2Fill,
  RiHistoryLine,
  RiDatabase2Line,
  RiDropFill,
  RiCloseLine,
} from 'react-icons/ri';

const NAV_ITEMS = [
  { id: 'calculator', label: 'Calculator', icon: RiMapPin2Fill },
  { id: 'history', label: 'History', icon: RiHistoryLine },
  { id: 'wells', label: 'Saved Wells', icon: RiDatabase2Line },
];

export default function Sidebar({ activeTab, setActiveTab, darkMode, onClose }) {
  return (
    <>
      {/* ──────────────────────────────────────────
          MOBILE BOTTOM TAB BAR
          Always visible at the bottom on < lg.
          Complements the drawer — lets users switch
          tabs without opening the drawer.
      ────────────────────────────────────────── */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50 lg:hidden
          border-t backdrop-blur-lg safe-area-inset-bottom
          ${darkMode
            ? 'bg-well-950/95 border-well-800'
            : 'bg-white/95 border-stone-200'
          }
        `}
      >
        <nav className="flex items-center justify-around px-2 py-1.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  relative flex flex-col items-center gap-0.5
                  px-3 py-1.5 rounded-xl min-w-[60px]
                  font-body text-[10px] xs:text-xs font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'text-petroleum-400'
                    : darkMode
                      ? 'text-well-500 hover:text-well-200'
                      : 'text-stone-400 hover:text-stone-700'
                  }
                `}
              >
                {/* Active indicator dot above icon */}
                {isActive && (
                  <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-petroleum-400" />
                )}
                <Icon className="text-xl flex-shrink-0" />
                <span className="truncate max-w-[56px]">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ──────────────────────────────────────────
          DESKTOP + MOBILE DRAWER SIDEBAR
          Desktop: always visible, static in flow.
          Mobile:  rendered inside the sliding
                   wrapper in App.jsx (fixed drawer).
                   onClose button visible on mobile.
      ────────────────────────────────────────── */}
      <aside
        className={`
          flex flex-col w-64 h-full border-r
          ${darkMode
            ? 'bg-well-950 border-well-800'
            : 'bg-white border-stone-200'
          }
        `}
      >
        {/* Brand + mobile close button */}
        <div
          className={`
            flex items-center gap-3 px-5 py-5 border-b flex-shrink-0
            ${darkMode ? 'border-well-800' : 'border-stone-200'}
          `}
        >
          {/* Logo */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-petroleum-600 flex items-center justify-center shadow-petroleum">
              <RiDropFill className="text-white text-lg sm:text-xl" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-well-950 animate-pulse-slow" />
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h1
              className={`font-display font-bold text-base leading-tight truncate ${darkMode ? 'text-white' : 'text-well-900'}`}
            >
              GeoWell
            </h1>
            <p className={`font-body text-xs truncate ${darkMode ? 'text-well-400' : 'text-stone-500'}`}>
              Proximity Analyzer
            </p>
          </div>

          {/* Close button — only shown when rendered as a mobile drawer */}
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close menu"
              className={`
                lg:hidden p-1.5 rounded-lg flex-shrink-0 transition-all
                ${darkMode
                  ? 'text-well-400 hover:bg-well-800 hover:text-white'
                  : 'text-stone-400 hover:bg-stone-100 hover:text-stone-900'
                }
              `}
            >
              <RiCloseLine className="text-lg" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p
            className={`
              px-3 mb-3 text-[10px] sm:text-xs font-display font-semibold
              uppercase tracking-widest
              ${darkMode ? 'text-well-500' : 'text-stone-400'}
            `}
          >
            Tools
          </p>

          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  font-body text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-petroleum-600 text-white shadow-petroleum'
                    : darkMode
                      ? 'text-well-300 hover:bg-well-800 hover:text-white'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }
                `}
              >
                <Icon className="text-lg flex-shrink-0" />
                <span className="truncate">{label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Version info */}
        <div
          className={`
            px-5 py-4 border-t flex-shrink-0
            ${darkMode ? 'border-well-800' : 'border-stone-200'}
          `}
        >
          <p className={`text-xs font-mono ${darkMode ? 'text-well-600' : 'text-stone-400'}`}>
            v1.0.0 · GeoWell Pro
          </p>
          <p className={`text-xs font-body mt-0.5 ${darkMode ? 'text-well-600' : 'text-stone-400'}`}>
            Oil &amp; Gas · Water Mgmt · Survey
          </p>
        </div>
      </aside>
    </>
  );
}