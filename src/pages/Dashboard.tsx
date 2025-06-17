import { useEffect, useState } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import DeliveryCalendar from "@/components/dashboard/DeliveryCalendar";
import { Calendar, ClipboardList, FileText, Users } from "lucide-react";
import { parseDate } from "@/lib/utils";
import RecentReminders from "@/components/dashboard/RecentReminders";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { useTenantStorage } from "@/storage/tenant";
import { Order } from "@/lib/types";
import { Reminder } from "@/lib/types";

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
  const { tenant } = useTenantStorage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
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
    fetchStats();
    fetchReminders();
  }, [tenant]);

  const fetchStats = async () => {
    // try {
    //   if (!tenant) {
    //     throw new Error("Tenant não encontrado");
    //   }

    //   const today = new Date();
    //   const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    //   const startOfWeek = new Date(today);
    //   startOfWeek.setDate(today.getDate() - today.getDay());
    //   const endOfWeek = new Date(startOfWeek);
    //   endOfWeek.setDate(startOfWeek.getDate() + 6);

    //   const { data: orders, error } =
    //     await supabaseService.orders.getTenantOrders(tenant.id);

    //   if (error) throw error;

    //   const activeOrders =
    //     orders?.filter(
    //       (order) => order.status !== "done" && order.status !== "canceled",
    //     ).length || 0;

    //   const inProduction =
    //     orders?.filter((order) => order.status === "production").length || 0;

    //   const scheduled =
    //     orders?.filter((order) => {
    //       const dueDate = parseDate(order.due_date);
    //       return dueDate && dueDate > today;
    //     }).length || 0;

    //   const todayDeliveries =
    //     orders?.filter((order) => {
    //       const dueDate = parseDate(order.due_date);
    //       return dueDate && dueDate.toDateString() === today.toDateString();
    //     }).length || 0;

    //   const monthlyRevenue =
    //     orders?.reduce((sum, order) => sum + (order.price || 0), 0) || 0;

    //   const weeklyRevenue =
    //     orders
    //       ?.filter((order) => {
    //         const orderDate = parseDate(order.created_at);
    //         return (
    //           orderDate && orderDate >= startOfWeek && orderDate <= endOfWeek
    //         );
    //       })
    //       .reduce((sum, order) => sum + (order.price || 0), 0) || 0;

    //   setOrders(orders);
    //   setStats({
    //     activeOrders,
    //     inProduction,
    //     scheduled,
    //     monthlyRevenue,
    //     weeklyRevenue,
    //     todayDeliveries,
    //   });
    // } catch (error) {
    //   console.error("Error fetching stats:", error);
    // } finally {
    //   setLoading(false);
    // }
  };

  const fetchReminders = async () => {
    // if (!tenant) {
    //   throw new Error("Tenant não encontrado");
    // }

    // const { data, error } = await remindersService.getTenantReminders(
    //   tenant.id,
    // );

    // if (error) throw error;

    // setReminders(data.filter((reminder) => reminder.is_done === false));
  };

  return (
    <>
      <PWAInstallPrompt />
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
            description={
              loading
                ? "Carregando..."
                : `${stats.todayDeliveries} para entrega hoje`
            }
            icon={<ClipboardList className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Produção"
            value={loading ? "-" : stats.inProduction.toString()}
            description={loading ? "Carregando..." : "Produção"}
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
            description={
              loading
                ? "Carregando..."
                : `${formatCurrency(stats.weeklyRevenue)} esta semana`
            }
            icon={<FileText className="h-5 w-5 text-green-600" />}
          />
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <PerformanceMetrics orders={orders} loading={loading} />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6">
            <RecentReminders reminders={reminders} loading={loading} />
            <DeliveryCalendar orders={orders} loading={loading} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
