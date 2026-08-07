const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());


// ======================================
// HEALTH CHECK
// ======================================

app.get("/", (req, res) => {
  res.json({
    message: "MetricMind Backend API is running",
    status: "success",
  });
});


// ======================================
// KPI DATA
// ======================================

app.get("/api/kpis", (req, res) => {
  res.json({
    totalSales: 1524500,
    totalOrders: 8420,
    customers: 3175,
    revenue: 2480000,
  });
});


// ======================================
// SALES OVERVIEW
// ======================================

app.get("/api/sales", (req, res) => {

  const sales = [
    { month: "Jan", sales: 65000 },
    { month: "Feb", sales: 78000 },
    { month: "Mar", sales: 52000 },
    { month: "Apr", sales: 88000 },
    { month: "May", sales: 72000 },
    { month: "Jun", sales: 95000 },
  ];

  res.json(sales);
});


// ======================================
// ORDER STATUS
// ======================================

app.get("/api/order-status", (req, res) => {

  const orderStatus = [
    {
      name: "Delivered",
      value: 68,
    },
    {
      name: "Shipped",
      value: 15,
    },
    {
      name: "Processing",
      value: 10,
    },
    {
      name: "Cancelled",
      value: 7,
    },
  ];

  res.json(orderStatus);
});


// ======================================
// SERVER
// ======================================

app.listen(PORT, () => {
  console.log(`MetricMind backend running on http://localhost:${PORT}`);
});
