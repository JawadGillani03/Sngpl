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
  // ── Auth gate — session-only, resets on page refresh ──────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  // Controls mobile sidebar drawer open/close
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Close sidebar when a tab is selected on mobile
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  // Close sidebar on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Show login screen until authenticated ─────────────────────
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLogin={() => setIsAuthenticated(true)}
        darkMode={darkMode}
      />
    );
  }

  // ── Authenticated app shell ───────────────────────────────────
  return (
    <div
      className={`
        flex h-screen overflow-hidden relative
        ${darkMode ? 'dark bg-well-950 text-white' : 'bg-stone-100 text-well-900'}
      `}
    >
      {/* ── Mobile sidebar backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ──
          Desktop: static in flow
          Mobile:  fixed drawer, slides in from the left */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          darkMode={darkMode}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header — passes sidebar toggle for mobile hamburger */}
        <Header
          activeTab={activeTab}
          darkMode={darkMode}
          toggleTheme={toggleTheme}
          onExport={handleExportCSV}
          onReset={resetForm}
          historyCount={history.length}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
        />

        {/* Page content */}
        {/* pb-20 on mobile gives clearance above the fixed bottom tab bar (≈80px) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-5 pb-20 lg:pb-5 flex flex-col">

          {/* Stats bar — all pages */}
          <StatsBar
            history={history}
            savedWells={savedWells}
            darkMode={darkMode}
          />

          {/* Page rendering */}
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
                  handleTabChange('calculator');
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