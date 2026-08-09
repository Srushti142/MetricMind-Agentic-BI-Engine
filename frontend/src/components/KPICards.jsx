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
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch KPI data");
        }
        return response.json();
      })
      .then((result) => {
        console.log("KPI data received:", result);
        setData(result);
      })
      .catch((error) => {
        console.error("KPI API Error:", error);
      });
  }, []);

  return (
    <div className="cards">

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
