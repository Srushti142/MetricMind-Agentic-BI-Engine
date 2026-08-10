import { useEffect, useState } from "react";

function SalesOverview({ filters }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({
    state: filters.state,
    payment: filters.payment,
  });

  fetch(`http://localhost:5000/api/sales?${params}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Sales API failed");
        }
        return response.json();
      })
      .then((data) => {
        console.log("SALES DATA:", data);
        setSales(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("SALES ERROR:", error);
        setLoading(false);
      });
  }, [filters]);

  const maxSales =
    sales.length > 0
      ? Math.max(...sales.map((item) => Number(item.sales)))
      : 1;

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h2>Sales Overview</h2>
          <p>Monthly sales performance</p>
        </div>

        <select>
          <option>Last 12 Months</option>
          <option>Last 6 Months</option>
        </select>
      </div>

      <div className="sales-chart">
        {loading ? (
          <p>Loading sales...</p>
        ) : sales.length === 0 ? (
          <p>No sales data available</p>
        ) : (
          <div className="bar-area">
            {sales.map((item, index) => {
              const height =
                (Number(item.sales) / maxSales) * 100;

              return (
                <div className="bar-column" key={index}>
                  <div className="bar-value">
                    ₹{(Number(item.sales) / 100000).toFixed(1)}L
                  </div>

                  <div className="bar-wrapper">
                    <div
                      className="sales-bar"
                      style={{ height: `${height}%` }}
                      title={`${item.month} ${item.year}: ₹${Number(
                        item.sales
                      ).toLocaleString("en-IN")}`}
                    ></div>
                  </div>

                  <span className="bar-label">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SalesOverview;