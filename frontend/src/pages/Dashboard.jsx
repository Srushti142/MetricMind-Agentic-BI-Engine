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
  const [activePage, setActivePage] = useState("dashboard");

  const [filters, setFilters] = useState({
    period: "Last 6 Months",
    state: "All States",
    payment: "All Payment Types",
  });

  const handleFilters = (newFilters) => {
    console.log("Dashboard filters:", newFilters);
    setFilters(newFilters);
  };

  const renderContent = () => {
    switch (activePage) {
      case "analytics":
        return (
          <div className="page-content">
            <h1>📊 Analytics</h1>
            <p>Detailed business analytics and performance insights.</p>

            <div className="analytics-grid">
              <SalesOverview filters={filters} />
              <PaymentAnalysis filters={filters} />
              <ReviewAnalysis filters={filters} />
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="page-content">
            <h1>📦 Orders</h1>
            <p>Monitor order performance and order status.</p>

            <div className="analytics-grid">
              <OrderStatus filters={filters} />
              <SalesOverview filters={filters} />
            </div>
          </div>
        );

      case "customers":
        return (
          <div className="page-content">
            <h1>👥 Customers</h1>
            <p>Understand your customer base and customer behavior.</p>

            <div className="info-card">
              <h2>Customer Overview</h2>
              <p>
                Customer analysis will be displayed here using your real
                business data.
              </p>
            </div>
          </div>
        );

      case "ai-insights":
        return (
          <div className="page-content">
            <h1>🤖 AI Insights</h1>
            <p>Business insights generated from your dashboard data.</p>

            <div className="info-card">
              <h2>📈 Revenue Insight</h2>
              <p>
                MetricMind can analyze revenue, orders, payments and customer
                reviews to identify important business trends.
              </p>
            </div>

            <div className="info-card">
              <h2>⚠️ Business Alert</h2>
              <p>
                Your dashboard data can be used to identify unusual order
                patterns, cancellations and performance changes.
              </p>
            </div>

            <div className="info-card">
              <h2>⭐ Customer Insight</h2>
              <p>
                Customer review scores can be analyzed to understand customer
                satisfaction.
              </p>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="page-content">
            <h1>⚙️ Settings</h1>
            <p>Dashboard configuration and preferences.</p>

            <div className="info-card">
              <h2>Dashboard Settings</h2>
              <p>Settings and configuration options will be added here.</p>
            </div>
          </div>
        );

      default:
        return (
          <>
            <KPICards filters={filters} />

            <FilterBar onApply={handleFilters} />

            <div className="analytics-grid">
              <SalesOverview filters={filters} />
              <OrderStatus filters={filters} />
              <PaymentAnalysis filters={filters} />
              <ReviewAnalysis filters={filters} />
            </div>
          </>
        );
    }
  };

  return (
  <div className="dashboard">
    <Sidebar
      activePage={activePage}
      setActivePage={setActivePage}
    />

    <div className="main">
      <Navbar />

      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  </div>
);
}

export default Dashboard;
