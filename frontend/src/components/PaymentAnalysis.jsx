import { useEffect, useState } from "react";

function PaymentAnalysis({ filters }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
  state: filters?.state || "All States",
  payment: filters?.payment || "All Payment Types",
  period: filters?.period || "Last 6 Months",
});

        const response = await fetch(
  `http://localhost:5000/api/payment-analysis?${params}`
);

        if (!response.ok) {
          throw new Error("Payment API failed");
        }

        const data = await response.json();

        console.log("PAYMENT DATA:", data);
        setPayments(data);
      } catch (error) {
        console.error("PAYMENT ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [filters]);

  return (
    <div className="payment-analysis">
      <div className="payment-header">
        <div>
          <h2>Payment Analysis</h2>
          <p>Payment method performance</p>
        </div>
      </div>

      {loading ? (
        <p>Loading payment data...</p>
      ) : payments.length === 0 ? (
        <p>No payment data available</p>
      ) : (
        <div className="payment-list">
          {payments.map((item) => (
            <div className="payment-item" key={item.paymentType}>
              <div>
                <strong>
                  {item.paymentType
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </strong>

                <span>
                  {Number(item.transactions).toLocaleString("en-IN")}{" "}
                  transactions
                </span>
              </div>

              <strong>
                ₹{Number(item.value).toLocaleString("en-IN")}
              </strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaymentAnalysis;
