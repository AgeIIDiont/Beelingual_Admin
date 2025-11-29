// components/SearchFilter.jsx
import React from 'react';

const SearchFilter = ({ 
  searchValue, 
  onSearchChange, 
  filterValue, 
  onFilterChange, 
  filterOptions,
  searchPlaceholder = "Tìm kiếm..." 
}) => {
  return (
    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
      <div className="row g-3">
        <div className="col-12 col-md-8">
          <div className="position-relative">
            <i className="fas fa-search position-absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9e9e9e' }}></i>
            <input
              type="text"
              className="form-control search-input rounded-3 ps-5 py-2"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <div className="col-12 col-md-4">
          <select
            className="form-select filter-select rounded-3 py-2"
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
