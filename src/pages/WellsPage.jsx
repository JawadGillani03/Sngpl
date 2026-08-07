/**
 * WellsPage
 * Displays saved wells management interface
 */

import React from 'react';
import WellsManager from '../components/UI/WellsManager';
import { predefinedWells } from '../data/wells';

export default function WellsPage({
  savedWells,
  onDelete,
  onLoad,
  darkMode,
}) {
  // Filter out the unwanted wells from savedWells
  const filteredSavedWells = savedWells.filter(well => {
    // Skip wells with these specific coordinates
    const isAlpha7 = well.lat === 33.573100 && well.lon === 73.061700;
    const isBetaWell = well.lat === 33.600700 && well.lon === 73.047900;
    return !isAlpha7 && !isBetaWell;
  });

  return (
    <div className="overflow-y-auto h-full lg:pr-1 px-0 sm:px-1 lg:px-0">
      <WellsManager
        savedWells={filteredSavedWells}
        predefinedWells={predefinedWells}
        onDelete={onDelete}
        onLoad={onLoad}
        darkMode={darkMode}
      />
    </div>
  );
}