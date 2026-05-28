/**
 * WellsPage
 * Displays saved wells management interface
 */

import React from 'react';
import WellsManager from '../components/UI/WellsManager';

export default function WellsPage({
  savedWells,
  onDelete,
  onLoad,
  darkMode,
}) {
  return (
    <div className="overflow-y-auto h-full lg:pr-1 px-0 sm:px-1 lg:px-0">
      <WellsManager
        savedWells={savedWells}
        onDelete={onDelete}
        onLoad={onLoad}
        darkMode={darkMode}
      />
    </div>
  );
}