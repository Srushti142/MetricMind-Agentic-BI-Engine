import { useEffect, useState } from "react";

function KPICards() {
  const [data, setData] = useState({
    totalSales: 0,
    totalOrders: 0,
    customers: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/kpis")
      .then((response) => response.json())
      .then((result) => {
        setData(result);
      })
      .catch((error) => {
        console.error("Error fetching KPI data:", error);
      });
  }, []);

  return (
    <div className="cards">

      <div className="card">
        <h3>Total Sales</h3>
        <p>₹{data.totalSales.toLocaleString("en-IN")}</p>
      </div>

      <div className="card">
        <h3>Total Orders</h3>
        <p>{data.totalOrders.toLocaleString("en-IN")}</p>
      </div>

      <div className="card">
        <h3>Customers</h3>
        <p>{data.customers.toLocaleString("en-IN")}</p>
      </div>

      <div className="card">
        <h3>Revenue</h3>
        <p>₹{(data.revenue / 100000).toFixed(1)} Lakhs</p>
      </div>

    </div>
  );
}

export default KPICards;
