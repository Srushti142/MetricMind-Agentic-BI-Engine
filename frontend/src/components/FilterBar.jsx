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
    <div className="filter-card">

      <div className="filter-title">
        <div>
          <h2>Dashboard Filters</h2>
          <p>Filter your business insights</p>
        </div>
      </div>

      <div className="filter-controls">

        {/* PERIOD */}
        <div className="filter-group">
          <label>Period</label>

          <select
            name="period"
            value={filters.period}
            onChange={handleChange}
          >
            <option>Last 6 Months</option>
            <option>Last 12 Months</option>
            <option>This Year</option>
            <option>Last Year</option>
          </select>
        </div>

        {/* STATE */}
        <div className="filter-group">
          <label>State</label>

          <select
            name="state"
            value={filters.state}
            onChange={handleChange}
          >
            <option>All States</option>

            <option>AC</option>
            <option>AL</option>
            <option>AP</option>
            <option>AM</option>
            <option>BA</option>
            <option>CE</option>
            <option>DF</option>
            <option>ES</option>
            <option>GO</option>
            <option>MA</option>
            <option>MT</option>
            <option>MS</option>
            <option>MG</option>
            <option>PA</option>
            <option>PB</option>
            <option>PR</option>
            <option>PE</option>
            <option>PI</option>
            <option>RJ</option>
            <option>RN</option>
            <option>RS</option>
            <option>RO</option>
            <option>RR</option>
            <option>SC</option>
            <option>SP</option>
            <option>SE</option>
            <option>TO</option>
          </select>
        </div>

        {/* PAYMENT TYPE */}
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

        {/* BUTTONS */}
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
