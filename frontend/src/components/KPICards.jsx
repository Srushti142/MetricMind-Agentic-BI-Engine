import { useEffect, useState } from "react";

function KPICards({ filters }) {
  const [data, setData] = useState({
    totalSales: 0,
    totalOrders: 0,
    customers: 0,
    revenue: 0,
    deliveredOrders: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          state: filters?.state || "All States",
          payment: filters?.payment || "All Payment Types",
          period: filters?.period || "Last 6 Months",
        });

        const response = await fetch(
          `http://localhost:5000/api/kpis?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch KPI data");
        }

        const result = await response.json();

        console.log("KPI data received:", result);

        setData(result);
      } catch (error) {
        console.error("KPI API Error:", error);
        setError("Unable to load KPI data");
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, [filters]);

  if (loading) {
    return (
      <div className="kpi-container">
        <div className="card">
          <h3>Total Sales</h3>
          <p>Loading...</p>
        </div>

        <div className="card">
          <h3>Total Orders</h3>
          <p>Loading...</p>
        </div>

        <div className="card">
          <h3>Customers</h3>
          <p>Loading...</p>
        </div>

        <div className="card">
          <h3>Revenue</h3>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kpi-container">
        <div className="card">
          <h3>KPI Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kpi-container">
      <div className="card">
        <h3>Total Sales</h3>
        <p>
          ₹{Number(data.totalSales).toLocaleString("en-IN")}
        </p>
      </div>

      <div className="card">
        <h3>Total Orders</h3>
        <p>
          {Number(data.totalOrders).toLocaleString("en-IN")}
        </p>
      </div>

      <div className="card">
        <h3>Customers</h3>
        <p>
          {Number(data.customers).toLocaleString("en-IN")}
        </p>
      </div>

      <div className="card">
        <h3>Revenue</h3>
        <p>
          ₹{(Number(data.revenue) / 100000).toFixed(1)} Lakhs
        </p>
      </div>
    </div>
  );
}

export default KPICards;
