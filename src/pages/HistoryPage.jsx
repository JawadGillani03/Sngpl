/**
 * HistoryPage
 * Displays full calculation history table
 */

import React from 'react';
import HistoryTable from '../components/History/HistoryTable';

export default function HistoryPage({
  history,
  onDelete,
  onClear,
  darkMode,
}) {
  return (
    <div className="overflow-y-auto h-full lg:pr-1 px-0 sm:px-1 lg:px-0">
      <HistoryTable
        history={history}
        onDelete={onDelete}
        onClear={onClear}
        darkMode={darkMode}
      />
    </div>
  );
}