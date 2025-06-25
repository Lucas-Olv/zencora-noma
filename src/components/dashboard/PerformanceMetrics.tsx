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

const calculateRevenueVariation = (orders: Order[]) => {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  const twoWeeksAgo = new Date(lastWeek);
  twoWeeksAgo.setDate(lastWeek.getDate() - 7);

  const currentWeekRevenue = orders
    .filter((order) => {
      const orderDate = parseDate(order.createdAt);
      return orderDate && orderDate >= lastWeek && orderDate <= today;
    })
    .reduce((sum, order) => sum + (order.price || 0), 0);

  const previousWeekRevenue = orders
    .filter((order) => {
      const orderDate = parseDate(order.createdAt);
      return orderDate && orderDate >= twoWeeksAgo && orderDate < lastWeek;
    })
    .reduce((sum, order) => sum + (order.price || 0), 0);

  const variation =
    previousWeekRevenue === 0
      ? 100
      : ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) *
        100;

  return {
    currentWeekRevenue,
    previousWeekRevenue,
    variation,
  };
};

const calculateOrdersVariation = (orders: Order[]) => {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  const twoWeeksAgo = new Date(lastWeek);
  twoWeeksAgo.setDate(lastWeek.getDate() - 7);

  const currentWeekOrders = orders.filter((order) => {
    const orderDate = parseDate(order.createdAt);
    return orderDate && orderDate >= lastWeek && orderDate <= today;
  }).length;

  const previousWeekOrders = orders.filter((order) => {
    const orderDate = parseDate(order.createdAt);
    return orderDate && orderDate >= twoWeeksAgo && orderDate < lastWeek;
  }).length;

  const variation =
    previousWeekOrders === 0
      ? 100
      : ((currentWeekOrders - previousWeekOrders) / previousWeekOrders) * 100;

  return {
    currentWeekOrders,
    previousWeekOrders,
    variation,
  };
};

const getDailyData = (orders: Order[]) => {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(lastWeek);
    date.setDate(lastWeek.getDate() + i);
    return {
      date: date.toLocaleDateString("pt-BR", { weekday: "short" }),
      Receita: 0,
      Encomendas: 0,
    };
  });

  orders.forEach((order) => {
    const orderDate = parseDate(order.createdAt);
    if (orderDate && orderDate >= lastWeek && orderDate <= today) {
      const dayIndex = Math.floor(
        (orderDate.getTime() - lastWeek.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (dayIndex >= 0 && dayIndex < 7) {
        dailyData[dayIndex].Receita += order.price || 0;
        dailyData[dayIndex].Encomendas += 1;
      }
    }
  });

  return dailyData;
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
