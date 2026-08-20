import React from 'react';
import { Search, RotateCcw, FilterX } from 'lucide-react';

const DEPARTMENTS = [
  'IT Infrastructure',
  'Software & Apps',
  'Hardware & Devices',
  'Network & VPN',
  'Email & Office 365',
  'Accounts & Security',
  'HR & Payroll',
  'General IT Support'
];

const FilterBar = ({ filters, setFilters, onClear, onRefresh }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="admin-filter-card">
      <div className="admin-filter-row">
        
        {/* Search Input (~45-50% width on Desktop) */}
        <div className="admin-filter-search-wrap">
          <Search className="filter-search-icon" size={18} />
          <input
            type="text"
            name="search"
            className="admin-filter-input"
            placeholder="Search tickets by title, user, description..."
            value={filters.search}
            onChange={handleChange}
          />
        </div>

        {/* Status Dropdown */}
        <div className="admin-filter-select-wrap">
          <select
            name="status"
            className="admin-filter-select"
            value={filters.status}
            onChange={handleChange}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Priority Dropdown */}
        <div className="admin-filter-select-wrap">
          <select
            name="priority"
            className="admin-filter-select"
            value={filters.priority}
            onChange={handleChange}
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Department Dropdown */}
        <div className="admin-filter-select-wrap">
          <select
            name="department"
            className="admin-filter-select"
            value={filters.department}
            onChange={handleChange}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons Group (Aligned to the Right) */}
        <div className="admin-filter-actions-group">
          {onRefresh && (
            <button
              type="button"
              className="admin-filter-btn btn-outline"
              onClick={onRefresh}
              title="Refresh Tickets List"
            >
              <RotateCcw size={16} /> Refresh List
            </button>
          )}

          <button
            type="button"
            className="admin-filter-btn btn-outline"
            onClick={onClear}
            title="Reset All Filters"
          >
            <FilterX size={16} /> Clear Filters
          </button>
        </div>

      </div>
    </div>
  );
};

export default FilterBar;
