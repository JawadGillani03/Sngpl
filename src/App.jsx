/**
 * App Component
 * Root application component with layout, routing between pages,
 * and global theme management.
 * Fully responsive across all screen sizes.
 * Gated behind a full-screen login screen.
 */

import React, { useEffect, useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import StatsBar from './components/UI/StatsBar';
import CalculatorPage from './pages/CalculatorPage';
import HistoryPage from './pages/HistoryPage';
import WellsPage from './pages/WellsPage';
import LoginScreen from './components/Auth/LoginScreen';
import { useGeoWell } from './hooks/useGeoWell';

export default function App() {
  // ── Auth gate ─────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInUser,    setLoggedInUser]    = useState(null); // ← stores the user's name

  const {
    darkMode,
    toggleTheme,
    wellForm,
    homeForm,
    updateWellForm,
    updateHomeForm,
    errors,
    result,
    calculate,
    resetForm,
    loadExample,
    saveWell,
    savedWells,
    deleteWell,
    loadWellIntoForm,
    history,
    deleteHistoryRecord,
    clearHistory,
    handleExportCSV,
    activeTab,
    setActiveTab,
  } = useGeoWell();

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0c0a09';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f5f5f4';
    }
  }, [darkMode]);

  // Listen for Electron menu events
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onMenuNew(() => resetForm());
      window.electronAPI.onMenuExport(() => handleExportCSV());
      return () => {
        window.electronAPI.removeAllListeners('menu-new');
        window.electronAPI.removeAllListeners('menu-export');
      };
    }
  }, [resetForm, handleExportCSV]);

  // ── Show login screen until authenticated ─────────────────────
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLogin={(name) => {
          setLoggedInUser(name);       // ← store the name
          setIsAuthenticated(true);
        }}
        darkMode={darkMode}
      />
    );
  }

  // ── Authenticated app shell ───────────────────────────────────
  return (
    <div className={`flex h-screen overflow-hidden relative ${darkMode ? 'dark bg-well-950 text-white' : 'bg-stone-100 text-well-900'}`}>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <Header
          activeTab={activeTab}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          onExport={handleExportCSV}
          onReset={resetForm}
          historyCount={history.length}
          loggedInUser={loggedInUser}  // ← pass the name to Header
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-5 pt-5 lg:pt-3 pb-20 lg:pb-5 flex flex-col">

          <StatsBar
            history={history}
            savedWells={savedWells}
            darkMode={darkMode}
          />

          <div className="flex-1 min-h-0">
            {activeTab === 'calculator' && (
              <CalculatorPage
                wellForm={wellForm}
                homeForm={homeForm}
                updateWellForm={updateWellForm}
                updateHomeForm={updateHomeForm}
                errors={errors}
                result={result}
                calculate={calculate}
                loadExample={loadExample}
                saveWell={saveWell}
                darkMode={darkMode}
              />
            )}

            {activeTab === 'history' && (
              <HistoryPage
                history={history}
                onDelete={deleteHistoryRecord}
                onClear={clearHistory}
                darkMode={darkMode}
              />
            )}

            {activeTab === 'wells' && (
              <WellsPage
                savedWells={savedWells}
                onDelete={deleteWell}
                onLoad={(well) => {
                  loadWellIntoForm(well);
                  setActiveTab('calculator');
                }}
                darkMode={darkMode}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}