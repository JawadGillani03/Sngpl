/**
 * Header Component
 * Top bar with page title, actions, and theme toggle
 */

import React from 'react';
import {
  RiSunLine,
  RiMoonLine,
  RiDownload2Line,
  RiRefreshLine,
} from 'react-icons/ri';

const PAGE_TITLES = {
  calculator: { title: 'Proximity Calculator', subtitle: 'Analyze well-to-home distance using Haversine formula' },
  history: { title: 'Calculation History', subtitle: 'All previous proximity analyses' },
  wells: { title: 'Saved Wells', subtitle: 'Manage your well coordinates database' },
};

export default function Header({
  activeTab,
  darkMode,
  toggleTheme,
  onExport,
  onReset,
  historyCount,
}) {
  const page = PAGE_TITLES[activeTab] || PAGE_TITLES.calculator;

  return (
    <header className={`
      flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-4 sm:px-6 py-4 border-b flex-shrink-0
      ${darkMode ? 'bg-well-950 border-well-800' : 'bg-white border-stone-200'}
    `}>
      {/* Page title */}
      <div className="animate-fade-up">
        <h2 className={`pt-10 font-display font-bold text-lg sm:text-xl ${darkMode ? 'text-white' : 'text-well-900'}`}>
          {page.title}
        </h2>
        <p className={`font-body text-xs sm:text-sm mt-0.5 ${darkMode ? 'text-well-400' : 'text-stone-500'}`}>
          {page.subtitle}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end sm:justify-normal gap-2 flex-wrap">
        {/* History count badge */}
        {activeTab === 'history' && historyCount > 0 && (
          <span className={`
            px-2 py-1 sm:px-2.5 rounded-full font-mono text-xs font-medium whitespace-nowrap
            ${darkMode
              ? 'bg-petroleum-600/20 text-petroleum-400 border border-petroleum-500/30'
              : 'bg-petroleum-50 text-petroleum-700 border border-petroleum-200'
            }
          `}>
            {historyCount} {historyCount === 1 ? 'record' : 'records'}
          </span>
        )}

        {/* Export CSV */}
        {(activeTab === 'history' || activeTab === 'calculator') && (
          <button
            onClick={onExport}
            title="Export to CSV"
            className={`
              flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-body font-medium
              transition-all duration-200 border whitespace-nowrap
              ${darkMode
                ? 'border-well-700 text-well-300 hover:bg-well-800 hover:text-white'
                : 'border-stone-200 text-stone-600 hover:bg-stone-100'
              }
            `}
          >
            <RiDownload2Line className="text-sm sm:text-base" />
            <span className="hidden xs:inline">Export CSV</span>
          </button>
        )}

        {/* Reset */}
        {activeTab === 'calculator' && (
          <button
            onClick={onReset}
            title="Reset form"
            className={`
              flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-body font-medium
              transition-all duration-200 border whitespace-nowrap
              ${darkMode
                ? 'border-well-700 text-well-300 hover:bg-well-800 hover:text-white'
                : 'border-stone-200 text-stone-600 hover:bg-stone-100'
              }
            `}
          >
            <RiRefreshLine className="text-sm sm:text-base" />
            <span className="hidden xs:inline">Reset</span>
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          className={`
            w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center
            transition-all duration-200 border flex-shrink-0
            ${darkMode
              ? 'border-well-700 text-well-300 hover:bg-well-800 hover:text-white'
              : 'border-stone-200 text-stone-600 hover:bg-stone-100'
            }
          `}
        >
          {darkMode ? <RiSunLine className="text-sm sm:text-base" /> : <RiMoonLine className="text-sm sm:text-base" />}
        </button>
      </div>
    </header>
  );
}