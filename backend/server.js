const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(
  process.env.USERPROFILE,
  "OneDrive",
  "Desktop",
  "Olist_CSV"
);

function readCSV(filename) {
  const filePath = path.join(DATA_DIR, filename);

  const content = fs.readFileSync(filePath, "utf8");

  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_column_count: true,
  });
}

const orders = readCSV("orders.csv");
const customers = readCSV("customers.csv");
const payments = readCSV("order payments.csv");
const reviews = readCSV("order review.csv");

console.log(`Loaded ${orders.length} orders`);
console.log(`Loaded ${customers.length} customers`);
console.log(`Loaded ${payments.length} payments`);
console.log(`Loaded ${reviews.length} reviews`);

// HEALTH CHECK
app.get("/", (req, res) => {
  res.json({
    message: "MetricMind Backend API is running",
    status: "success",
    dataSource: "Olist Brazilian E-Commerce Dataset",
  });
});

// KPIs
app.get("/api/kpis", (req, res) => {
  const { state = "All States", payment = "All Payment Types" } = req.query;

  let filteredOrders = orders;

  // Filter by state
  if (state !== "All States") {
    const stateCustomers = new Set(
      customers
        .filter((customer) => customer.customer_state === state)
        .map((customer) => customer.customer_id)
    );

    filteredOrders = orders.filter((order) =>
      stateCustomers.has(order.customer_id)
    );
  }

  // Get order IDs after state filtering
  const filteredOrderIds = new Set(
    filteredOrders.map((order) => order.order_id)
  );

  // Filter payments
  let filteredPayments = payments.filter((payment) =>
    filteredOrderIds.has(payment.order_id)
  );

  if (payment !== "All Payment Types") {
    const paymentMap = {
      "Credit Card": "credit_card",
      "Debit Card": "debit_card",
      "Voucher": "voucher",
      "Boleto": "boleto",
    };

    const paymentType = paymentMap[payment];

    if (paymentType) {
      filteredPayments = filteredPayments.filter(
        (item) => item.payment_type === paymentType
      );
    }
  }

  const totalOrders = new Set(
    filteredPayments.map((payment) => payment.order_id)
  ).size;

  const totalCustomers = new Set(
    filteredOrders.map((order) => order.customer_id)
  ).size;

  const totalSales = filteredPayments.reduce(
    (sum, payment) => sum + Number(payment.payment_value || 0),
    0
  );

  const deliveredOrders = filteredOrders.filter(
    (order) => order.order_status === "delivered"
  ).length;

  res.json({
    totalSales: Number(totalSales.toFixed(2)),
    totalOrders,
    customers: totalCustomers,
    revenue: Number(totalSales.toFixed(2)),
    deliveredOrders,
  });
});

// SALES
app.get("/api/sales", (req, res) => {
  const {
    state = "All States",
    payment = "All Payment Types",
  } = req.query;

  let filteredOrders = orders;

  // Filter by state
  if (state !== "All States") {
    const stateCustomers = new Set(
      customers
        .filter((customer) => customer.customer_state === state)
        .map((customer) => customer.customer_id)
    );

    filteredOrders = orders.filter((order) =>
      stateCustomers.has(order.customer_id)
    );
  }

  const filteredOrderIds = new Set(
    filteredOrders.map((order) => order.order_id)
  );

  let filteredPayments = payments.filter((payment) =>
    filteredOrderIds.has(payment.order_id)
  );

  // Filter by payment type
  if (payment !== "All Payment Types") {
    const paymentMap = {
      "Credit Card": "credit_card",
      "Debit Card": "debit_card",
      "Voucher": "voucher",
      "Boleto": "boleto",
    };

    const paymentType = paymentMap[payment];

    if (paymentType) {
      filteredPayments = filteredPayments.filter(
        (item) => item.payment_type === paymentType
      );
    }
  }

  const salesByMonth = {};

  filteredPayments.forEach((payment) => {
    const order = filteredOrders.find(
      (item) => item.order_id === payment.order_id
    );

    if (!order) return;

    const date = new Date(order.order_purchase_timestamp);

    if (isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!salesByMonth[key]) {
      salesByMonth[key] = {
        month: date.toLocaleString("en-US", {
          month: "short",
        }),
        year: date.getFullYear(),
        sales: 0,
      };
    }

    salesByMonth[key].sales += Number(
      payment.payment_value || 0
    );
  });

  const result = Object.values(salesByMonth)
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month.localeCompare(b.month);
    })
    .slice(-12)
    .map((item) => ({
      month: item.month,
      year: item.year,
      sales: Number(item.sales.toFixed(2)),
    }));

  res.json(result);
});

// ORDER STATUS
app.get("/api/order-status", (req, res) => {
  const {
    state = "All States",
    payment = "All Payment Types",
  } = req.query;

  let filteredOrders = orders;

  // Filter by state
  if (state !== "All States") {
    const stateCustomers = new Set(
      customers
        .filter((customer) => customer.customer_state === state)
        .map((customer) => customer.customer_id)
    );

    filteredOrders = orders.filter((order) =>
      stateCustomers.has(order.customer_id)
    );
  }

  const filteredOrderIds = new Set(
    filteredOrders.map((order) => order.order_id)
  );

  // Payment filter
  if (payment !== "All Payment Types") {
    const paymentMap = {
      "Credit Card": "credit_card",
      "Debit Card": "debit_card",
      "Voucher": "voucher",
      "Boleto": "boleto",
    };

    const paymentType = paymentMap[payment];

    if (paymentType) {
      const paymentOrderIds = new Set(
        payments
          .filter((item) => item.payment_type === paymentType)
          .map((item) => item.order_id)
      );

      filteredOrders = filteredOrders.filter((order) =>
        paymentOrderIds.has(order.order_id)
      );
    }
  }

  const counts = {};

  filteredOrders.forEach((order) => {
    const status = order.order_status || "unknown";
    counts[status] = (counts[status] || 0) + 1;
  });

  const total = filteredOrders.length;

  const result = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({
      name: name
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      value: total
        ? Number(((count / total) * 100).toFixed(2))
        : 0,
      count,
    }));

  res.json(result);
});

// PAYMENT ANALYSIS
app.get("/api/payment-analysis", (req, res) => {
  const data = {};

  payments.forEach((payment) => {
    const type = payment.payment_type || "unknown";

    if (!data[type]) {
      data[type] = {
        paymentType: type,
        transactions: 0,
        value: 0,
      };
    }

    data[type].transactions += 1;
    data[type].value += Number(payment.payment_value || 0);
  });

  res.json(
    Object.values(data).map((item) => ({
      paymentType: item.paymentType,
      transactions: item.transactions,
      value: Number(item.value.toFixed(2)),
    }))
  );
});

// REVIEWS
app.get("/api/reviews", (req, res) => {
  const scores = {};

  reviews.forEach((review) => {
    const score = review.review_score;

    if (!score) return;

    scores[score] = (scores[score] || 0) + 1;
  });

  res.json(
    Object.entries(scores)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([score, count]) => ({
        score: Number(score),
        count: count,
      }))
  );
});

// SERVER
app.listen(PORT, () => {
  console.log(
    `MetricMind backend running on http://localhost:${PORT}`
  );
});