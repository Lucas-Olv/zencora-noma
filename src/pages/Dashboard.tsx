import { useEffect, useState } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentOrders from "@/components/dashboard/RecentOrders";
import DeliveryCalendar from "@/components/dashboard/DeliveryCalendar";
import { Calendar, ClipboardList, FileText, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { formatDate, parseDate } from "@/lib/utils";

type Order = Tables<"orders">;

interface DashboardStats {
  activeOrders: number;
  inProduction: number;
  scheduled: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  todayDeliveries: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activeOrders: 0,
    inProduction: 0,
    scheduled: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    todayDeliveries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard | Zencora Noma";

    const fetchStats = async () => {
      try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const { data: orders, error } = await supabase
          .from("orders")
          .select("*")
          .gte("created_at", startOfMonth.toISOString());

        if (error) throw error;

        const activeOrders = orders?.filter(order => 
          order.status !== "done" && order.status !== "canceled"
        ).length || 0;

        const inProduction = orders?.filter(order => 
          order.status === "production"
        ).length || 0;

        const scheduled = orders?.filter(order => {
          const dueDate = parseDate(order.due_date);
          return dueDate && dueDate > today;
        }).length || 0;

        const todayDeliveries = orders?.filter(order => {
          const dueDate = parseDate(order.due_date);
          return dueDate && dueDate.toDateString() === today.toDateString();
        }).length || 0;

        const monthlyRevenue = orders?.reduce((sum, order) => 
          sum + (order.price || 0), 0
        ) || 0;

        const weeklyRevenue = orders?.filter(order => {
          const orderDate = parseDate(order.created_at);
          return orderDate && orderDate >= startOfWeek && orderDate <= endOfWeek;
        }).reduce((sum, order) => sum + (order.price || 0), 0) || 0;

        setStats({
          activeOrders,
          inProduction,
          scheduled,
          monthlyRevenue,
          weeklyRevenue,
          todayDeliveries,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
          value={loading ? "-" : stats.activeOrders.toString()}
          description={loading ? "Carregando..." : `${stats.todayDeliveries} para entrega hoje`}
          icon={<ClipboardList className="h-5 w-5 text-primary" />}
          // trend={loading ? undefined : { value: 10, isPositive: true }}
        />
        <StatsCard
          title="Em Produção"
          value={loading ? "-" : stats.inProduction.toString()}
          description={loading ? "Carregando..." : "Em produção"}
          icon={<Users className="h-5 w-5 text-secondary" />}
        />
        <StatsCard
          title="Programadas"
          value={loading ? "-" : stats.scheduled.toString()}
          description={loading ? "Carregando..." : "Para os próximos dias"}
          icon={<Calendar className="h-5 w-5 text-complementary" />}
        />
        <StatsCard
          title="Faturamento (Mês)"
          value={loading ? "-" : formatCurrency(stats.monthlyRevenue)}
          description={loading ? "Carregando..." : `${formatCurrency(stats.weeklyRevenue)} esta semana`}
          icon={<FileText className="h-5 w-5 text-green-600" />}
          // trend={loading ? undefined : { value: 5, isPositive: true }}
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
