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

// PERFORMANCE OPTIMIZATION

const customerStateMap = new Map(
  customers.map((customer) => [
    customer.customer_id,
    customer.customer_state,
  ])
);

const orderMap = new Map(
  orders.map((order) => [order.order_id, order])
);

const orderPaymentMap = new Map();

payments.forEach((payment) => {
  if (!orderPaymentMap.has(payment.order_id)) {
    orderPaymentMap.set(payment.order_id, []);
  }

  orderPaymentMap.get(payment.order_id).push(payment);
});

console.log("Performance lookup maps created");

// PRECOMPUTED PERFORMANCE INDEXES

const paymentTypeOrderMap = new Map();

payments.forEach((payment) => {
  if (!paymentTypeOrderMap.has(payment.payment_type)) {
    paymentTypeOrderMap.set(payment.payment_type, new Set());
  }

  paymentTypeOrderMap
    .get(payment.payment_type)
    .add(payment.order_id);
});

const ordersByStateMap = new Map();

orders.forEach((order) => {
  const state = customerStateMap.get(order.customer_id);

  if (!ordersByStateMap.has(state)) {
    ordersByStateMap.set(state, []);
  }

  ordersByStateMap.get(state).push(order);
});

console.log("Precomputed performance indexes created");

// ==============================
// PERIOD FILTER
// ==============================

function filterOrdersByPeriod(orderList, period) {
  if (!period || period === "All Time") {
    return orderList;
  }

  // Find the latest valid order date in the dataset
  const validDates = orderList
    .map((order) => new Date(order.order_purchase_timestamp))
    .filter((date) => !isNaN(date.getTime()));

  if (validDates.length === 0) {
    return orderList;
  }

  const latestDate = new Date(
    Math.max(...validDates.map((date) => date.getTime()))
  );

  let startDate = new Date(latestDate);

  if (period === "Last 6 Months") {
    startDate.setMonth(startDate.getMonth() - 6);
  }

  if (period === "Last 12 Months") {
    startDate.setMonth(startDate.getMonth() - 12);
  }

  if (period === "This Year") {
    startDate = new Date(latestDate.getFullYear(), 0, 1);
  }

  if (period === "Last Year") {
    const startOfLastYear = new Date(
      latestDate.getFullYear() - 1,
      0,
      1
    );

    const startOfThisYear = new Date(
      latestDate.getFullYear(),
      0,
      1
    );

    return orderList.filter((order) => {
      const date = new Date(order.order_purchase_timestamp);

      return date >= startOfLastYear && date < startOfThisYear;
    });
  }

  return orderList.filter((order) => {
    const date = new Date(order.order_purchase_timestamp);

    return date >= startDate && date <= latestDate;
  });
}

// API RESPONSE CACHE

const apiCache = new Map();

function getCachedResponse(key) {
  const cached = apiCache.get(key);

  if (!cached) {
    return null;
  }

  if (Date.now() - cached.timestamp > 30000) {
    apiCache.delete(key);
    return null;
  }

  return cached.data;
}

