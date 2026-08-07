import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import KPICards from "../components/KPICards";
import FilterBar from "../components/FilterBar";
import SalesOverview from "../components/SalesOverview";
import OrderStatus from "../components/OrderStatus";

function Dashboard() {
  return (
    <div className="dashboard">

      <Sidebar />

      <div className="main">

        <Navbar />

        <div className="dashboard-content">

          {/* KPI CARDS */}
          <KPICards />

          {/* FILTERS */}
          <FilterBar />

          {/* ANALYTICS */}
          <div className="analytics-grid">

            <SalesOverview />

            <OrderStatus />

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
