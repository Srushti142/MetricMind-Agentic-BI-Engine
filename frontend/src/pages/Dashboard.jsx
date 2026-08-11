import { useState, useEffect } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import KPICards from "../components/KPICards";
import FilterBar from "../components/FilterBar";
import SalesOverview from "../components/SalesOverview";
import OrderStatus from "../components/OrderStatus";
import PaymentAnalysis from "../components/PaymentAnalysis";
import ReviewAnalysis from "../components/ReviewAnalysis";

function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");

  const [filters, setFilters] = useState({
    period: "Last 6 Months",
    state: "All States",
    payment: "All Payment Types",
  });

  const [kpiData, setKpiData] = useState(null);
  const [customerData, setCustomerData] = useState(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // ==============================
  // LOAD DATA
  // ==============================

  useEffect(() => {
    // AI INSIGHTS DATA
    if (activePage === "ai-insights") {
      fetch("http://localhost:5000/api/kpis")
        .then((response) => response.json())
        .then((data) => {
          console.log("AI Insights KPI data:", data);
          setKpiData(data);
        })
        .catch((error) => {
          console.error("Error fetching KPI data:", error);
        });
    }

    // CUSTOMER DATA
    if (activePage === "customers") {
      fetch("http://localhost:5000/api/customers")
        .then((response) => response.json())
        .then((data) => {
          console.log("Customer data:", data);
          setCustomerData(data);
        })
        .catch((error) => {
          console.error("Error fetching customer data:", error);
        });
    }
  }, [activePage]);

  // ==============================
  // ASK METRICMIND
  // ==============================

  const handleAskMetricMind = async () => {
    if (!question.trim()) {
      setAnswer("Please enter a question.");
      return;
    }

    try {
      setAnswer("🤖 MetricMind is analyzing your question...");

      const response = await fetch(
        "http://localhost:5000/api/ask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question,
          }),
        }
      );

      const data = await response.json();

      setAnswer(data.answer);
    } catch (error) {
      console.error("Ask MetricMind error:", error);

      setAnswer(
        "Unable to connect to MetricMind backend. Please make sure the backend server is running."
      );
    }
  };

  // ==============================
  // FILTERS
  // ==============================

  const handleFilters = (newFilters) => {
    console.log("Dashboard filters:", newFilters);
    setFilters(newFilters);
  };

  // ==============================
  // PAGE CONTENT
  // ==============================

  const renderContent = () => {
    switch (activePage) {
      // ==============================
      // ANALYTICS
      // ==============================

      case "analytics":
        return (
          <div className="page-content">
            <h1>📊 Analytics</h1>

            <p>
              Detailed business analytics and performance insights.
            </p>

            <div className="analytics-grid">
              <SalesOverview filters={filters} />

              <PaymentAnalysis filters={filters} />

              <ReviewAnalysis filters={filters} />
            </div>
          </div>
        );

      // ==============================
      // ORDERS
      // ==============================

      case "orders":
        return (
          <div className="page-content">
            <h1>📦 Orders</h1>

            <p>
              Monitor order performance and order status.
            </p>

            <div className="analytics-grid">
              <OrderStatus filters={filters} />

              <SalesOverview filters={filters} />
            </div>
          </div>
        );

      // ==============================
      // CUSTOMERS
      // ==============================

      case "customers":
        return (
          <div className="page-content">
            <h1>👥 Customers</h1>

            <p>
              Understand your customer base and customer behavior.
            </p>

            {!customerData ? (
              <div className="info-card">
                <h2>🔄 Loading customer data...</h2>

                <p>
                  MetricMind is analyzing your customer data.
                </p>
              </div>
            ) : (
              <>
                <div className="analytics-grid">

                  <div className="info-card">
                    <h2>👥 Total Customers</h2>

                    <h1>
                      {customerData.totalCustomers.toLocaleString(
                        "en-IN"
                      )}
                    </h1>
                  </div>

                  <div className="info-card">
                    <h2>📦 Total Orders</h2>

                    <h1>
                      {customerData.totalOrders.toLocaleString(
                        "en-IN"
                      )}
                    </h1>
                  </div>

                  <div className="info-card">
                    <h2>📊 Orders per Customer</h2>

                    <h1>
                      {customerData.ordersPerCustomer}
                    </h1>
                  </div>

                </div>

                <div className="info-card">
                  <h2>🌎 Customer Distribution by State</h2>

                  {customerData.stateDistribution.map(
                    (item) => (
                      <div
                        key={item.state}
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          padding: "10px",
                          borderBottom:
                            "1px solid #eee",
                        }}
                      >
                        <strong>
                          {item.state}
                        </strong>

                        <span>
                          {item.orders.toLocaleString(
                            "en-IN"
                          )}{" "}
                          orders
                        </span>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        );

      // ==============================
      // AI INSIGHTS
      // ==============================

      case "ai-insights":
        return (
          <div className="page-content">
            <h1>🤖 AI Insights</h1>

            <p>
              Business insights generated from your dashboard data.
            </p>

            {!kpiData ? (
              <div className="info-card">
                <h2>
                  🔄 Analyzing your business data...
                </h2>

                <p>
                  MetricMind is fetching the latest
                  dashboard metrics.
                </p>
              </div>
            ) : (
              <>
                <div className="info-card">
                  <h2>📈 Revenue Insight</h2>

                  <p>
                    Your business has generated{" "}
                    <strong>
                      ₹
                      {Number(
                        kpiData.totalSales || 0
                      ).toLocaleString("en-IN")}
                    </strong>{" "}
                    in total sales across{" "}
                    <strong>
                      {Number(
                        kpiData.totalOrders || 0
                      ).toLocaleString("en-IN")}
                    </strong>{" "}
                    orders.
                  </p>

                  <p>
                    Average order value:{" "}
                    <strong>
                      ₹
                      {(
                        Number(
                          kpiData.totalSales || 0
                        ) /
                        Math.max(
                          Number(
                            kpiData.totalOrders || 1
                          ),
                          1
                        )
                      ).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </p>
                </div>

                <div className="info-card">
                  <h2>⚠️ Business Alert</h2>

                  <p>
                    MetricMind is monitoring{" "}
                    <strong>
                      {Number(
                        kpiData.totalOrders || 0
                      ).toLocaleString("en-IN")}
                    </strong>{" "}
                    total orders.
                  </p>

                  <p>
                    Delivered orders:{" "}
                    <strong>
                      {Number(
                        kpiData.deliveredOrders || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </p>

                  <p>
                    Delivery completion rate:{" "}
                    <strong>
                      {(
                        (Number(
                          kpiData.deliveredOrders || 0
                        ) /
                          Math.max(
                            Number(
                              kpiData.totalOrders || 1
                            ),
                            1
                          )) *
                        100
                      ).toFixed(2)}
                      %
                    </strong>
                  </p>
                </div>

                <div className="info-card">
                  <h2>⭐ Customer Insight</h2>

                  <p>
                    MetricMind is analyzing{" "}
                    <strong>
                      {Number(
                        kpiData.customers || 0
                      ).toLocaleString("en-IN")}
                    </strong>{" "}
                    customers.
                  </p>
                </div>

                <div className="info-card">
  <h2>📊 Performance Insight</h2>

  <p>
    MetricMind has calculated an average order value of{" "}
    <strong>
      ₹
      {(
        Number(kpiData.totalSales || 0) /
        Math.max(Number(kpiData.totalOrders || 1), 1)
      ).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}
    </strong>
    .
  </p>

  <p>
    The current order-to-customer ratio is{" "}
    <strong>
      {(
        Number(kpiData.totalOrders || 0) /
        Math.max(Number(kpiData.customers || 1), 1)
      ).toFixed(2)}
    </strong>{" "}
    orders per customer.
  </p>

  <p>
    The current delivery performance is{" "}
    <strong>
      {(
        (Number(kpiData.deliveredOrders || 0) /
          Math.max(Number(kpiData.totalOrders || 1), 1)) *
        100
      ).toFixed(2)}
      %
    </strong>
    .
  </p>
</div>

              </>
            )}

            {/* ASK METRICMIND */}

            <div className="info-card">
              <h2>🤖 Ask MetricMind</h2>

              <p>
                Ask questions about your business data.
              </p>

              <input
                type="text"
                placeholder="Example: What is my total revenue?"
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAskMetricMind();
                  }
                }}
              />

              <button onClick={handleAskMetricMind}>
                Ask MetricMind
              </button>

              {answer && (
                <div className="metricmind-answer">
                  <h3>💡 MetricMind</h3>

                  <p>{answer}</p>
                </div>
              )}
            </div>
          </div>
        );

      // ==============================
      // SETTINGS
      // ==============================

      case "settings":
  return (
    <div className="page-content">
      <h1>⚙️ Settings</h1>

      <p>
        Configure your MetricMind dashboard preferences.
      </p>

      <div className="info-card">
        <h2>📊 Dashboard Preferences</h2>

        <p>
          Select the default time period for your dashboard.
        </p>

        <select
          value={filters.period}
          onChange={(e) =>
            setFilters({
              ...filters,
              period: e.target.value,
            })
          }
        >
          <option>Last 6 Months</option>
          <option>Last 12 Months</option>
          <option>This Year</option>
          <option>Last Year</option>
          <option>All Time</option>
        </select>
      </div>

      <div className="info-card">
        <h2>🔄 Dashboard Data</h2>

        <p>
          Refresh the dashboard to load the latest
          business data from the backend.
        </p>

        <button
          onClick={() => window.location.reload()}
        >
          🔄 Refresh Dashboard
        </button>
      </div>

      <div className="info-card">
        <h2>🤖 AI Assistant</h2>

        <p>
          MetricMind AI analyzes your business data and
          answers questions about revenue, orders,
          customers, payments and reviews.
        </p>

        <button
          onClick={() => {
            setQuestion("");
            setAnswer("");
          }}
        >
          🧹 Clear AI Conversation
        </button>
      </div>

      <div className="info-card">
        <h2>🟢 System Status</h2>

        <p>
          Backend API: <strong>Connected</strong>
        </p>

        <p>
          Data Source:{" "}
          <strong>Olist Brazilian E-Commerce Dataset</strong>
        </p>

        <p>
          MetricMind Status: <strong>Active</strong>
        </p>
      </div>
    </div>
  );

      // ==============================
      // MAIN DASHBOARD
      // ==============================

      default:
        return (
          <>
            <KPICards filters={filters} />

            <FilterBar
              onApply={handleFilters}
            />

            <div className="analytics-grid">
              <SalesOverview filters={filters} />

              <OrderStatus filters={filters} />

              <PaymentAnalysis filters={filters} />

              <ReviewAnalysis filters={filters} />
            </div>
          </>
        );
    }
  };

  // ==============================
  // MAIN LAYOUT
  // ==============================

  return (
    <div className="dashboard">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="main">

        <Navbar />

        <div className="dashboard-content">
          {renderContent()}
        </div>

      </div>

    </div>
  );
}

export default Dashboard;