import { useEffect } from "react";
import MonthlyReports from "@/components/reports/MonthlyReports";

const Reports = () => {
  useEffect(() => {
    document.title = "Relatórios | Zencora Noma";
  }, []);

  return <MonthlyReports />;
};

export default Reports;