function setCachedResponse(key, data) {
  apiCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

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
  const {
    state = "All States",
    payment = "All Payment Types",
    period = "Last 6 Months",
  } = req.query;

  console.log("KPI PERIOD RECEIVED:", period);

  // Get customers belonging to selected state
  let filteredOrders = orders;

  if (state === "All States") {
    filteredOrders = orders;
  } else {
    filteredOrders = orders.filter(
      (order) =>
        customerStateMap.get(order.customer_id) === state
    );
  }

  // Filter by period
filteredOrders = filterOrdersByPeriod(
  filteredOrders,
  period
);

  // Order IDs after state + period filtering
const filteredOrderIds = new Set(
  filteredOrders.map((order) => order.order_id)
);

  // Filter payments
  let filteredPayments = payments.filter((item) =>
    filteredOrderIds.has(item.order_id)
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

  // Total orders represented by filtered payments
  const totalOrders = new Set(
    filteredPayments.map((item) => item.order_id)
  ).size;

  // Unique customers
  const totalCustomers = new Set(
    filteredOrders.map((order) => order.customer_id)
  ).size;

  // Total sales
  const totalSales = filteredPayments.reduce(
    (sum, item) =>
      sum + Number(item.payment_value || 0),
    0
  );

  // Delivered orders
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
    period = "Last 6 Months",
  } = req.query;

  let filteredOrderIds;

  // Filter orders by state
  if (state === "All States") {
    filteredOrderIds = new Set(orders.map((order) => order.order_id));
  } else {
    filteredOrderIds = new Set(
      orders
        .filter(
          (order) =>
            customerStateMap.get(order.customer_id) === state
        )
        .map((order) => order.order_id)
    );
  }

  // Filter payments by order IDs
  let filteredPayments = payments.filter((item) =>
    filteredOrderIds.has(item.order_id)
  );

  // Filter payment type
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

  filteredPayments.forEach((paymentItem) => {
    const order = orderMap.get(paymentItem.order_id);

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
      paymentItem.payment_value || 0
    );
  });

  const result = Object.values(salesByMonth)
   .sort((a, b) => {
  if (a.year !== b.year) {
    return a.year - b.year;
  }

  const monthOrder = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12,
  };

  return monthOrder[a.month] - monthOrder[b.month];
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

  let filteredOrders;

  // Filter by state
  if (state === "All States") {
    filteredOrders = orders;
  } else {
    filteredOrders = orders.filter(
      (order) =>
        customerStateMap.get(order.customer_id) === state
    );
  }

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
      const paymentOrderIds = new Set(
        payments
          .filter(
            (item) => item.payment_type === paymentType
          )
          .map((item) => item.order_id)
      );

      filteredOrders = filteredOrders.filter(
        (order) =>
          paymentOrderIds.has(order.order_id)
      );
    }
  }

  // Count statuses
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

  // Get filtered order IDs
  const filteredOrderIds = new Set(
    filteredOrders.map((order) => order.order_id)
  );

  // Filter payments belonging to those orders
  let filteredPayments = payments.filter((paymentItem) =>
    filteredOrderIds.has(paymentItem.order_id)
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
        (paymentItem) =>
          paymentItem.payment_type === paymentType
      );
    }
  }

  // Calculate payment analysis
  const data = {};

  filteredPayments.forEach((paymentItem) => {
    const type = paymentItem.payment_type || "unknown";

    if (!data[type]) {
      data[type] = {
        paymentType: type,
        transactions: 0,
        value: 0,
      };
    }

    data[type].transactions += 1;
    data[type].value += Number(
      paymentItem.payment_value || 0
    );
  });

  const result = Object.values(data).map((item) => ({
    paymentType: item.paymentType,
    transactions: item.transactions,
    value: Number(item.value.toFixed(2)),
  }));

  console.log("PAYMENT ANALYSIS:", result);

  res.json(result);
});

// REVIEWS
app.get("/api/reviews", (req, res) => {
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

  const validOrderIds = new Set(
    filteredOrders.map((order) => order.order_id)
  );

  const scores = {};

  reviews.forEach((review) => {
    if (!validOrderIds.has(review.order_id)) {
      return;
    }

    const score = review.review_score;

    if (!score) {
      return;
    }

    scores[score] = (scores[score] || 0) + 1;
  });

  res.json(
    Object.entries(scores)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([score, count]) => ({
        score: Number(score),
        count,
      }))
  );
});

// ==============================
// ASK METRICMIND
// ==============================

