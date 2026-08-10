import { useEffect, useState } from "react";

function OrderStatus({ filters }) {
  const [orderStatus, setOrderStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({
    state: filters.state,
    payment: filters.payment,
  });

  fetch(`http://localhost:5000/api/order-status?${params}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Order status API failed");
        }
        return response.json();
      })
      .then((data) => {
        console.log("ORDER STATUS DATA:", data);
        setOrderStatus(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("ORDER STATUS ERROR:", error);
        setLoading(false);
      });
  }, [filters]);

  const delivered =
    orderStatus.find((item) => item.name === "Delivered")
      ?.value || 0;

  const canceled =
    orderStatus.find((item) => item.name === "Canceled")
      ?.value || 0;

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h2>Order Status</h2>
          <p>Current order distribution</p>
        </div>
      </div>

      <div className="order-status-content">
        {loading ? (
          <p>Loading order status...</p>
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
                <div className="status-item" key={index}>
                  <span
                    className="status-dot"
                    style={{
                      background:
                        index === 0 ? "#2563eb" : "#93c5fd",
                    }}
                  ></span>

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
