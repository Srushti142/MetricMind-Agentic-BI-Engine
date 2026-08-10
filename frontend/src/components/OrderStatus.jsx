import { useEffect, useState } from "react";

function OrderStatus({ filters }) {
  const [orderStatus, setOrderStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          state: filters?.state || "All States",
          payment: filters?.payment || "All Payment Types",
          period: filters?.period || "Last 6 Months",
        });

        const response = await fetch(
          `http://localhost:5000/api/order-status?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Order status API failed");
        }

        const data = await response.json();

        console.log("ORDER STATUS DATA:", data);

        setOrderStatus(data);
      } catch (error) {
        console.error("ORDER STATUS ERROR:", error);
        setError("Unable to load order status");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();
  }, [filters]);

  const delivered =
    orderStatus.find((item) => item.name === "Delivered")?.value || 0;

  return (
    <div className="order-status">
      <div className="order-status-header">
        <div>
          <h2>Order Status</h2>
          <p>Current order distribution</p>
        </div>
      </div>

      <div className="order-status-content">
        {loading ? (
          <p>Loading order status...</p>
        ) : error ? (
          <p>{error}</p>
        ) : orderStatus.length === 0 ? (
          <p>No order status data available</p>
        ) : (
          <>
            <div
              className="donut-chart"
              style={{
                background: `conic-gradient(
                  #2563eb 0% ${delivered}%,
                  #93c5fd ${delivered}% 100%
                )`,
              }}
            >
              <div className="donut-center">
                <strong>{delivered}%</strong>
                <span>Delivered</span>
              </div>
            </div>

            <div className="status-list">
              {orderStatus.map((item, index) => (
                <div className="status-item" key={item.name}>
                  <span
                    className="status-dot"
                    style={{
                      background:
                        index === 0 ? "#2563eb" : "#93c5fd",
                    }}
                  />

                  <span className="status-name">
                    {item.name}
                  </span>

                  <strong>{item.value}%</strong>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderStatus;
