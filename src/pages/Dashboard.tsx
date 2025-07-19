import { useEffect } from "react";
import DashboardView from "@/components/dashboard/DashboardView";

const Dashboard = () => {
  useEffect(() => {
    document.title = "Dashboard | Zencora Noma";
  }, []);

  return <DashboardView />;
};

export default Dashboard;