app.post("/api/ask", (req, res) => {
  const question = (req.body.question || "").toLowerCase().trim();

  if (!question) {
    return res.json({
      answer: "Please enter a question.",
    });
  }

  const answers = [];

  // ==============================
  // DELIVERED ORDERS
  // ==============================

  if (
    question.includes("delivered orders") ||
    question.includes("how many orders were delivered") ||
    question.includes("orders delivered") ||
    question.includes("how many delivered")
  ) {
    const delivered = orders.filter(
      (order) => order.order_status === "delivered"
    ).length;

    answers.push(
      `📦 Delivered Orders: ${delivered.toLocaleString("en-IN")}`
    );
  }

  // ==============================
  // TOTAL ORDERS
  // ==============================

  if (
    question.includes("total orders") ||
    question.includes("number of orders") ||
    question.includes("how many orders")
  ) {
    const totalOrders = orders.length;

    answers.push(
      `📦 Total Orders: ${totalOrders.toLocaleString("en-IN")}`
    );
  }

  // ==============================
  // CUSTOMERS
  // ==============================

  if (
    question.includes("customers") ||
    question.includes("how many customers") ||
    question.includes("total customers")
  ) {
    const uniqueCustomers = new Set(
      orders.map((order) => order.customer_id)
    ).size;

    answers.push(
      `👥 Customers: ${uniqueCustomers.toLocaleString("en-IN")}`
    );
  }

  // ==============================
  // TOTAL REVENUE
  // ==============================

  if (
    question.includes("revenue") ||
    question.includes("total revenue") ||
    question.includes("total sales")
  ) {
    const totalRevenue = payments.reduce(
      (sum, payment) =>
        sum + Number(payment.payment_value || 0),
      0
    );

    answers.push(
      `💰 Total Revenue: ₹${totalRevenue.toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`
    );
  }

  // ==============================
  // PAYMENT METHOD
  // ==============================

  if (
    question.includes("payment method") ||
    question.includes("payment type") ||
    question.includes("most used payment")
  ) {
    const paymentCounts = {};

    payments.forEach((payment) => {
      const type = payment.payment_type;

      paymentCounts[type] =
        (paymentCounts[type] || 0) + 1;
    });

    const mostUsed = Object.entries(paymentCounts)
      .sort((a, b) => b[1] - a[1])[0];

    if (mostUsed) {
      const paymentName = mostUsed[0]
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      answers.push(
        `💳 Most Used Payment Method: ${paymentName} (${mostUsed[1].toLocaleString(
          "en-IN"
        )} transactions)`
      );
    }
  }

  // ==============================
  // 5 STAR REVIEWS
  // ==============================

  if (
    question.includes("5 star") ||
    question.includes("5-star") ||
    question.includes("review score 5")
  ) {
    const fiveStarReviews = reviews.filter(
      (review) =>
        Number(review.review_score) === 5
    ).length;

    answers.push(
      `⭐ 5-Star Reviews: ${fiveStarReviews.toLocaleString(
        "en-IN"
      )}`
    );
  }

  // ==============================
  // NO MATCH
  // ==============================

  if (answers.length === 0) {
    return res.json({
      answer:
        "I couldn't understand that question yet. Try asking about orders, delivered orders, customers, revenue, payment methods, or reviews.",
    });
  }

  // ==============================
  // FINAL RESPONSE
  // ==============================

  return res.json({
    answer: answers.join("\n"),
  });
});

// ==============================
// CUSTOMER ANALYSIS
// ==============================

app.get("/api/customers", (req, res) => {
  const {
    state = "All States",
    period = "All Time",
  } = req.query;

  let filteredOrders = orders;

  // Filter by state
  if (state !== "All States") {
    filteredOrders = filteredOrders.filter(
      (order) =>
        customerStateMap.get(order.customer_id) === state
    );
  }

  // Filter by period
  if (period !== "All Time") {
    filteredOrders = filterOrdersByPeriod(
      filteredOrders,
      period
    );
  }

  // Unique customers
  const uniqueCustomers = new Set(
    filteredOrders.map((order) => order.customer_id)
  );

  // Orders per customer
  const ordersPerCustomer =
    uniqueCustomers.size > 0
      ? filteredOrders.length / uniqueCustomers.size
      : 0;

  // Customer state distribution
  const stateCounts = {};

  filteredOrders.forEach((order) => {
    const customerState = customerStateMap.get(
      order.customer_id
    );

    if (!customerState) return;

    stateCounts[customerState] =
      (stateCounts[customerState] || 0) + 1;
  });

  const stateDistribution = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([state, count]) => ({
      state,
      orders: count,
    }));

  res.json({
    totalCustomers: uniqueCustomers.size,
    totalOrders: filteredOrders.length,
    ordersPerCustomer: Number(
      ordersPerCustomer.toFixed(2)
    ),
    stateDistribution,
  });
});

// SERVER
app.listen(PORT, () => {
  console.log(
    `MetricMind backend running on http://localhost:${PORT}`
  );
});