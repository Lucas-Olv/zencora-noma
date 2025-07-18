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
import { useQuery } from "@tanstack/react-query";
import { getNomaApi } from "@/lib/apiHelpers";

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
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
  } = useQuery({
    queryKey: ["dashboardOrders"],
    queryFn: () =>
      getNomaApi(`/api/noma/v1/orders/tenant`, {
        params: { tenantId: tenant?.id },
      }),
  });

  const {
    data: remindersData,
    isLoading: isRemindersLoading,
    isError: isRemindersError,
  } = useQuery({
    queryKey: ["dashboardReminders"],
    queryFn: () =>
      getNomaApi("/api/noma/v1/reminders/tenant", {
        params: { tenantId: tenant?.id },
      }),
  });

  useEffect(() => {
    document.title = "Dashboard | Zencora Noma";

    if (ordersData) {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      const orders = ordersData.data;
      const activeOrders =
        orders.filter(
          (order: Order) =>
            order.status !== "done" && order.status !== "canceled",
        ).length || 0;

      const inProduction =
        orders.filter((order: Order) => order.status === "production").length ||
        0;

      const scheduled =
        orders.filter((order: Order) => {
          const dueDate = parseDate(order.dueDate);
          return dueDate && dueDate > today;
        }).length || 0;

      const todayDeliveries =
        orders.filter((order: Order) => {
          const dueDate = parseDate(order.dueDate);
          return dueDate && dueDate.toDateString() === today.toDateString();
        }).length || 0;

      const monthlyRevenue =
        orders.reduce(
          (sum: number, order: Order) => sum + (parseFloat(order.price) || 0),
          0,
        ) || 0;

      const weeklyRevenue =
        orders
          .filter((order: Order) => {
            const orderDate = parseDate(order.createdAt);
            return (
              orderDate && orderDate >= startOfWeek && orderDate <= endOfWeek
            );
          })
          .reduce(
            (sum: number, order: Order) => sum + (parseFloat(order.price) || 0),
            0,
          ) || 0;

      setOrders(orders);
      setStats({
        activeOrders,
        inProduction,
        scheduled,
        monthlyRevenue,
        weeklyRevenue,
        todayDeliveries,
      });
    }

    if (remindersData) {
      const reminders = remindersData.data.filter(
        (reminder: Reminder) => !reminder.isDone,
      );
      setReminders(reminders);
    }
  }, [ordersData, remindersData]);

  return (
    <>
      <PWAInstallPrompt />
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Bem-vindo(a) ao Zencora Noma. Veja um resumo de suas encomendas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Encomendas Ativas"
            value={isOrdersLoading ? "-" : stats.activeOrders.toString()}
            description={
              isOrdersLoading
                ? "Carregando..."
                : `${stats.todayDeliveries} para entrega hoje`
            }
            icon={<ClipboardList className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Produção"
            value={isOrdersLoading ? "-" : stats.inProduction.toString()}
            description={isOrdersLoading ? "Carregando..." : "Produção"}
            icon={<Users className="h-5 w-5 text-secondary" />}
          />
          <StatsCard
            title="Programadas"
            value={isOrdersLoading ? "-" : stats.scheduled.toString()}
            description={
              isOrdersLoading ? "Carregando..." : "Para os próximos dias"
            }
            icon={<Calendar className="h-5 w-5 text-complementary" />}
          />
          <StatsCard
            title="Faturamento (Mês)"
            value={isOrdersLoading ? "-" : formatCurrency(stats.monthlyRevenue)}
            description={
              isOrdersLoading
                ? "Carregando..."
                : `${formatCurrency(stats.weeklyRevenue)} esta semana`
            }
            icon={<FileText className="h-5 w-5 text-green-600" />}
          />
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <PerformanceMetrics orders={orders} loading={isOrdersLoading} />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6">
            <RecentReminders
              reminders={reminders}
              loading={isRemindersLoading}
            />
            <DeliveryCalendar orders={orders} loading={isOrdersLoading} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
