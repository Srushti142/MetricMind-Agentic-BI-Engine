import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import KPICards from "../components/KPICards";
import FilterBar from "../components/FilterBar";
import SalesOverview from "../components/SalesOverview";
import OrderStatus from "../components/OrderStatus";
import PaymentAnalysis from "../components/PaymentAnalysis";
import ReviewAnalysis from "../components/ReviewAnalysis";

function Dashboard() {
  const [filters, setFilters] = useState({
    period: "Last 6 Months",
    state: "All States",
    payment: "All Payment Types",
  });

  const handleFilters = (newFilters) => {
    console.log("Dashboard filters:", newFilters);
    setFilters(newFilters);
  };

  return (
    <>
      <Sidebar />

      <div className="main">
        <Navbar />

        <div className="dashboard-content">

          <KPICards filters={filters} />

          <FilterBar onApply={handleFilters} />

          <div className="analytics-grid">

            <SalesOverview filters={filters} />

            <OrderStatus filters={filters} />

            <PaymentAnalysis filters={filters} />

            <ReviewAnalysis filters={filters} />

          </div>

        </div>
      </div>
    </>
  );
}

export default Dashboard;