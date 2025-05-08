import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Download, FileText, Loader2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Badge } from "@/components/ui/badge";

type Order = Tables<"orders">;

interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  dailyRevenue: { day: string; value: number }[];
  categoryData: { name: string; value: number }[];
}

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
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), "MMMM", { locale: ptBR }));
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    dailyRevenue: [],
    categoryData: [],
  });
  const isMobile = useIsMobile();

  // Available months
  const months = Array.from({ length: 12 }, (_, i) => 
    format(new Date(2024, i, 1), "MMMM", { locale: ptBR })
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from("orders")
          .select("*");

        if (dateRange?.from && dateRange?.to) {
          query = query
            .gte('created_at', dateRange.from.toISOString())
            .lte('created_at', dateRange.to.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;
        setOrders(data || []);

        // Process data for reports
        const processedData: ReportData = {
          totalOrders: data?.length || 0,
          totalRevenue: data?.reduce((sum, order) => sum + (order.price || 0), 0) || 0,
          completedOrders: data?.filter(order => order.status === "done").length || 0,
          pendingOrders: data?.filter(order => order.status !== "done").length || 0,
          dailyRevenue: [],
          categoryData: [],
        };

        // Process daily revenue
        if (dateRange?.from && dateRange?.to) {
          const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
          processedData.dailyRevenue = days.map(day => {
            const dayOrders = data?.filter(order => {
              const orderDate = parseISO(order.created_at);
              return orderDate.getDate() === day.getDate() &&
                     orderDate.getMonth() === day.getMonth() &&
                     orderDate.getFullYear() === day.getFullYear();
            }) || [];
            return {
              day: format(day, "dd/MM"),
              value: dayOrders.reduce((sum, order) => sum + (order.price || 0), 0),
            };
          });
        }

        // Process category data (placeholder - you might want to add categories to your orders)
        processedData.categoryData = [
          { name: "Bolos", value: Math.floor(Math.random() * 30) + 10 },
          { name: "Doces", value: Math.floor(Math.random() * 20) + 5 },
          { name: "Salgados", value: Math.floor(Math.random() * 15) + 5 },
          { name: "Kits", value: Math.floor(Math.random() * 10) + 2 },
        ];

        setReportData(processedData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [dateRange]);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    const monthIndex = months.indexOf(month);
    const year = new Date().getFullYear();
    setDateRange({
      from: startOfMonth(new Date(year, monthIndex, 1)),
      to: endOfMonth(new Date(year, monthIndex, 1)),
    });
  };

  const completionRate = reportData.totalOrders > 0 
    ? Math.round((reportData.completedOrders / reportData.totalOrders) * 100)
    : 0;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Use theme colors
    const primaryColor: [number, number, number] = [140, 82, 255]; // #8C52FF
    const secondaryColor: [number, number, number] = [81, 112, 255]; // #5170FF
    const complementaryColor: [number, number, number] = [255, 102, 196]; // #FF66C4
    const mutedColor: [number, number, number] = [100, 100, 100];
    
    // Title with custom styling
    doc.setFontSize(24);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Zencora Noma", pageWidth / 2, 20, { align: "center" });
    
    // Subtitle
    doc.setFontSize(16);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("Relatório de Vendas", pageWidth / 2, 30, { align: "center" });
    
    // Period with custom styling
    doc.setFontSize(12);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    const periodText = dateRange?.from && dateRange?.to
      ? `Período: ${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
      : "Período: Todo o mês";
    doc.text(periodText, pageWidth / 2, 40, { align: "center" });
    
    // Summary section with custom styling
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Resumo", 14, 55);
    
    // Summary table with custom styling
    autoTable(doc, {
      startY: 60,
      head: [["Métrica", "Valor"]],
      body: [
        ["Total de Encomendas", reportData.totalOrders.toString()],
        ["Faturamento Total", formatCurrency(reportData.totalRevenue)],
        ["Encomendas Concluídas", `${reportData.completedOrders} (${completionRate}%)`],
        ["Encomendas Pendentes", reportData.pendingOrders.toString()],
      ],
      theme: "grid",
      headStyles: { 
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 14, right: 14 }
    });
    
    // Daily Revenue section
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Receita Diária", 14, (doc as any).lastAutoTable.finalY + 15);
    
    // Daily revenue table with custom styling
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Data", "Receita"]],
      body: reportData.dailyRevenue.map(item => [
        item.day,
        formatCurrency(item.value)
      ]),
      theme: "grid",
      headStyles: { 
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 14, right: 14 }
    });
    
    // Category Distribution section
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Distribuição por Categoria", 14, (doc as any).lastAutoTable.finalY + 15);
    
    // Category table with custom styling
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Categoria", "Quantidade"]],
      body: reportData.categoryData.map(item => [
        item.name,
        item.value.toString()
      ]),
      theme: "grid",
      headStyles: { 
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 14, right: 14 }
    });
    
    // Orders List section
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Encomendas do Período", 14, (doc as any).lastAutoTable.finalY + 15);
    
    // Orders table with custom styling
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Cliente", "Descrição", "Valor", "Data", "Status"]],
      body: orders.map(order => [
        order.client_name,
        order.description || "Sem descrição",
        formatCurrency(order.price),
        format(new Date(order.created_at), "dd/MM/yyyy"),
        order.status === "pending" ? "Pendente" :
        order.status === "production" ? "Em produção" :
        "Concluído"
      ]),
      theme: "grid",
      headStyles: { 
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 40 }, // Cliente
        1: { cellWidth: 60 }, // Descrição
        2: { cellWidth: 30 }, // Valor
        3: { cellWidth: 25 }, // Data
        4: { cellWidth: 25 }, // Status
      }
    });
    
    // Footer
    const totalPages = (doc as any).internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
      doc.text(
        `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: "center" }
      );
    }
    
    // Save the PDF
    doc.save(`relatorio-zencora-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <div className="flex items-center gap-3">
          <Select value={selectedMonth} onValueChange={handleMonthChange}>
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
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Button variant="outline" size="icon" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ReportItem
          title="Total de Encomendas"
          value={reportData.totalOrders}
          icon={<FileText className="h-5 w-5 text-primary" />}
          className="bg-white dark:bg-card border"
        />
        <ReportItem
          title="Faturamento"
          value={formatCurrency(reportData.totalRevenue)}
          icon={<FileText className="h-5 w-5 text-green-600" />}
          className="bg-white dark:bg-card border"
        />
        <ReportItem
          title="Concluídas"
          value={`${reportData.completedOrders} (${completionRate}%)`}
          icon={<FileText className="h-5 w-5 text-secondary" />}
          className="bg-white dark:bg-card border"
        />
        <ReportItem
          title="Pendentes"
          value={reportData.pendingOrders}
          icon={<FileText className="h-5 w-5 text-amber-500" />}
          className="bg-white dark:bg-card border"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita Diária</CardTitle>
            <CardDescription>Faturamento ao longo do período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={reportData.dailyRevenue}
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
                  data={reportData.categoryData}
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
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Encomendas do Período</CardTitle>
          <CardDescription>Lista de todas as encomendas no período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhuma encomenda encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-accent/50 transition-colors border"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="font-medium">{order.client_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.description || "Sem descrição"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(order.price)}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), "dd/MM/yyyy")}
                      </div>
                    </div>
                    <Badge variant="outline" className={cn(
                      "whitespace-nowrap",
                      order.status === "pending" && "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
                      order.status === "production" && "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50",
                      order.status === "done" && "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50"
                    )}>
                      {order.status === "pending" && "Pendente"}
                      {order.status === "production" && "Em produção"}
                      {order.status === "done" && "Concluído"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyReports;
