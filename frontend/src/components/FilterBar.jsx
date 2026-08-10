import { useState } from "react";

function FilterBar({ onApply }) {
  const [filters, setFilters] = useState({
    period: "Last 6 Months",
    state: "All States",
    payment: "All Payment Types",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const resetFilters = () => {
    const defaultFilters = {
      period: "Last 6 Months",
      state: "All States",
      payment: "All Payment Types",
    };

    setFilters(defaultFilters);

    if (onApply) {
      onApply(defaultFilters);
    }
  };

  const applyFilters = () => {
    console.log("Applied filters:", filters);

    if (onApply) {
      onApply(filters);
    }
  };

  return (
    <div className="filter-bar">

      <div className="filter-title">
        <div>
          <h2>Dashboard Filters</h2>
          <p>Filter your business insights</p>
        </div>
      </div>

      <div className="filter-controls">

        <div className="filter-group">
          <label>Period</label>

          <select
            name="period"
            value={filters.period}
            onChange={handleChange}
          >
            <option>Last 6 Months</option>
            <option>This Year</option>
            <option>Last Year</option>
          </select>
        </div>

        <div className="filter-group">
          <label>State</label>

          <select
            name="state"
            value={filters.state}
            onChange={handleChange}
          >
            <option>All States</option>
            <option>SP</option>
            <option>RJ</option>
            <option>MG</option>
            <option>BA</option>
            <option>PR</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Payment Type</label>

          <select
            name="payment"
            value={filters.payment}
            onChange={handleChange}
          >
            <option>All Payment Types</option>
            <option>Credit Card</option>
            <option>Debit Card</option>
            <option>Voucher</option>
            <option>Boleto</option>
          </select>
        </div>

        <div className="filter-buttons">
          <button onClick={applyFilters}>
            Apply Filters
          </button>

          <button
            className="reset-button"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>

      </div>
    </div>
  );
}

export default FilterBar;
