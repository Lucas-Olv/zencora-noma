import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { parseDate } from "@/lib/utils";
import { LoadingState } from "@/components/ui/loading-state";
import { ChartBarIcon } from "lucide-react";
import { Order } from "@/lib/types";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
dayjs.locale("pt-br");

interface PerformanceMetricsProps {
  orders: Order[];
  loading: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Utilitário para normalizar uma data para o início do dia (00:00:00)
function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Utilitário para normalizar uma data para o fim do dia (23:59:59.999)
function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

const calculateRevenueVariation = (orders: Order[]) => {
  const today = dayjs().startOf("day");
  const endToday = dayjs().endOf("day");
  const lastWeekStart = today.subtract(6, "day"); // 7 dias incluindo hoje
  const previousWeekStart = lastWeekStart.subtract(7, "day");
  const previousWeekEnd = lastWeekStart.subtract(1, "day").endOf("day");

  const currentWeekRevenue = orders
    .filter((order) => {
      const orderDate = dayjs(parseDate(order.dueDate)).startOf("day");
      return (orderDate.isAfter(lastWeekStart) || orderDate.isSame(lastWeekStart)) && (orderDate.isBefore(endToday) || orderDate.isSame(endToday));
    })
    .reduce((sum: number, order: Order) => sum + (parseFloat(order.price) || 0), 0);

  const previousWeekRevenue = orders
    .filter((order) => {
      const orderDate = dayjs(parseDate(order.dueDate)).startOf("day");
      return (orderDate.isAfter(previousWeekStart) || orderDate.isSame(previousWeekStart)) && (orderDate.isBefore(previousWeekEnd) || orderDate.isSame(previousWeekEnd));
    })
    .reduce((sum: number, order: Order) => sum + (parseFloat(order.price) || 0), 0);

  const variation =
    previousWeekRevenue === 0
      ? currentWeekRevenue > 0 ? 100 : 0
      : ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100;

  return {
    currentWeekRevenue,
    previousWeekRevenue,
    variation,
  };
};

const calculateOrdersVariation = (orders: Order[]) => {
  const today = dayjs().startOf("day");
  const endToday = dayjs().endOf("day");
  const lastWeekStart = today.subtract(6, "day");
  const previousWeekStart = lastWeekStart.subtract(7, "day");
  const previousWeekEnd = lastWeekStart.subtract(1, "day").endOf("day");

  const currentWeekOrders = orders.filter((order) => {
    const orderDate = dayjs(parseDate(order.dueDate)).startOf("day");
    return (orderDate.isAfter(lastWeekStart) || orderDate.isSame(lastWeekStart)) && (orderDate.isBefore(endToday) || orderDate.isSame(endToday));
  }).length;

  const previousWeekOrders = orders.filter((order) => {
    const orderDate = dayjs(parseDate(order.dueDate)).startOf("day");
    return (orderDate.isAfter(previousWeekStart) || orderDate.isSame(previousWeekStart)) && (orderDate.isBefore(previousWeekEnd) || orderDate.isSame(previousWeekEnd));
  }).length;

  const variation =
    previousWeekOrders === 0
      ? currentWeekOrders > 0 ? 100 : 0
      : ((currentWeekOrders - previousWeekOrders) / previousWeekOrders) * 100;

  return {
    currentWeekOrders,
    previousWeekOrders,
    variation,
  };
};

const getDailyData = (orders: Order[]) => {
  const today = dayjs().startOf("day");
  const lastWeekStart = today.subtract(6, "day");

  // Cria array de 7 dias (de 6 dias atrás até hoje)
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = lastWeekStart.add(i, "day");
    return {
      date: date.format("ddd"), // agora em português
      Receita: 0,
      Encomendas: 0,
      _date: date,
    };
  });

  orders.forEach((order) => {
    const orderDate = dayjs(parseDate(order.dueDate)).startOf("day");
    const dayIndex = dailyData.findIndex((d) => d._date.isSame(orderDate, "day"));
    if (dayIndex !== -1) {
      dailyData[dayIndex].Receita += parseFloat(order.price) || 0;
      dailyData[dayIndex].Encomendas += 1;
    }
  });

  // Remove _date antes de retornar
  return dailyData.map(({ _date, ...rest }) => rest);
};

export default function PerformanceMetrics({
  orders,
  loading,
}: PerformanceMetricsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p>Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const revenueData = calculateRevenueVariation(orders);
  const ordersData = calculateOrdersVariation(orders);
  const dailyData = getDailyData(orders);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Performance</CardTitle>
        <CardDescription>
          Acompanhe a performance geral diária e semanal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoadingState
          loading={loading}
          empty={!orders.length}
          emptyText="Nenhuma encomenda encontrada"
          emptyIcon={
            <ChartBarIcon className="h-12 w-12 text-muted-foreground" />
          }
        >
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-start justify-start">
                <h3 className="text-lg font-medium">Faturamento Semanal</h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(revenueData.currentWeekRevenue)}
                </p>
                <p
                  className={`text-sm ${revenueData.variation >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {revenueData.variation >= 0 ? "+" : ""}
                  {revenueData.variation.toFixed(1)}% vs semana anterior
                </p>
              </div>
              <div className="h-[30dvh] md:h-[36dvh]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />

                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Line type="monotone" dataKey="Receita" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-start justify-start">
                <h3 className="text-lg font-medium">Variação de Encomendas</h3>
                <p className="text-2xl font-bold">
                  {ordersData.currentWeekOrders}
                </p>
                <p
                  className={`text-sm ${ordersData.variation >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {ordersData.variation >= 0 ? "+" : ""}
                  {ordersData.variation.toFixed(1)}% vs semana anterior
                </p>
              </div>
              <div className="h-[30dvh] md:h-[36dvh]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <Tooltip />
                    <Bar dataKey="Encomendas" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </LoadingState>
      </CardContent>
    </Card>
  );
}
