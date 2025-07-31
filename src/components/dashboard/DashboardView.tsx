import { useState, useEffect } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import DeliveryCalendar from "@/components/dashboard/DeliveryCalendar";
import { Calendar, ClipboardList, FileText, Users } from "lucide-react";
import { parseDate } from "@/lib/utils";
import RecentReminders from "@/components/dashboard/RecentReminders";
import StatsCardSkeleton from "@/components/dashboard/StatsCardSkeleton";
import PerformanceMetricsSkeleton from "@/components/dashboard/PerformanceMetricsSkeleton";
import DeliveryCalendarSkeleton from "@/components/dashboard/DeliveryCalendarSkeleton";
import RecentRemindersSkeleton from "@/components/dashboard/RecentRemindersSkeleton";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { useTenantStorage } from "@/storage/tenant";
import { Order } from "@/lib/types";
import { Reminder } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { getNomaApi } from "@/lib/apiHelpers";
import dayjs from "@/lib/dayjs";
import { Skeleton } from "../ui/skeleton";

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

const DashboardView = () => {
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
    if (ordersData) {
      const today = dayjs();
      const startOfMonth = today.startOf("month");
      const startOfWeek = today.startOf("week");
      const endOfWeek = today.endOf("week");
      const orders = ordersData.data;

      const activeOrders =
        orders.filter(
          (order: Order) =>
            order.status !== "canceled" && order.status !== "delivered",
        ).length || 0;

      const inProduction =
        orders.filter((order: Order) => order.status === "production").length ||
        0;

      const scheduled =
        orders.filter((order: Order) => {
          const dueDate = parseDate(order.dueDate);
          return (
            dueDate &&
            dueDate.isAfter(today) &&
            order.status !== "canceled" &&
            order.status !== "delivered"
          );
        }).length || 0;

      const todayDeliveries =
        orders.filter((order: Order) => {
          const dueDate = parseDate(order.dueDate);
          return (
            dueDate &&
            dueDate.isSame(today, "day") &&
            order.status !== "canceled" &&
            order.status !== "delivered"
          );
        }).length || 0;

      const monthlyRevenue =
        orders
          .filter((order: Order) => {
            const orderDate = parseDate(order.createdAt);
            return (
              orderDate &&
              orderDate.isSame(startOfMonth, "month") &&
              order.status !== "canceled"
            );
          })
          .reduce(
            (sum: number, order: Order) => sum + (parseFloat(order.price) || 0),
            0,
          ) || 0;

      const weeklyRevenue =
        orders
          .filter((order: Order) => {
            const orderDate = parseDate(order.createdAt);
            return (
              orderDate &&
              orderDate.isAfter(startOfWeek.subtract(1, "day")) &&
              orderDate.isBefore(endOfWeek.add(1, "day")) &&
              order.status !== "canceled"
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

  const todayDeliveriesText =
    stats.todayDeliveries === 0
      ? "Nenhuma entrega para hoje"
      : `${stats.todayDeliveries} para entrega hoje`;

  const weeklyRevenueText =
    stats.weeklyRevenue === 0
      ? "Nenhum faturamento esta semana"
      : `${formatCurrency(stats.weeklyRevenue)} esta semana`;

  const inProductionText =
    stats.inProduction === 0
      ? "Nenhuma em produção"
      : `${stats.inProduction} em produção`;

  return (
    <>
      <PWAInstallPrompt />
      <div className="space-y-6">
        {isOrdersLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Bem-vindo(a) ao Zencora Noma. Veja um resumo de suas encomendas.
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isOrdersLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Encomendas Ativas"
                value={stats.activeOrders.toString()}
                description={todayDeliveriesText}
                icon={<ClipboardList className="h-5 w-5 text-primary" />}
              />
              <StatsCard
                title="Produção"
                value={stats.inProduction.toString()}
                description={inProductionText}
                icon={<Users className="h-5 w-5 text-secondary" />}
              />
              <StatsCard
                title="Programadas"
                value={stats.scheduled.toString()}
                description="Para os próximos dias"
                icon={<Calendar className="h-5 w-5 text-complementary" />}
              />
              <StatsCard
                title="Faturamento (Mês)"
                value={formatCurrency(stats.monthlyRevenue)}
                description={weeklyRevenueText}
                icon={<FileText className="h-5 w-5 text-green-600" />}
              />
            </>
          )}
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
          <div className="lg:col-span-3">
            {isOrdersLoading ? (
              <PerformanceMetricsSkeleton />
            ) : (
              <PerformanceMetrics orders={orders} loading={isOrdersLoading} />
            )}
          </div>
          <div className="lg:col-span-1 flex flex-col space-y-6">
            {isRemindersLoading ? (
              <RecentRemindersSkeleton />
            ) : (
              <RecentReminders
                reminders={reminders}
                loading={isRemindersLoading}
              />
            )}
            {isOrdersLoading ? (
              <DeliveryCalendarSkeleton />
            ) : (
              <DeliveryCalendar orders={orders} loading={isOrdersLoading} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardView;
