import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import KPICards from "../components/KPICards";

function Dashboard() {
  return (
    <div className="container">

      <Sidebar />

      <div className="main">

        <Navbar />

        <KPICards />

      </div>

    </div>
  );
}

export default Dashboard;
