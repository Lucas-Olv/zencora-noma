
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Download, FileText } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Sample data for reports
const monthlyData = {
  "janeiro": {
    totalOrders: 42,
    totalRevenue: 6850,
    completedOrders: 38,
    pendingOrders: 4,
    dailyRevenue: [
      { day: "01", value: 280 },
      { day: "05", value: 420 },
      { day: "10", value: 650 },
      { day: "15", value: 950 },
      { day: "20", value: 820 },
      { day: "25", value: 1230 },
      { day: "30", value: 2500 },
    ],
    categoryData: [
      { name: "Bolos", value: 25 },
      { name: "Doces", value: 12 },
      { name: "Salgados", value: 8 },
      { name: "Kits", value: 5 },
    ]
  },
  "fevereiro": {
    totalOrders: 38,
    totalRevenue: 5950,
    completedOrders: 36,
    pendingOrders: 2,
    dailyRevenue: [
      { day: "01", value: 350 },
      { day: "05", value: 480 },
      { day: "10", value: 520 },
      { day: "15", value: 850 },
      { day: "20", value: 920 },
      { day: "25", value: 1180 },
      { day: "28", value: 1650 },
    ],
    categoryData: [
      { name: "Bolos", value: 22 },
      { name: "Doces", value: 10 },
      { name: "Salgados", value: 6 },
      { name: "Kits", value: 4 },
    ]
  },
  "março": {
    totalOrders: 45,
    totalRevenue: 7250,
    completedOrders: 42,
    pendingOrders: 3,
    dailyRevenue: [
      { day: "01", value: 420 },
      { day: "05", value: 580 },
      { day: "10", value: 750 },
      { day: "15", value: 920 },
      { day: "20", value: 1050 },
      { day: "25", value: 1480 },
      { day: "31", value: 2050 },
    ],
    categoryData: [
      { name: "Bolos", value: 26 },
      { name: "Doces", value: 14 },
      { name: "Salgados", value: 9 },
      { name: "Kits", value: 6 },
    ]
  },
  "abril": {
    totalOrders: 52,
    totalRevenue: 8350,
    completedOrders: 48,
    pendingOrders: 4,
    dailyRevenue: [
      { day: "01", value: 380 },
      { day: "05", value: 620 },
      { day: "10", value: 940 },
      { day: "15", value: 1250 },
      { day: "20", value: 1420 },
      { day: "25", value: 1780 },
      { day: "30", value: 1960 },
    ],
    categoryData: [
      { name: "Bolos", value: 30 },
      { name: "Doces", value: 15 },
      { name: "Salgados", value: 10 },
      { name: "Kits", value: 7 },
    ]
  },
  "maio": {
    totalOrders: 23,
    totalRevenue: 3800,
    completedOrders: 10,
    pendingOrders: 13,
    dailyRevenue: [
      { day: "01", value: 420 },
      { day: "05", value: 850 },
      { day: "10", value: 1050 },
      { day: "15", value: 1480 },
    ],
    categoryData: [
      { name: "Bolos", value: 12 },
      { name: "Doces", value: 7 },
      { name: "Salgados", value: 5 },
      { name: "Kits", value: 3 },
    ]
  }
};

// Available months
const months = ["janeiro", "fevereiro", "março", "abril", "maio"];

const ReportItem = ({ title, value, icon, className }: { title: string; value: string | number; icon: React.ReactNode; className?: string }) => (
  <div className={cn("flex items-center p-4 rounded-lg", className)}>
    <div className="rounded-full p-2 mr-4 bg-primary/10">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <h4 className="text-2xl font-bold">{value}</h4>
    </div>
  </div>
);

const MonthlyReports = () => {
  const [selectedMonth, setSelectedMonth] = useState("maio");
  const isMobile = useIsMobile();
  const data = monthlyData[selectedMonth as keyof typeof monthlyData];

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const completionRate = Math.round((data.completedOrders / data.totalOrders) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <div className="flex items-center gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Selecionar mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month.charAt(0).toUpperCase() + month.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ReportItem
          title="Total de Encomendas"
          value={data.totalOrders}
          icon={<FileText className="h-5 w-5 text-primary" />}
          className="bg-white dark:bg-card border"
        />
        <ReportItem
          title="Faturamento"
          value={formatCurrency(data.totalRevenue)}
          icon={<FileText className="h-5 w-5 text-green-600" />}
          className="bg-white dark:bg-card border"
        />
        <ReportItem
          title="Concluídas"
          value={`${data.completedOrders} (${completionRate}%)`}
          icon={<FileText className="h-5 w-5 text-secondary" />}
          className="bg-white dark:bg-card border"
        />
        <ReportItem
          title="Pendentes"
          value={data.pendingOrders}
          icon={<FileText className="h-5 w-5 text-amber-500" />}
          className="bg-white dark:bg-card border"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita Diária</CardTitle>
            <CardDescription>Faturamento ao longo do mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.dailyRevenue}
                  margin={{
                    top: 5,
                    right: 5,
                    left: 5,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" />
                  <YAxis 
                    tickFormatter={(value) => `R$ ${value}`}
                    width={isMobile ? 40 : 60}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value}`, "Receita"]}
                    labelFormatter={(label) => `Dia ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Encomendas por Categoria</CardTitle>
            <CardDescription>Distribuição de produtos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.categoryData}
                  margin={{
                    top: 5,
                    right: 5,
                    left: 5,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="value"
                    name="Quantidade"
                    fill="hsl(var(--secondary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyReports;
