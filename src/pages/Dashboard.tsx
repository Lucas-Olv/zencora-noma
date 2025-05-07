import { useEffect } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentOrders from "@/components/dashboard/RecentOrders";
import DeliveryCalendar from "@/components/dashboard/DeliveryCalendar";
import { Calendar, ClipboardList, FileText, Users } from "lucide-react";

const Dashboard = () => {
  useEffect(() => {
    document.title = "Dashboard | Zencora Noma";
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Bem-vindo(a) ao Zencora Noma. Veja um resumo de suas encomendas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Encomendas Ativas"
          value="12"
          description="4 para entrega hoje"
          icon={<ClipboardList className="h-5 w-5 text-primary" />}
          trend={{ value: 10, isPositive: true }}
        />
        <StatsCard
          title="Em Produção"
          value="8"
          description="2 prontas para entrega"
          icon={<Users className="h-5 w-5 text-secondary" />}
        />
        <StatsCard
          title="Programadas"
          value="23"
          description="Para os próximos dias"
          icon={<Calendar className="h-5 w-5 text-complementary" />}
        />
        <StatsCard
          title="Faturamento (Maio)"
          value="R$ 3.800,00"
          description="R$ 750,00 esta semana"
          icon={<FileText className="h-5 w-5 text-green-600" />}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <RecentOrders />
        </div>
        <div className="lg:col-span-1">
          <DeliveryCalendar />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
