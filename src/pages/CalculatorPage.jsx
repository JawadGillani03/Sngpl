/**
 * CalculatorPage
 * Main analysis page: coordinate input forms + map + result card
 * Fully responsive across mobile, tablet, and desktop
 *
 * FIX: Calculate button moved outside the left panel so it is always
 * visible on mobile regardless of which tab (form/map) is active.
 * On desktop (lg+) it stays inside the left sidebar as before.
 */

import React, { useState } from 'react';
import CoordinateForm from '../components/Forms/CoordinateForm';
import ProximityMap from '../components/Map/ProximityMap';
import ResultCard from '../components/UI/ResultCard';
import {
  RiFlashlightLine,
  RiTestTubeLine,
  RiMapPin2Line,
  RiEdit2Line,
} from 'react-icons/ri';

export default function CalculatorPage({
  wellForm,
  homeForm,
  updateWellForm,
  updateHomeForm,
  errors,
  result,
  calculate,
  loadExample,
  saveWell,
  darkMode,
}) {
  const [mobileTab, setMobileTab] = useState('form');

  const CalculateButton = () => (
    <button
      onClick={calculate}
      className={`
        w-full flex items-center justify-center gap-2 sm:gap-2.5
        px-4 py-3 sm:py-3.5 rounded-xl
        font-display font-bold text-sm text-white
        bg-petroleum-600 hover:bg-petroleum-500
        shadow-petroleum transition-all duration-200
        active:scale-[0.98] focus:outline-none
        focus:ring-2 focus:ring-petroleum-400 focus:ring-offset-2
      `}
    >
      <RiFlashlightLine className="text-base sm:text-lg" />
      Calculate Proximity
    </button>
  );

  return (
    <div className="flex  flex-col h-full min-h-0 w-full">

      {/* ── Mobile tab switcher (< lg only) ── */}
      <div
        className={`
          flex lg:hidden sticky top-0 z-10 rounded-xl mb-3 p-1
          ${darkMode
            ? 'bg-well-900/90 backdrop-blur-sm'
            : 'bg-stone-100/90 backdrop-blur-sm'
          }
        `}
      >
        <button
          onClick={() => setMobileTab('form')}
          className={`
            flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
            text-xs font-medium font-body transition-all duration-200
            ${mobileTab === 'form'
              ? 'bg-petroleum-600 text-white shadow-sm'
              : darkMode
                ? 'text-well-400 hover:text-well-200'
                : 'text-stone-500 hover:text-stone-700'
            }
          `}
        >
          <RiEdit2Line className="text-sm" />
          <span>Inputs</span>
        </button>

        <button
          onClick={() => setMobileTab('map')}
          className={`
            flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
            text-xs font-medium font-body transition-all duration-200
            ${mobileTab === 'map'
              ? 'bg-petroleum-600 text-white shadow-sm'
              : darkMode
                ? 'text-well-400 hover:text-well-200'
                : 'text-stone-500 hover:text-stone-700'
            }
          `}
        >
          <RiMapPin2Line className="text-sm" />
          <span>Map{result ? ' · Result' : ''}</span>
        </button>
      </div>

      {/* ── Calculate button — MOBILE ONLY, always visible ──────────────────
          Rendered outside both panels so it shows on BOTH the form tab
          and the map tab. Hidden on lg+ where it lives inside the sidebar. */}
      <div className="lg:hidden mb-3">
        <CalculateButton />
      </div>

      {/* ── Main content area ── */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 flex-1 min-h-0">

        {/* ── LEFT PANEL: Forms ── */}
        <div
          className={`
            w-full lg:w-[420px] xl:w-[460px] 2xl:w-[500px]
            lg:flex-shrink-0 lg:max-h-full flex flex-col gap-3 sm:gap-4
            lg:overflow-y-auto lg:pr-1
            ${mobileTab === 'map' ? 'hidden lg:flex' : 'flex'}
          `}
        >
          {/* Load example */}
          <button
            onClick={loadExample}
            className={`
              flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg
              text-xs sm:text-sm font-body font-medium border-2 border-dashed transition-all
              ${darkMode
                ? 'border-well-700 text-well-400 hover:border-petroleum-500/50 hover:text-petroleum-400 hover:bg-petroleum-500/5'
                : 'border-stone-200 text-stone-400 hover:border-petroleum-300 hover:text-petroleum-500 hover:bg-petroleum-50'
              }
            `}
          >
            <RiTestTubeLine className="text-sm sm:text-base" />
            <span>Load Example Data</span>
          </button>

          {/* Well + Home forms */}
          <div className="flex pb-20 flex-col gap-3 sm:gap-4 md:grid md:grid-cols-2 lg:flex lg:flex-col">
            <CoordinateForm
              type="well"
              form={wellForm}
              onUpdate={updateWellForm}
              errors={errors}
              darkMode={darkMode}
              onSaveWell={saveWell}
            />
            <CoordinateForm
              type="home"
              form={homeForm}
              onUpdate={updateHomeForm}
              errors={errors}
              darkMode={darkMode}
            />
          </div>

          {/* Calculate button — desktop sidebar only */}
          <div className="hidden lg:block">
            <CalculateButton />
          </div>

          {/* Result card — desktop sidebar only */}
          {result && (
            <div className="hidden lg:block">
              <ResultCard result={result} darkMode={darkMode} />
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: Map ── */}
        <div
          className={`
            flex-1 min-w-0 flex flex-col min-h-0
            ${mobileTab === 'form' ? 'hidden lg:flex' : 'flex'}
          `}
        >
          <div className="flex-1 min-h-[200px] sm:min-h-[300px] md:min-h-[380px] lg:min-h-0">
            <ProximityMap result={result} darkMode={darkMode} />
          </div>

          {!result && (
            <p
              className={`
                text-center text-xs font-body mt-2 sm:mt-3 px-2
                ${darkMode ? 'text-well-600' : 'text-stone-400'}
              `}
            >
              Enter coordinates and calculate to see markers and 5 km radius on the map
            </p>
          )}

          {/* Result card — mobile & tablet (below map) */}
          {result && (
            <div className="lg:hidden mt-3 sm:mt-4">
              <ResultCard result={result} darkMode={darkMode} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}