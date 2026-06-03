/**
 * Sidebar Component
 * Navigation and branding for the GeoWell application
 *
 * Mobile  : fixed bottom tab bar  +  slide-in drawer (self-contained)
 * Desktop : static left sidebar (lg+)
 *
 * FIX SUMMARY
 * ───────────
 * The original drawer was not self-contained — it relied on App.jsx to wrap
 * it in a sliding element. This version manages its own open/closed state so
 * it works correctly on mobile with no changes required in the parent.
 *
 * Key changes
 *  1. `drawerOpen` state added — toggled by the hamburger button in the
 *     mobile top-bar and closed by the overlay click or the X button.
 *  2. A fixed backdrop overlay dims the page while the drawer is open.
 *  3. The drawer uses `translate-x-0 / -translate-x-full` transitions so it
 *     slides in from the left on mobile.
 *  4. A minimal mobile top-bar (hamburger + brand) is injected on < lg so
 *     users always have a way to open the drawer.
 *  5. The bottom tab bar remains for instant one-tap tab switching.
 *  6. `onClose` prop is still accepted for backward compatibility but is no
 *     longer required.
 */

import React, { useState, useEffect } from 'react';
import {
  RiMapPin2Fill,
  RiHistoryLine,
  RiDatabase2Line,
  RiDropFill,
  RiCloseLine,
  RiMenuLine,
} from 'react-icons/ri';

const NAV_ITEMS = [
  { id: 'calculator', label: 'Calculator', icon: RiMapPin2Fill },
  { id: 'history',    label: 'History',    icon: RiHistoryLine  },
  { id: 'wells',      label: 'Saved Wells',icon: RiDatabase2Line},
];

export default function Sidebar({ activeTab, setActiveTab, darkMode, onClose }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [activeTab]);

  // Prevent body scroll while drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    onClose?.();
  };

  // ─── Shared sidebar inner content ────────────────────────────────────────
  const SidebarContent = ({ showClose = false }) => (
    <aside
      className={`
        flex flex-col w-64 h-full border-r
        ${darkMode ? 'bg-well-950 border-well-800' : 'bg-white border-stone-200'}
      `}
    >
      {/* Brand + close button */}
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
          <h1 className={`font-display font-bold text-base leading-tight truncate ${darkMode ? 'text-white' : 'text-well-900'}`}>
            GeoWell
          </h1>
          <p className={`font-body text-xs truncate ${darkMode ? 'text-well-400' : 'text-stone-500'}`}>
            Proximity Analyzer
          </p>
        </div>

        {/* Close button — only in mobile drawer */}
        {showClose && (
          <button
            onClick={closeDrawer}
            aria-label="Close menu"
            className={`
              p-1.5 rounded-lg flex-shrink-0 transition-all
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
        <p className={`px-3 mb-3 text-[10px] sm:text-xs font-display font-semibold uppercase tracking-widest ${darkMode ? 'text-well-500' : 'text-stone-400'}`}>
          Tools
        </p>

        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                closeDrawer();
              }}
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
      <div className={`px-5 py-4 border-t flex-shrink-0 ${darkMode ? 'border-well-800' : 'border-stone-200'}`}>
        <p className={`text-xs font-mono ${darkMode ? 'text-well-600' : 'text-stone-400'}`}>
           Syed M Jawad H 
        </p>
        <p className={`text-xs font-body mt-0.5 ${darkMode ? 'text-well-600' : 'text-stone-400'}`}>
          Oil &amp; Gas · Water Mgmt · Survey
        </p>
      </div>
    </aside>
  );

  return (
    <>
      {/* ══════════════════════════════════════════════
          MOBILE TOP BAR  (< lg only)
          Hamburger opens the drawer; brand name visible
      ══════════════════════════════════════════════ */}
      <header
        className={`
          lg:hidden fixed top-0 left-0 right-0 z-40
          flex items-center gap-3 px-4 h-14
          border-b backdrop-blur-lg
          ${darkMode
            ? 'bg-well-950/95 border-well-800'
            : 'bg-white/95 border-stone-200'
          }
        `}
      >
        {/* Hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className={`
            p-2 rounded-lg transition-all
            ${darkMode
              ? 'text-well-300 hover:bg-well-800'
              : 'text-stone-600 hover:bg-stone-100'
            }
          `}
        >
          <RiMenuLine className="text-xl" />
        </button>

        {/* Mini brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-petroleum-600 flex items-center justify-center">
            <RiDropFill className="text-white text-sm" />
          </div>
          <span className={`font-display font-bold text-sm ${darkMode ? 'text-white' : 'text-well-900'}`}>
            GeoWell
          </span>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          MOBILE BACKDROP OVERLAY
      ══════════════════════════════════════════════ */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════════════════════════════════
          MOBILE SLIDE-IN DRAWER  (< lg only)
          Slides in from the left; sits above the overlay
      ══════════════════════════════════════════════ */}
      <div
        className={`
          lg:hidden fixed top-0 left-0 z-[60] h-full
          transform transition-transform duration-300 ease-in-out
          ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent showClose={true} />
      </div>

      {/* ══════════════════════════════════════════════
          DESKTOP STATIC SIDEBAR  (lg+)
          Always visible, in normal document flow
      ══════════════════════════════════════════════ */}
      <div className="hidden lg:flex h-full">
        <SidebarContent showClose={false} />
      </div>

      {/* ══════════════════════════════════════════════
          MOBILE BOTTOM TAB BAR  (< lg only)
          Quick tab switching without opening the drawer
      ══════════════════════════════════════════════ */}
      <nav
        className={`
          lg:hidden fixed bottom-0 left-0 right-0 z-40
          flex items-center justify-around px-2 py-1.5
          border-t backdrop-blur-lg
          ${darkMode
            ? 'bg-well-950/95 border-well-800'
            : 'bg-white/95 border-stone-200'
          }
        `}
      >
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
              {isActive && (
                <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-petroleum-400" />
              )}
              <Icon className="text-xl flex-shrink-0" />
              <span className="truncate max-w-[56px]">{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}