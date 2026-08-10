import { useEffect, useState } from "react";

function SalesOverview({ filters }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          state: filters?.state || "All States",
          payment: filters?.payment || "All Payment Types",
          period: filters?.period || "Last 6 Months",
        });

        const response = await fetch(
          `http://localhost:5000/api/sales?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Sales API failed");
        }

        const data = await response.json();

        console.log("SALES DATA:", data);

        setSales(data);
      } catch (error) {
        console.error("SALES ERROR:", error);
        setError("Unable to load sales data");
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [filters]);

  const maxSales =
    sales.length > 0
      ? Math.max(...sales.map((item) => Number(item.sales)))
      : 1;

  return (
    <div className="sales-overview">
      <div className="sales-header">
        <div>
          <h2>Sales Overview</h2>
          <p>Monthly sales performance</p>
        </div>

        <select defaultValue="12">
          <option value="12">Last 12 Months</option>
          <option value="6">Last 6 Months</option>
        </select>
      </div>

      <div className="sales-chart">
        {loading ? (
          <p>Loading sales...</p>
        ) : error ? (
          <p>{error}</p>
        ) : sales.length === 0 ? (
          <p>No sales data available</p>
        ) : (
          <div className="bar-area">
            {sales.map((item, index) => {
              const height =
                (Number(item.sales) / maxSales) * 100;

              return (
                <div className="bar-column" key={`${item.year}-${item.month}-${index}`}>
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
                    />
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
