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
  File as FileIcon,
  Sheet,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { formatDate, parseDate } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import ReportOrdersList from "./ReportOrdersList";
import { useTenantStorage } from "@/storage/tenant";
import { Order } from "@/lib/types";
import { getNomaApi } from "@/lib/apiHelpers";
import { useQuery } from "@tanstack/react-query";
import ExcelJS from "exceljs";
import Papa from "papaparse";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSubscriptionStorage } from "@/storage/subscription";

interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  dailyRevenue: { day: string; Total: number; Encomendas: number }[];
  categoryData: { name: string; value: number }[];
  // paymentMethodData removido, agora é calculado localmente
}

const MonthlyReports = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [reportData, setReportData] = useState<ReportData>({
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    dailyRevenue: [],
    categoryData: [],
    // paymentMethodData: [] // não usado, manter vazio
  });
  const isMobile = useIsMobile();
  const { tenant } = useTenantStorage();
  const navigate = useNavigate();
  const { subscription } = useSubscriptionStorage();

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Função utilitária para contar métodos de pagamento
  const getPaymentMethodData = (orders: Order[]) => {
    const counts: Record<string, number> = {};
    orders.forEach((order) => {
      if (order.paymentMethod) {
        counts[order.paymentMethod] = (counts[order.paymentMethod] || 0) + 1;
      }
    });
    // Traduzir os labels
    const labelMap: Record<string, string> = {
      credit_card: "Cartão de Crédito",
      debit_card: "Cartão de Débito",
      pix: "Pix",
      cash: "Dinheiro",
    };
    return Object.entries(counts).map(([method, count]) => ({
      metodo: labelMap[method] || method,
      quantidade: count,
    }));
  };

  const paymentMethodData = getPaymentMethodData(orders);

  // Função para traduzir estado do pagamento
  const translatePaymentStatus = (status?: string) => {
    if (status === "pending") return "Pendente";
    if (status === "paid") return "Efetuado";
    if (status === "partially_paid") return "Parcial";
    return "Não informado";
  };

  // Função para traduzir método de pagamento
  const translatePaymentMethod = (method?: string) => {
    if (method === "credit_card") return "Cartão de Crédito";
    if (method === "debit_card") return "Cartão de Débito";
    if (method === "pix") return "Pix";
    if (method === "cash") return "Dinheiro";
    return "Não informado";
  };

  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    refetch,
  } = useQuery({
    queryKey: ["orders", dateRange?.from, dateRange?.to, tenant?.id],
    queryFn: () =>
      getNomaApi(`/api/noma/v1/orders/tenant`, {
        params: {
          tenantId: tenant?.id,
          periodStart: dateRange?.from?.toISOString(),
          periodEnd: dateRange?.to?.toISOString(),
        },
      }),
  });

  useEffect(() => {
    if (ordersData) {
      if (dateRange?.from && dateRange?.to) {
        // Ajusta as datas para o início e fim do dia
        const startDate = new Date(dateRange.from);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999);

        // Filtra as encomendas no lado do cliente para garantir precisão
        const filteredOrders =
          ordersData.data
            ?.filter((order: Order) => {
              const orderDate = parseDate(order.dueDate);
              if (!orderDate) return false;

              // Verifica se a data está dentro do intervalo
              return orderDate >= startDate && orderDate <= endDate;
            })
            .sort((a: Order, b: Order) => {
              // Ordena por data de entrega em ordem crescente
              const dateA = parseDate(a.dueDate);
              const dateB = parseDate(b.dueDate);
              if (!dateA || !dateB) return 0;
              return dateA.getTime() - dateB.getTime();
            }) || [];

        setOrders(filteredOrders);

        // Process data for reports
        const processedData: ReportData = {
          totalOrders: filteredOrders.length,
          totalRevenue: filteredOrders.reduce(
            (sum: number, order: Order) => sum + (parseFloat(order.price) || 0),
            0,
          ),
          completedOrders: filteredOrders.filter(
            (order: Order) => order.status === "done",
          ).length,
          pendingOrders: filteredOrders.filter(
            (order: Order) => order.status !== "done",
          ).length,
          dailyRevenue: [],
          categoryData: [],
          // paymentMethodData: [] // não usado, manter vazio
        };

        // Process daily revenue
        if (dateRange?.from && dateRange?.to) {
          const days = eachDayOfInterval({
            start: dateRange.from,
            end: dateRange.to,
          });
          processedData.dailyRevenue = days.map((day) => {
            const dayOrders = filteredOrders.filter((order: Order) => {
              const orderDate = parseDate(order.dueDate);
              if (!orderDate) return false;
              return isSameDay(orderDate, day);
            });
            return {
              day: format(day, "dd/MM"),
              Total: dayOrders.reduce(
                (sum: number, order: Order) =>
                  sum + (parseFloat(order.price) || 0),
                0,
              ),
              Encomendas: dayOrders.length,
            };
          });
        }
        setReportData(processedData);
      }
    }
  }, [ordersData, isOrdersLoading]);

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
      theme: "plain",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        halign: "center",
        fontSize: 11,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 255],
      },
      margin: { left: 14, right: 14 },
      styles: { lineWidth: 0.2, lineColor: [220, 220, 220] },
      tableLineColor: [240, 240, 240],
    });

    // Payment Methods section
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(
      "Relação de Pagamentos",
      14,
      (doc as any).lastAutoTable.finalY + 15,
    );
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Método de Pagamento", "Quantidade"]],
      body: paymentMethodData.map((item) => [item.metodo, item.quantidade]),
      theme: "plain",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        halign: "center",
        fontSize: 11,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 255],
      },
      margin: { left: 14, right: 14 },
      styles: { lineWidth: 0.2, lineColor: [220, 220, 220] },
      tableLineColor: [240, 240, 240],
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
      theme: "plain",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        halign: "center",
        fontSize: 11,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 255],
      },
      margin: { left: 14, right: 14 },
      styles: { lineWidth: 0.2, lineColor: [220, 220, 220] },
      tableLineColor: [240, 240, 240],
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
      head: [
        [
          "Cliente",
          "Descrição",
          "Valor",
          "Valor Pago",
          "Pagamento",
          "Método",
          "Data",
          "Status",
        ],
      ],
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
                : order.status === "done"
                  ? "Concluído"
                  : order.status === "canceled"
                    ? "Cancelado"
                    : order.status === "delivered"
                      ? "Entregue"
                      : order.status;
        return [
          order.clientName,
          order.description || "Sem descrição",
          formatCurrency(parseFloat(order.price)),
          order.amountPaid ? formatCurrency(parseFloat(order.amountPaid)) : "-",
          translatePaymentStatus(order.paymentStatus),
          translatePaymentMethod(order.paymentMethod),
          formatDate(order.dueDate),
          status,
        ];
      }),
      theme: "plain",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        halign: "center",
        fontSize: 9,
        cellPadding: 2.5,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 255],
      },
      margin: { left: 14, right: 14 },
      styles: { lineWidth: 0.2, lineColor: [220, 220, 220] },
      tableLineColor: [240, 240, 240],
      columnStyles: {
        0: { cellWidth: 28 }, // Cliente
        1: { cellWidth: 40 }, // Descrição
        2: { cellWidth: 20 }, // Valor
        3: { cellWidth: 20 }, // Valor Pago
        4: { cellWidth: 18 }, // Pagamento
        5: { cellWidth: 24 }, // Método
        6: { cellWidth: 16 }, // Data
        7: { cellWidth: 16 }, // Status
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

  const handleExportCSV = () => {
    let csvContent = "";

    // 1. Resumo
    const summaryData = [
      { Métrica: "Total de Encomendas", Valor: reportData.totalOrders },
      {
        Métrica: "Faturamento Total",
        Valor: formatCurrency(reportData.totalRevenue),
      },
      {
        Métrica: "Encomendas Concluídas",
        Valor: `${reportData.completedOrders} (${completionRate}%)`,
      },
      { Métrica: "Encomendas Pendentes", Valor: reportData.pendingOrders },
    ];
    csvContent += "Resumo\n";
    csvContent += Papa.unparse(summaryData);
    csvContent += "\n\n";

    // 2. Relação de Pagamentos
    csvContent += "Relação de Pagamentos\n";
    csvContent += Papa.unparse(
      paymentMethodData.map((item) => ({
        "Método de Pagamento": item.metodo,
        Quantidade: item.quantidade,
      })),
    );
    csvContent += "\n\n";

    // 3. Receita Diária
    csvContent += "Receita Diária\n";
    csvContent += Papa.unparse(
      reportData.dailyRevenue.map((item) => ({
        Data: item.day,
        Receita: formatCurrency(item.Total),
      })),
    );
    csvContent += "\n\n";

    // 4. Encomendas
    csvContent += "Encomendas do Período\n";
    const ordersData = orders.map((order) => {
      const isOverdue = new Date(order.dueDate) < new Date();
      const status =
        isOverdue &&
        (order.status === "pending" || order.status === "production")
          ? "Atrasado"
          : order.status === "pending"
            ? "Pendente"
            : order.status === "production"
              ? "Produção"
              : order.status === "done"
                ? "Concluído"
                : order.status === "canceled"
                  ? "Cancelado"
                  : order.status === "delivered"
                    ? "Entregue"
                    : order.status;
      return {
        Cliente: order.clientName,
        Descrição: order.description || "Sem descrição",
        Valor: formatCurrency(parseFloat(order.price)),
        "Valor Pago": order.amountPaid
          ? formatCurrency(parseFloat(order.amountPaid))
          : "-",
        Pagamento: translatePaymentStatus(order.paymentStatus),
        Método: translatePaymentMethod(order.paymentMethod),
        Data: formatDate(order.dueDate),
        Status: status,
      };
    });
    csvContent += Papa.unparse(ordersData);

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `relatorio-zencora-${formatDate(new Date().toISOString(), "yyyy-MM-dd")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportXLSX = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Zencora Noma";
    workbook.created = new Date();

    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: "FFFFFFFF" } },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF8C52FF" },
      },
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      },
    };

    const cellBorderStyle: Partial<ExcelJS.Style> = {
      border: {
        top: { style: "thin", color: { argb: "FFBDBDBD" } },
        left: { style: "thin", color: { argb: "FFBDBDBD" } },
        bottom: { style: "thin", color: { argb: "FFBDBDBD" } },
        right: { style: "thin", color: { argb: "FFBDBDBD" } },
      },
    };

    const evenRowFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFAFAFF" }, // Cor clara para linhas pares
    };

    const applySheetStyling = (worksheet: ExcelJS.Worksheet) => {
      worksheet.getRow(1).height = 30; // Aumenta a altura do cabeçalho

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          row.eachCell((cell) => {
            cell.style = headerStyle;
          });
        } else {
          row.eachCell((cell) => {
            cell.border = cellBorderStyle.border;
            if (rowNumber % 2 === 0) {
              cell.fill = evenRowFill;
            }
          });
        }
      });
    };

    // --- Planilha de Resumo ---
    const summaryWS = workbook.addWorksheet("Resumo");
    summaryWS.columns = [
      { header: "Métrica", key: "metric", width: 25 },
      { header: "Valor", key: "value", width: 25 },
    ];
    summaryWS.addRows([
      { metric: "Total de Encomendas", value: reportData.totalOrders },
      {
        metric: "Faturamento Total",
        value: reportData.totalRevenue,
      },
      {
        metric: "Encomendas Concluídas",
        value: `${reportData.completedOrders} (${completionRate}%)`,
      },
      {
        metric: "Encomendas Pendentes",
        value: reportData.pendingOrders,
      },
    ]);
    summaryWS.getCell("B3").numFmt = '"R$"#,##0.00';
    applySheetStyling(summaryWS);

    // --- Planilha de Pagamentos ---
    const paymentsWS = workbook.addWorksheet("Pagamentos");
    paymentsWS.columns = [
      { header: "Método de Pagamento", key: "method", width: 25 },
      { header: "Quantidade", key: "quantity", width: 15 },
    ];
    paymentMethodData.forEach((item) => {
      paymentsWS.addRow({ method: item.metodo, quantity: item.quantidade });
    });
    applySheetStyling(paymentsWS);

    // --- Planilha de Receita Diária ---
    const dailyRevenueWS = workbook.addWorksheet("Receita Diária");
    dailyRevenueWS.columns = [
      { header: "Data", key: "day", width: 15 },
      { header: "Receita", key: "revenue", width: 20 },
    ];
    reportData.dailyRevenue.forEach((item) => {
      dailyRevenueWS.addRow({
        day: item.day,
        revenue: item.Total,
      });
    });
    dailyRevenueWS.getColumn("B").numFmt = '"R$"#,##0.00';
    applySheetStyling(dailyRevenueWS);

    // --- Planilha de Encomendas ---
    const ordersWS = workbook.addWorksheet("Encomendas");
    ordersWS.columns = [
      { header: "Cliente", key: "client", width: 30 },
      { header: "Descrição", key: "description", width: 40 },
      { header: "Valor", key: "price", width: 15 },
      { header: "Valor Pago", key: "amountPaid", width: 15 },
      { header: "Pagamento", key: "paymentStatus", width: 20 },
      { header: "Método", key: "paymentMethod", width: 20 },
      { header: "Data", key: "dueDate", width: 15 },
      { header: "Status", key: "status", width: 15 },
    ];
    orders.forEach((order) => {
      const isOverdue = new Date(order.dueDate) < new Date();
      const status =
        isOverdue &&
        (order.status === "pending" || order.status === "production")
          ? "Atrasado"
          : order.status === "pending"
            ? "Pendente"
            : order.status === "production"
              ? "Produção"
              : order.status === "done"
                ? "Concluído"
                : order.status === "canceled"
                  ? "Cancelado"
                  : order.status === "delivered"
                    ? "Entregue"
                    : order.status;
      ordersWS.addRow({
        client: order.clientName,
        description: order.description || "Sem descrição",
        price: parseFloat(order.price),
        amountPaid: order.amountPaid ? parseFloat(order.amountPaid) : "-",
        paymentStatus: translatePaymentStatus(order.paymentStatus),
        paymentMethod: translatePaymentMethod(order.paymentMethod),
        dueDate: formatDate(order.dueDate),
        status: status,
      });
    });
    ordersWS.getColumn("C").numFmt = '"R$"#,##0.00';
    ordersWS.getColumn("D").numFmt = '"R$"#,##0.00';
    applySheetStyling(ordersWS);

    // Salva o arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-zencora-${formatDate(new Date().toISOString(), "yyyy-MM-dd")}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isOrdersLoading) {
    return (
      <div className="flex items-center justify-center h-[50dvh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">
          Acompanhe o desempenho do seu negócio através de gráficos e análises
        </p>
      </div>

      <div className="flex flex-col w-full gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={dateRange?.from ? format(dateRange.from, "yyyy-MM") : ""}
              onValueChange={(value) => {
                const [year, month] = value.split("-");
                const start = new Date(parseInt(year), parseInt(month) - 1, 1);
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
                    arr.findIndex((item) => item.props.value === monthYear) ===
                    i
                  );
                })}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-full sm:w-[300px]"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={isOrdersLoading}
                    className="shrink-0 h-10 w-10"
                  >
                    {isOrdersLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2"
                  >
                    <FileIcon className="h-4 w-4 text-red-500" />
                    <span>Exportar para PDF</span>
                  </DropdownMenuItem>

                  {(subscription?.plan === "pro" || subscription?.isTrial) && (
                    <DropdownMenuItem
                      onClick={handleExportCSV}
                      className="flex items-center gap-2"
                    >
                      <Sheet className="h-4 w-4 text-green-500" />
                      <span>Exportar para CSV</span>
                    </DropdownMenuItem>
                  )}
                  {(subscription?.plan === "pro" || subscription?.isTrial) && (
                    <DropdownMenuItem
                      onClick={handleExportXLSX}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span>Exportar para Excel</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col items-start justify-start">
                    <h3 className="text-lg font-medium">
                      Relação de Pagamentos
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Relação das formas de pagamento utilizadas no período
                    </p>
                  </div>
                  {paymentMethodData.length > 0 && (
                    <div className="h-[30dvh] md:h-[36dvh]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={paymentMethodData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="metodo" />
                          <Tooltip
                            formatter={(value) => `${value} encomenda(s)`}
                          />
                          <Bar
                            dataKey="quantidade"
                            fill="hsl(var(--primary))"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {paymentMethodData.length == 0 && (
                    <div className="flex flex-column items-center justify-center h-[30dvh] md:h-[36dvh]">
                      <p className="text-center text-muted-foreground">
                        Nenhuma relação de pagamento encontrada nas encomendas.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="space-y-6">
        <ReportOrdersList
          orders={orders}
          title="Encomendas do Mês"
          description="Lista de todas as encomendas do mês atual"
        />
      </div>
    </div>
  );
};

export default MonthlyReports;
