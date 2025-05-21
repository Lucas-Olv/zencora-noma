import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Tables } from "@/integrations/supabase/types";
import { parseDate } from "@/lib/utils";

type Order = Tables<"orders">;

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
    .filter(order => {
      const orderDate = parseDate(order.created_at);
      return orderDate && orderDate >= lastWeek && orderDate <= today;
    })
    .reduce((sum, order) => sum + (order.price || 0), 0);

  const previousWeekRevenue = orders
    .filter(order => {
      const orderDate = parseDate(order.created_at);
      return orderDate && orderDate >= twoWeeksAgo && orderDate < lastWeek;
    })
    .reduce((sum, order) => sum + (order.price || 0), 0);

  const variation = previousWeekRevenue === 0 ? 100 : ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100;

  return {
    currentWeekRevenue,
    previousWeekRevenue,
    variation
  };
};

const calculateOrdersVariation = (orders: Order[]) => {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  const twoWeeksAgo = new Date(lastWeek);
  twoWeeksAgo.setDate(lastWeek.getDate() - 7);

  const currentWeekOrders = orders.filter(order => {
    const orderDate = parseDate(order.created_at);
    return orderDate && orderDate >= lastWeek && orderDate <= today;
  }).length;

  const previousWeekOrders = orders.filter(order => {
    const orderDate = parseDate(order.created_at);
    return orderDate && orderDate >= twoWeeksAgo && orderDate < lastWeek;
  }).length;

  const variation = previousWeekOrders === 0 ? 100 : ((currentWeekOrders - previousWeekOrders) / previousWeekOrders) * 100;

  return {
    currentWeekOrders,
    previousWeekOrders,
    variation
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
      date: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      revenue: 0,
      orders: 0
    };
  });

  orders.forEach(order => {
    const orderDate = parseDate(order.created_at);
    if (orderDate && orderDate >= lastWeek && orderDate <= today) {
      const dayIndex = Math.floor((orderDate.getTime() - lastWeek.getTime()) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < 7) {
        dailyData[dayIndex].revenue += order.price || 0;
        dailyData[dayIndex].orders += 1;
      }
    }
  });

  return dailyData;
};

export default function PerformanceMetrics({ orders, loading }: PerformanceMetricsProps) {
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
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-start justify-start">
              <h3 className="text-sm font-medium">Variação do Faturamento</h3>
              <p className="text-2xl font-bold">
                {formatCurrency(revenueData.currentWeekRevenue)}
              </p>
              <p className={`text-sm ${revenueData.variation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueData.variation >= 0 ? '+' : ''}{revenueData.variation.toFixed(1)}% vs semana anterior
              </p>
            </div>
            <div className="flex flex-col items-start justify-start">
              <h3 className="text-sm font-medium">Variação de Encomendas</h3>
              <p className="text-2xl font-bold">{ordersData.currentWeekOrders}</p>
              <p className={`text-sm ${ordersData.variation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {ordersData.variation >= 0 ? '+' : ''}{ordersData.variation.toFixed(1)}% vs semana anterior
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-4 pb-6">
          <div className="h-[30dvh] md:h-[36dvh]">
            <h3 className="text-sm font-medium mb-4">Faturamento Diário</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[30dvh] md:h-[36dvh]">
            <h3 className="text-sm font-medium mb-4">Encomendas Diárias</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 