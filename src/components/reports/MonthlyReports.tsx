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
  Legend,
} from "recharts";
import { formatDate, parseDate } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
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
import dayjs from "@/lib/dayjs";

interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  canceledRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  dailyRevenue: {
    day: string;
    Total: number;
    Pendentes: number;
    Produção: number;
    Concluídas: number;
    Entregues: number;
    Canceladas: number;
    Atrasadas: number;
  }[];
  categoryData: { name: string; value: number }[];
  canceledOrders: number;
  readyForDelivery: number;
}

const MonthlyReports = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: dayjs().startOf("month").toDate(),
    to: dayjs().endOf("month").toDate(),
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [reportData, setReportData] = useState<ReportData>({
    totalOrders: 0,
    totalRevenue: 0,
    canceledRevenue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    dailyRevenue: [],
    categoryData: [],
    canceledOrders: 0,
    readyForDelivery: 0,
  });
  const { tenant } = useTenantStorage();
  const { subscription } = useSubscriptionStorage();

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getPaymentMethodData = (orders: Order[]) => {
    const counts: Record<string, number> = {};
    orders.forEach((order) => {
      if (order.paymentMethod) {
        counts[order.paymentMethod] = (counts[order.paymentMethod] || 0) + 1;
      }
    });
    const labelMap: Record<string, string> = {
      credit_card: "Crédito",
      debit_card: "Débito",
      pix: "Pix",
      cash: "Dinheiro",
    };
    return Object.entries(counts).map(([method, count]) => ({
      metodo: labelMap[method] || method,
      quantidade: count,
    }));
  };

  const paymentMethodData = getPaymentMethodData(
    orders.filter((order: Order) => order.status !== "canceled"),
  );

  const translatePaymentStatus = (status?: string) => {
    if (status === "pending") return "Pendente";
    if (status === "paid") return "Efetuado";
    if (status === "partially_paid") return "Parcial";
    return "Não informado";
  };

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
          periodStart: dateRange?.from
            ? dayjs(dateRange.from).toISOString()
            : undefined,
          periodEnd: dateRange?.to
            ? dayjs(dateRange.to).toISOString()
            : undefined,
        },
      }),
  });

  useEffect(() => {
    if (ordersData) {
      if (dateRange?.from && dateRange?.to) {
        const startDate = dayjs(dateRange.from).startOf("day");
        const endDate = dayjs(dateRange.to).endOf("day");

        const filteredOrders =
          ordersData.data
            ?.filter((order: Order) => {
              const orderDate = parseDate(order.dueDate);
              if (!orderDate) return false;
              return (
                orderDate.isSameOrAfter(startDate) &&
                orderDate.isSameOrBefore(endDate)
              );
            })
            .sort((a: Order, b: Order) => {
              const dateA = parseDate(a.dueDate);
              const dateB = parseDate(b.dueDate);
              if (!dateA || !dateB) return 0;
              return dateA.diff(dateB);
            }) || [];

        setOrders(filteredOrders);

        const processedData: ReportData = {
          totalOrders: filteredOrders.length,
          canceledOrders: filteredOrders.filter(
            (order: Order) => order.status === "canceled",
          ).length,
          readyForDelivery: filteredOrders.filter(
            (order: Order) => order.status === "done",
          ).length,
          totalRevenue: filteredOrders
            .filter((order: Order) => order.status !== "canceled")
            .reduce(
              (sum: number, order: Order) =>
                sum + (parseFloat(order.price) || 0),
              0,
            ),
          canceledRevenue: filteredOrders
            .filter((order: Order) => order.status === "canceled")
            .reduce(
              (sum: number, order: Order) =>
                sum + (parseFloat(order.price) || 0),
              0,
            ),
          completedOrders: filteredOrders.filter(
            (order: Order) =>
              order.status === "delivered" || order.status === "canceled",
          ).length,
          pendingOrders: filteredOrders.filter(
            (order: Order) =>
              order.status !== "delivered" && order.status !== "canceled",
          ).length,
          dailyRevenue: [],
          categoryData: [],
        };

        if (dateRange?.from && dateRange?.to) {
          const days = [];
          let currentDay = dayjs(dateRange.from);
          while (currentDay.isSameOrBefore(dayjs(dateRange.to), "day")) {
            days.push(currentDay);
            currentDay = currentDay.add(1, "day");
          }

          processedData.dailyRevenue = days.map((day) => {
            const dayOrders = filteredOrders.filter((order: Order) => {
              const orderDate = parseDate(order.dueDate);
              if (!orderDate) return false;
              return orderDate.isSame(day, "day");
            });
            const revenueDayOrders = dayOrders.filter(
              (order: Order) => order.status !== "canceled",
            );

            // Contagem de encomendas por status
            const pendingOrders = dayOrders.filter(
              (order) => order.status === "pending",
            ).length;

            const productionOrders = dayOrders.filter(
              (order) => order.status === "production",
            ).length;

            const doneOrders = dayOrders.filter(
              (order) => order.status === "done",
            ).length;

            const deliveredOrders = dayOrders.filter(
              (order) => order.status === "delivered",
            ).length;

            const canceledOrders = dayOrders.filter(
              (order) => order.status === "canceled",
            ).length;

            const overdueOrders = dayOrders.filter((order) => {
              const dueDate = parseDate(order.dueDate);
              return (
                dueDate &&
                dueDate.isBefore(dayjs(), "day") &&
                (order.status === "pending" || order.status === "production")
              );
            }).length;

            return {
              day: day.format("DD/MM"),
              Total: revenueDayOrders.reduce(
                (sum: number, order: Order) =>
                  sum + (parseFloat(order.price) || 0),
                0,
              ),
              Pendentes: pendingOrders,
              Produção: productionOrders,
              Concluídas: doneOrders,
              Entregues: deliveredOrders,
              Canceladas: canceledOrders,
              Atrasadas: overdueOrders,
            };
          });
        }
        setReportData(processedData);
      }
    }
  }, [ordersData, isOrdersLoading, dateRange]);

  const completionRate =
    reportData.totalOrders > 0
      ? Math.round((reportData.completedOrders / reportData.totalOrders) * 100)
      : 0;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const primaryColor: [number, number, number] = [140, 82, 255];
    const secondaryColor: [number, number, number] = [81, 112, 255];
    const mutedColor: [number, number, number] = [100, 100, 100];

    doc.setFontSize(24);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Zencora Noma", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("Relatório de Vendas", pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    const periodText =
      dateRange?.from && dateRange?.to
        ? `Período: ${dayjs(dateRange.from).format("DD/MM/YYYY")} - ${dayjs(dateRange.to).format("DD/MM/YYYY")}`
        : "Período: Todo o mês";
    doc.text(periodText, pageWidth / 2, 40, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Resumo", 14, 55);

    autoTable(doc, {
      startY: 60,
      head: [["Métrica", "Valor"]],
      body: [
        ["Total de Encomendas", reportData.totalOrders.toString()],
        ["Faturamento Total", formatCurrency(reportData.totalRevenue)],
        [
          "Encomendas Finalizadas",
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

    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Receita Diária", 14, (doc as any).lastAutoTable.finalY + 15);

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

    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(
      "Encomendas do Período",
      14,
      (doc as any).lastAutoTable.finalY + 15,
    );

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
        const isOverdue = dayjs(order.dueDate).isBefore(dayjs());
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
        0: { cellWidth: 28 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 18 },
        5: { cellWidth: 24 },
        6: { cellWidth: 16 },
        7: { cellWidth: 16 },
      },
    });

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
        `Gerado em ${dayjs().format("DD/MM/YYYY [às] HH:mm")}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: "center" },
      );
    }

    doc.save(`relatorio-zencora-${dayjs().format("YYYY-MM-DD")}.pdf`);
  };

  const handleExportCSV = () => {
    let csvContent = "";

    const summaryData = [
      { Métrica: "Total de Encomendas", Valor: reportData.totalOrders },
      {
        Métrica: "Faturamento Total",
        Valor: formatCurrency(reportData.totalRevenue),
      },
      {
        Métrica: "Encomendas Finalizadas",
        Valor: `${reportData.completedOrders} (${completionRate}%)`,
      },
      { Métrica: "Encomendas Pendentes", Valor: reportData.pendingOrders },
    ];
    csvContent += "Resumo\n";
    csvContent += Papa.unparse(summaryData);
    csvContent += "\n\n";

    csvContent += "Relação de Pagamentos\n";
    csvContent += Papa.unparse(
      paymentMethodData.map((item) => ({
        "Método de Pagamento": item.metodo,
        Quantidade: item.quantidade,
      })),
    );
    csvContent += "\n\n";

    csvContent += "Receita Diária\n";
    csvContent += Papa.unparse(
      reportData.dailyRevenue.map((item) => ({
        Data: item.day,
        Receita: formatCurrency(item.Total),
      })),
    );
    csvContent += "\n\n";

    csvContent += "Encomendas do Período\n";
    const ordersData = orders.map((order) => {
      const isOverdue = dayjs(order.dueDate).isBefore(dayjs());
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
      `relatorio-zencora-${dayjs().format("YYYY-MM-DD")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportXLSX = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Zencora Noma";
    workbook.created = dayjs().toDate();

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
      fgColor: { argb: "FFFAFAFF" },
    };

    const applySheetStyling = (worksheet: ExcelJS.Worksheet) => {
      worksheet.getRow(1).height = 30;

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
        metric: "Encomendas Finalizadas",
        value: `${reportData.completedOrders} (${completionRate}%)`,
      },
      {
        metric: "Encomendas Pendentes",
        value: reportData.pendingOrders,
      },
    ]);
    summaryWS.getCell("B3").numFmt = '"R$"#,##0.00';
    applySheetStyling(summaryWS);

    const paymentsWS = workbook.addWorksheet("Pagamentos");
    paymentsWS.columns = [
      { header: "Método de Pagamento", key: "method", width: 25 },
      { header: "Quantidade", key: "quantity", width: 15 },
    ];
    paymentMethodData.forEach((item) => {
      paymentsWS.addRow({ method: item.metodo, quantity: item.quantidade });
    });
    applySheetStyling(paymentsWS);

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
      const isOverdue = dayjs(order.dueDate).isBefore(dayjs());
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

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-zencora-${dayjs().format("YYYY-MM-DD")}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalOrdersDescription =
    reportData.totalOrders === 0
      ? "Nenhuma encomenda no período"
      : reportData.canceledOrders === 0
        ? "Nenhuma encomenda cancelada"
        : `${reportData.canceledOrders} canceladas`;

  const totalRevenueDescription =
    reportData.totalRevenue === 0
      ? "Nenhum faturamento no período"
      : reportData.canceledRevenue > 0
        ? `- ${formatCurrency(reportData.canceledRevenue)} em encomendas canceladas`
        : "Nenhum faturamento cancelado";

  const completedOrdersDescription =
    reportData.completedOrders === 0
      ? "Nenhuma encomenda finalizada"
      : `${completionRate}% do total`;

  const pendingOrdersDescription =
    reportData.pendingOrders === 0
      ? "Nenhuma encomenda pendente"
      : reportData.readyForDelivery === 0
        ? "Nenhuma pronta para entrega"
        : `${reportData.readyForDelivery} prontas para entrega`;

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
          Acompanhe detalhadamente o desempenho do seu negócio através de
          gráficos e análises
        </p>
      </div>

      <div className="flex flex-col w-full gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={
                dateRange?.from ? dayjs(dateRange.from).format("YYYY-MM") : ""
              }
              onValueChange={(value) => {
                const start = dayjs(value, "YYYY-MM").startOf("month").toDate();
                const end = dayjs(value, "YYYY-MM").endOf("month").toDate();
                setDateRange({ from: start, to: end });
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const date = dayjs().subtract(i, "month");
                  const monthYear = date.format("YYYY-MM");
                  return (
                    <SelectItem key={monthYear} value={monthYear}>
                      {date
                        .format("MMMM YYYY")
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </SelectItem>
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
            <CardDescription>{totalOrdersDescription}</CardDescription>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento Total Líquido
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData.totalRevenue)}
            </div>
            <CardDescription>{totalRevenueDescription}</CardDescription>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Encomendas Finalizadas
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
              <div>{completedOrdersDescription}</div>
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
            <CardDescription>{pendingOrdersDescription}</CardDescription>
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
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          labelStyle={{ fontSize: 12 }}
                          contentStyle={{
                            backgroundColor: "hsl(var(--accent))",
                            border: "1px solid hsl(var(--border))",
                            color: "hsl(var(--foreground))",
                          }}
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

              <div className="space-y-2 sm:space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Encomendas por Dia
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Distribuição de encomendas por status em cada dia
                    </p>
                  </div>
                </div>

                <div className="w-full h-[30dvh] overflow-x-auto">
                  <div className="min-w-[280px] h-[25dvh] sm:min-w-[600px] sm:h-[30dvh]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.dailyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 12 }}
                          interval="preserveStartEnd"
                        />
                        <Tooltip
                          labelStyle={{ fontSize: 12 }}
                          contentStyle={{
                            backgroundColor: "hsl(var(--accent))",
                            border: "1px solid hsl(var(--border))",
                            color: "hsl(var(--foreground))",
                          }}
                          formatter={(value: number, name: string) => [
                            `${value} encomenda${value !== 1 ? "s" : ""}`,
                            name,
                          ]}
                        />
                        <Bar
                          dataKey="Pendentes"
                          stackId="status"
                          fill="rgb(202 138 4)"
                          name="Pendentes"
                        />
                        <Bar
                          dataKey="Produção"
                          stackId="status"
                          fill="rgb(147 51 234)"
                          name="Em Produção"
                        />
                        <Bar
                          dataKey="Concluídas"
                          stackId="status"
                          fill="rgb(30 64 175)"
                          name="Concluídas"
                        />
                        <Bar
                          dataKey="Entregues"
                          stackId="status"
                          fill="rgb(22 163 74)"
                          name="Entregues"
                        />
                        <Bar
                          dataKey="Canceladas"
                          stackId="status"
                          fill="rgb(82 82 91)"
                          name="Canceladas"
                        />
                        <Bar
                          dataKey="Atrasadas"
                          stackId="status"
                          fill="rgb(153 27 27)"
                          name="Atrasadas"
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                          formatter={(value) => (
                            <span className="text-sm">{value}</span>
                          )}
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
                            contentStyle={{
                              backgroundColor: "hsl(var(--accent))",
                              border: "1px solid hsl(var(--border))",
                              color: "hsl(var(--foreground))",
                            }}
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
