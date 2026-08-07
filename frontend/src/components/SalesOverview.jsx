import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function SalesOverview() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/sales")
      .then((response) => response.json())
      .then((data) => {
        setSales(data);
      })
      .catch((error) => {
        console.error("Error fetching sales data:", error);
      });
  }, []);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h2>Sales Overview</h2>
          <p>Monthly sales performance</p>
        </div>

        <select>
          <option>Last 6 Months</option>
          <option>Last 12 Months</option>
        </select>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={sales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />

            <Bar
              dataKey="sales"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SalesOverview;
