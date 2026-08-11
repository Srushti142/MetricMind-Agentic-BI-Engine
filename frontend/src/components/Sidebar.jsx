function Sidebar({ activePage, setActivePage }) {
  return (
    <div className="sidebar">
      <h2>MetricMind</h2>

      <ul>
        <li
          className={activePage === "dashboard" ? "active" : ""}
          onClick={() => setActivePage("dashboard")}
        >
          🏠 Dashboard
        </li>

        <li
          className={activePage === "analytics" ? "active" : ""}
          onClick={() => setActivePage("analytics")}
        >
          📊 Analytics
        </li>

        <li
          className={activePage === "orders" ? "active" : ""}
          onClick={() => setActivePage("orders")}
        >
          📦 Orders
        </li>

        <li
          className={activePage === "customers" ? "active" : ""}
          onClick={() => setActivePage("customers")}
        >
          👥 Customers
        </li>

        <li
          className={activePage === "ai-insights" ? "active" : ""}
          onClick={() => setActivePage("ai-insights")}
        >
          🤖 AI Insights
        </li>

        <li
          className={activePage === "settings" ? "active" : ""}
          onClick={() => setActivePage("settings")}
        >
          ⚙️ Settings
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
