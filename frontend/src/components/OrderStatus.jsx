import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";


function OrderStatus() {

  const [orderStatus, setOrderStatus] = useState([]);


  useEffect(() => {

    fetch("http://localhost:5000/api/order-status")
      .then((response) => response.json())
      .then((data) => {
        setOrderStatus(data);
      })
      .catch((error) => {
        console.error("Error fetching order status:", error);
      });

  }, []);


  const colors = [
    "#2563eb",
    "#60a5fa",
    "#93c5fd",
    "#dbeafe",
  ];


  return (

    <div className="chart-card">

      <div className="chart-header">

        <div>
          <h2>Order Status</h2>
          <p>Current order distribution</p>
        </div>

      </div>


      <div className="chart-container">

        <ResponsiveContainer width="100%" height={300}>

          <PieChart>

            <Pie
              data={orderStatus}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >

              {orderStatus.map((entry, index) => (

                <Cell
                  key={`cell-${index}`}
                  fill={colors[index]}
                />

              ))}

            </Pie>


            <Tooltip />

            <Legend />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>

  );
}


export default OrderStatus;
