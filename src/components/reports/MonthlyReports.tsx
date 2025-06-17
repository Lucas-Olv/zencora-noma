import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Download,
  FileText,
  Loader2,
  Check,
  Clock,
} from "lucide-react";
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
import { cn, formatDate, getOrderCode, parseDate } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  isWithinInterval,
  isSameDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Badge } from "@/components/ui/badge";
import { report } from "process";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { SubscriptionGate } from "../subscription/SubscriptionGate";
import ReportOrdersList from "./ReportOrdersList";
import { LoadingState } from "@/components/ui/loading-state";
import { useTenantStorage } from "@/storage/tenant";
import { Order } from "@/lib/types";

interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  dailyRevenue: { day: string; Total: number; Encomendas: number }[];
  categoryData: { name: string; value: number }[];
}

const ReportItem = ({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex items-center p-4 rounded-lg", className)}>
    <div className="rounded-full p-2 mr-4 bg-primary/10">{icon}</div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <h4 className="text-2xl font-bold">{value}</h4>
    </div>
  </div>
);

const MonthlyReports = () => {
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
  const { isLoading } = useWorkspaceContext();
  const { tenant } = useTenantStorage();
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  useEffect(() => {
    if (!isLoading) {
      fetchOrders();
    }
  }, [dateRange, isLoading, tenant]);

  const fetchOrders = async () => {
    // try {
    //   setLoading(true);
    //   if (dateRange?.from && dateRange?.to) {
    //     // Ajusta as datas para o início e fim do dia
    //     const startDate = new Date(dateRange.from);
    //     startDate.setHours(0, 0, 0, 0);

    //     const endDate = new Date(dateRange.to);
    //     endDate.setHours(23, 59, 59, 999);

    //     const { data, error } = await supabaseService.orders.getTenantOrders(
    //       tenant.id,
    //     );
    //     if (error) throw error;

    //     // Filtra as encomendas no lado do cliente para garantir precisão
    //     const filteredOrders =
    //       data
    //         ?.filter((order) => {
    //           const orderDate = parseDate(order.due_date);
    //           if (!orderDate) return false;

    //           // Verifica se a data está dentro do intervalo
    //           return orderDate >= startDate && orderDate <= endDate;
    //         })
    //         .sort((a, b) => {
    //           // Ordena por data de entrega em ordem crescente
    //           const dateA = parseDate(a.due_date);
    //           const dateB = parseDate(b.due_date);
    //           if (!dateA || !dateB) return 0;
    //           return dateA.getTime() - dateB.getTime();
    //         }) || [];

    //     setOrders(filteredOrders);

    //     // Process data for reports
    //     const processedData: ReportData = {
    //       totalOrders: filteredOrders.length,
    //       totalRevenue: filteredOrders.reduce(
    //         (sum, order) => sum + (order.price || 0),
    //         0,
    //       ),
    //       completedOrders: filteredOrders.filter(
    //         (order) => order.status === "done",
    //       ).length,
    //       pendingOrders: filteredOrders.filter(
    //         (order) => order.status !== "done",
    //       ).length,
    //       dailyRevenue: [],
    //       categoryData: [],
    //     };

    //     // Process daily revenue
    //     if (dateRange?.from && dateRange?.to) {
    //       const days = eachDayOfInterval({
    //         start: dateRange.from,
    //         end: dateRange.to,
    //       });
    //       processedData.dailyRevenue = days.map((day) => {
    //         const dayOrders = filteredOrders.filter((order) => {
    //           const orderDate = parseDate(order.due_date);
    //           if (!orderDate) return false;
    //           return isSameDay(orderDate, day);
    //         });
    //         return {
    //           day: format(day, "dd/MM"),
    //           Total: dayOrders.reduce(
    //             (sum, order) => sum + (order.price || 0),
    //             0,
    //           ),
    //           Encomendas: dayOrders.length,
    //         };
    //       });
    //     }

    //     // Process category data (placeholder - you might want to add categories to your orders)
    //     processedData.categoryData = [
    //       { name: "Bolos", value: Math.floor(Math.random() * 30) + 10 },
    //       { name: "Doces", value: Math.floor(Math.random() * 20) + 5 },
    //       { name: "Salgados", value: Math.floor(Math.random() * 15) + 5 },
    //       { name: "Kits", value: Math.floor(Math.random() * 10) + 2 },
    //     ];

    //     setReportData(processedData);
    //   }
    // } catch (error) {
    //   console.error("Error fetching orders:", error);
    // } finally {
    //   setLoading(false);
    // }
  };

  const completionRate =
    reportData.totalOrders > 0
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
    const periodText =
      dateRange?.from && dateRange?.to
        ? `Período: ${formatDate(dateRange.from.toISOString(), "dd/MM/yyyy")} - ${formatDate(dateRange.to.toISOString(), "dd/MM/yyyy")}`
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
        [
          "Encomendas Concluídas",
          `${reportData.completedOrders} (${completionRate}%)`,
        ],
        ["Encomendas Pendentes", reportData.pendingOrders.toString()],
      ],
      theme: "grid",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 14, right: 14 },
    });

    // Daily Revenue section
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Receita Diária", 14, (doc as any).lastAutoTable.finalY + 15);

    // Daily revenue table with custom styling
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Data", "Receita"]],
      body: reportData.dailyRevenue.map((item) => [
        item.day,
        formatCurrency(item.Total),
      ]),
      theme: "grid",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 14, right: 14 },
    });

    // Orders List section
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(
      "Encomendas do Período",
      14,
      (doc as any).lastAutoTable.finalY + 15,
    );

    // Orders table with custom styling
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Cliente", "Descrição", "Valor", "Data", "Status"]],
      body: orders.map((order) => {
        const isOverdue = new Date(order.dueDate) < new Date();
        const status =
          isOverdue &&
          (order.status === "pending" || order.status === "production")
            ? "Atrasado"
            : order.status === "pending"
              ? "Pendente"
              : order.status === "production"
                ? "Produção"
                : "Concluído";

        return [
          order.clientName,
          order.description || "Sem descrição",
          formatCurrency(order.price),
          formatDate(order.dueDate),
          status,
        ];
      }),
      theme: "grid",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 40 }, // Cliente
        1: { cellWidth: 60 }, // Descrição
        2: { cellWidth: 30 }, // Valor
        3: { cellWidth: 25 }, // Data
        4: { cellWidth: 25 }, // Status
      },
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
        { align: "center" },
      );
      doc.text(
        `Gerado em ${formatDate(new Date().toISOString(), "dd/MM/yyyy 'às' HH:mm")}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: "center" },
      );
    }

    // Save the PDF
    doc.save(
      `relatorio-zencora-${formatDate(new Date().toISOString(), "yyyy-MM-dd")}.pdf`,
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50dvh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">
          Acompanhe o desempenho do seu negócio através de gráficos e análises
        </p>
      </div>

      <div className="flex flex-col w-full gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4">
            <SubscriptionGate blockMode="disable">
              <Select
                value={dateRange?.from ? format(dateRange.from, "yyyy-MM") : ""}
                onValueChange={(value) => {
                  const [year, month] = value.split("-");
                  const start = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    1,
                  );
                  const end = new Date(parseInt(year), parseInt(month), 0);
                  setDateRange({ from: start, to: end });
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    const monthYear = format(date, "yyyy-MM");
                    return (
                      <SelectItem key={monthYear} value={monthYear}>
                        {format(date, "MMMM yyyy", { locale: ptBR }).replace(
                          /^\w/,
                          (c) => c.toUpperCase(),
                        )}
                      </SelectItem>
                    );
                  }).filter((_, i, arr) => {
                    // Remove duplicatas verificando se é a primeira ocorrência do mês/ano
                    const monthYear = arr[i].props.value;
                    return (
                      arr.findIndex(
                        (item) => item.props.value === monthYear,
                      ) === i
                    );
                  })}
                </SelectContent>
              </Select>
            </SubscriptionGate>
            <div className="flex gap-2">
              <SubscriptionGate>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  className="w-full sm:w-[300px]"
                />
              </SubscriptionGate>
              <SubscriptionGate blockMode="disable">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDownloadPDF}
                  disabled={loading}
                  className="shrink-0 h-10 w-10"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </SubscriptionGate>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Encomendas
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento Total
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Encomendas Concluídas
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.completedOrders}
            </div>
            <CardDescription className="mt-1">
              {completionRate}% do total
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Encomendas Pendentes
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.pendingOrders}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-4">
          <Card className="overflow-hidden">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle>Análise de Desempenho</CardTitle>
              <CardDescription>
                Visualize o desempenho do seu negócio através de gráficos e
                análises
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-3 sm:space-y-4 sm:p-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Receita Diária</h3>
                    <p className="text-sm text-muted-foreground">
                      Evolução da receita ao longo do período
                    </p>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <div className="min-w-[280px] h-[25dvh] sm:min-w-[600px] sm:h-[30dvh]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportData.dailyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 12 }}
                          interval="preserveStartEnd"
                        />
                        {/* <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => formatCurrency(value)}
                        /> */}
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          labelStyle={{ fontSize: 12 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Total"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Encomendas por Dia
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Quantidade de encomendas por dia no período
                    </p>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <div className="min-w-[280px] h-[25dvh] sm:min-w-[600px] sm:h-[30dvh]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.dailyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 12 }}
                          interval="preserveStartEnd"
                        />
                        {/* <YAxis tick={{ fontSize: 12 }} /> */}
                        <Tooltip labelStyle={{ fontSize: 12 }} />
                        <Bar
                          dataKey="Encomendas"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <LoadingState
        loading={loading}
        empty={!orders.length}
        emptyText="Nenhuma encomenda encontrada"
        emptyIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
      >
        <div className="space-y-6">
          <ReportOrdersList
            orders={orders}
            title="Encomendas do Mês"
            description="Lista de todas as encomendas do mês atual"
          />
        </div>
      </LoadingState>
    </div>
  );
};

export default MonthlyReports;
