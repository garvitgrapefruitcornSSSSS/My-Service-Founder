 // =====================================================
// FILE: src/components/Filters.jsx (NO CHANGES)
// Same as before
// =====================================================

import React from 'react';

const Filters = ({ filterRating, filterOpen, onRatingChange, onOpenChange }) => {
  return (
    <div className="filters-container">
      <div className="filters-header">
        <span className="filter-icon">🔍</span>
        <span className="filter-label">Filters:</span>
      </div>

      <div className="filters-controls">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filterRating}
            onChange={(e) => onRatingChange(e.target.checked)}
          />
          <span>Rating ≥ 4.0</span>
        </label>

        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filterOpen}
            onChange={(e) => onOpenChange(e.target.checked)}
          />
          <span>Open Now</span>
        </label>
      </div>
    </div>
  );
};

export default Filters;

