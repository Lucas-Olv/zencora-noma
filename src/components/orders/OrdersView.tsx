import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Eye,
  Plus,
  Search,
  X,
  Loader2,
  Package,
  Pencil,
  Printer,
  StretchVertical,
  CheckIcon,
} from "lucide-react";
import {
  formatDate,
  usePrint,
  getOrderCode,
  getStatusDisplay,
  cn,
} from "@/lib/utils";
import OrderDialog from "./OrderDialog";
import { useTenantStorage } from "@/storage/tenant";
import { Order } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getNomaApi, patchNomaApi } from "@/lib/apiHelpers";
import { useSettingsStorage } from "@/storage/settings";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import dayjs from "@/lib/dayjs";
import { useAnalytics } from "@/contexts/AnalyticsProviderContext";

const OrdersView = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [dialogOrderId, setDialogOrderId] = useState<string | undefined>();
  const printRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettingsStorage();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();

  const {
    mutate: updateOrder,
    error: updateOrderError,
    data: updateOrderData,
    isPending: isUpdatingOrder,
    error: isUpdatingOrderError,
  } = useMutation({
    mutationFn: ({
      orderId,
      orderStatus,
    }: {
      orderId: string;
      orderStatus: string;
    }) =>
      patchNomaApi(
        `/api/noma/v1/orders/update`,
        {
          tenantId: tenant?.id,
          orderData: { id: orderId, status: orderStatus },
        },
        {
          params: { orderId: orderId },
        },
      ),
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
      console.log(error);
    },
  });
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: () =>
      getNomaApi(`/api/noma/v1/orders/tenant`, {
        params: { tenantId: tenant?.id },
      }),
  });
  const handlePrint = usePrint(printRef, {
    pageStyle: `
      @page {
        size: 100mm 150mm;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `,
  });
  const { tenant } = useTenantStorage();

  const OrderLabel = ({ order }: { order: Order }) => {
    const isOverdue = dayjs(order.dueDate).isBefore(dayjs());
    const status =
      isOverdue && order.status === "pending" ? "overdue" : order.status;
    const statusDisplay = getStatusDisplay(status, order.dueDate);

    return (
      <div className="w-[100mm] h-[150mm] bg-white text-black p-6">
        <div className="border border-gray-300 rounded-xl shadow-sm h-full flex flex-col justify-between p-6 space-y-4">
          <div className="text-center py-4">
            <p className="text-[10px] uppercase font-medium text-zinc-400 tracking-wide">
              Código
            </p>
            <h1 className="font-mono text-2xl font-bold tracking-widest text-zinc-800">
              {getOrderCode(order.id)}
            </h1>
          </div>

          <div className="flex-1 flex flex-col gap-4 text-zinc-800">
            <div className="grid grid-cols-2 gap-4">
              <LabelItem title="Cliente" content={order.clientName} />
              <LabelItem title="Entrega" content={formatDate(order.dueDate)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <LabelItem
                title="Valor"
                content={`R$ ${order.price.replace(".", ",")}`}
              />
              <LabelItem title="Status" content={statusDisplay.label} />
            </div>

            <LabelItem
              title="Descrição"
              content={order.description || "Sem descrição"}
            />
          </div>

          <div className="text-center text-[10px] text-zinc-400 border-t pt-2">
            <p>Gerado em {dayjs().format("DD/MM/YYYY [às] HH:mm")}</p>
            <p className="mt-0.5">Por Zencora Noma</p>
          </div>
        </div>
      </div>
    );
  };

  const LabelItem = ({
    title,
    content,
  }: {
    title: string;
    content: React.ReactNode;
  }) => (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase font-medium text-zinc-400 tracking-wide">
        {title}
      </span>
      <span className="text-sm leading-tight break-words">{content}</span>
    </div>
  );

  useEffect(() => {
    document.title = "Encomendas | Zencora Noma";
    if (ordersData) {
      const fetchedOrders = ordersData.data as Order[];
      setOrders(fetchedOrders);
    }
  }, [ordersData, isOrdersLoading]);

  const handleStatusChange = async (
    id: string,
    targetStatus: "pending" | "production" | "done" | "canceled",
  ) => {
    updateOrder(
      {
        orderId: id,
        orderStatus: targetStatus,
      },
      {
        onSuccess: () => {
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === id ? { ...order, status: targetStatus } : order,
            ),
          );
          if (targetStatus === "canceled") {
            trackEvent("order_canceled");
          } else {
            trackEvent("order_status_updated", {
              status: targetStatus,
            });
          }
        },
      },
    );
  };

  const handleNewOrder = () => {
    setDialogMode("create");
    setDialogOrderId(undefined);
    setDialogOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setDialogMode("edit");
    setDialogOrderId(order.id);
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleListUpdate = async (updatedOrder: Order) => {
    refetch();
  };

  const handleOpenCancelDialog = (orderId: string) => {
    setCancelOrderId(orderId);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (cancelOrderId) {
      handleStatusChange(cancelOrderId, "canceled");
    }
    setCancelDialogOpen(false);
    setCancelOrderId(null);
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setCancelOrderId(null);
  };

  const filteredOrders =
    searchTerm.trim() === ""
      ? orders
      : orders.filter(
          (order) =>
            getOrderCode(order.id)
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.description &&
              order.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase())),
        );

  const inProgressOrders = filteredOrders.filter(
    (order) =>
      order.status === "pending" ||
      order.status === "production" ||
      order.status === "done",
  );
  const finishedOrders = filteredOrders.filter(
    (order) => order.status === "canceled" || order.status === "delivered",
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Encomendas</h2>
          <p className="text-muted-foreground">
            Gerencie todas as suas encomendas aqui.
          </p>
        </div>

        <Button onClick={handleNewOrder} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Nova Encomenda
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar encomendas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="inprogress" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="inprogress">Em progresso</TabsTrigger>
              <TabsTrigger value="finished">Finalizadas</TabsTrigger>
            </TabsList>
            <TabsContent value="inprogress">
              {isOrdersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : inProgressOrders.length === 0 ? (
                <div className="text-center py-6">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Nenhuma encomenda em progresso
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Nenhuma encomenda nos estados pendente, produção ou
                    concluída.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Data de Entrega</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Estado do Pagamento</TableHead>
                          <TableHead>Método de Pagamento</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inProgressOrders.map((order) => {
                          const isOverdue = dayjs(order.dueDate).isBefore(
                            dayjs(),
                          );
                          const status =
                            isOverdue && order.status === "pending"
                              ? "overdue"
                              : order.status;
                          return (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-sm text-muted-foreground">
                                {getOrderCode(order.id)}
                              </TableCell>
                              <TableCell className="font-medium truncate max-w-[10dvw]">
                                {order.clientName}
                              </TableCell>
                              <TableCell>{formatDate(order.dueDate)}</TableCell>
                              <TableCell>
                                R$ {order.price.replace(".", ",")}
                              </TableCell>
                              <TableCell className="w-[6dvw]">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "w-fit",
                                    status === "overdue" &&
                                      "bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50",
                                    status === "pending" &&
                                      "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
                                    status === "production" &&
                                      "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50",
                                    status === "done" &&
                                      "bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50",
                                  )}
                                >
                                  {status === "overdue" && "Atrasado"}
                                  {status === "pending" && "Pendente"}
                                  {status === "production" && "Produção"}
                                  {status === "done" && "Concluído"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "w-fit",
                                    order.paymentStatus === "pending" &&
                                      "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
                                    order.paymentStatus === "partially_paid" &&
                                      "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50",
                                    order.paymentStatus === "paid" &&
                                      "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50",
                                  )}
                                >
                                  {order.paymentStatus === "pending" &&
                                    "Pagamento Pendente"}
                                  {order.paymentStatus === "paid" &&
                                    "Pagamento Efetuado"}
                                  {order.paymentStatus === "partially_paid" &&
                                    "Parcialmente Pago"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {order.paymentMethod === "credit_card" &&
                                  "Cartão de Crédito"}
                                {order.paymentMethod === "debit_card" &&
                                  "Cartão de Débito"}
                                {order.paymentMethod === "pix" && "Pix"}
                                {order.paymentMethod === "cash" && "Dinheiro"}
                                {!order.paymentMethod && "Não informado"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleStatusChange(order.id, "pending")
                                    }
                                    title="Marcar como pendente"
                                    disabled={order.status === "pending"}
                                    className="flex items-center justify-center"
                                  >
                                    <StretchVertical className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleStatusChange(order.id, "production")
                                    }
                                    title="Marcar como Produção"
                                    disabled={order.status === "production"}
                                    className="flex items-center justify-center"
                                  >
                                    <Package className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleStatusChange(order.id, "done")
                                    }
                                    title="Marcar como concluída"
                                    disabled={order.status === "done"}
                                    className="flex items-center justify-center"
                                  >
                                    <CheckIcon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditOrder(order)}
                                    title="Editar encomenda"
                                    disabled={dayjs(order.dueDate).isBefore(
                                      dayjs(),
                                    )}
                                    className="flex items-center justify-center"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleOpenCancelDialog(order.id)
                                    }
                                    title="Marcar como cancelado"
                                    disabled={order.status === "canceled"}
                                    className="flex items-center justify-center"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      navigate(`/orders/${order.id}`)
                                    }
                                    title="Ver detalhes"
                                    className="flex items-center justify-center"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setTimeout(handlePrint, 100);
                                    }}
                                    title="Imprimir"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {inProgressOrders.map((order) => {
                      const isOverdue = dayjs(order.dueDate).isBefore(dayjs());
                      const status =
                        isOverdue && order.status === "pending"
                          ? "overdue"
                          : order.status;
                      return (
                        <Card key={order.id}>
                          <CardContent className="p-4 relative">
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-sm text-muted-foreground">
                                  {getOrderCode(order.id)}
                                </p>
                                <h3 className="font-medium truncate max-w-[32dvw]">
                                  {order.clientName}
                                </h3>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(order.dueDate)}
                              </p>
                              <div className="flex flex-col mt-1 text-xs text-muted-foreground gap-0.5">
                                <span>
                                  <strong>Pagamento:</strong>{" "}
                                  {order.paymentStatus === "pending" &&
                                    "Pagamento Pendente"}
                                  {order.paymentStatus === "paid" &&
                                    "Pagamento Efetuado"}
                                  {order.paymentStatus === "partially_paid" &&
                                    "Parcialmente Pago"}
                                </span>
                                <span>
                                  <strong>Método:</strong>{" "}
                                  {order.paymentMethod === "credit_card" &&
                                    "Cartão de Crédito"}
                                  {order.paymentMethod === "debit_card" &&
                                    "Cartão de Débito"}
                                  {order.paymentMethod === "pix" && "Pix"}
                                  {order.paymentMethod === "cash" && "Dinheiro"}
                                  {!order.paymentMethod && "Não informado"}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "w-fit absolute top-4 right-4 z-10",
                                  status === "overdue" &&
                                    "bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50",
                                  status === "pending" &&
                                    "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
                                  status === "production" &&
                                    "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50",
                                  status === "done" &&
                                    "bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50",
                                )}
                              >
                                {status === "overdue" && "Atrasado"}
                                {status === "pending" && "Pendente"}
                                {status === "production" && "Produção"}
                                {status === "done" && "Concluído"}
                              </Badge>
                              <div className="flex items-center justify-between mt-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleStatusChange(order.id, "pending")
                                  }
                                  title="Marcar como pendente"
                                  className="h-6 w-6"
                                  disabled={order.status === "pending"}
                                >
                                  <StretchVertical />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleStatusChange(order.id, "production")
                                  }
                                  title="Marcar como Produção"
                                  className="h-6 w-6"
                                  disabled={order.status === "production"}
                                >
                                  <Package />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleStatusChange(order.id, "done")
                                  }
                                  title="Marcar como concluída"
                                  disabled={order.status === "done"}
                                  className="h-6 w-6"
                                >
                                  <CheckIcon />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditOrder(order)}
                                  disabled={dayjs(order.dueDate).isBefore(
                                    dayjs(),
                                  )}
                                  title="Editar encomenda"
                                  className="h-6 w-6"
                                >
                                  <Pencil />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleOpenCancelDialog(order.id)
                                  }
                                  title="Marcar como cancelado"
                                  disabled={order.status === "canceled"}
                                  className="flex items-center justify-center h-6 w-6"
                                >
                                  <X />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    navigate(`/orders/${order.id}`)
                                  }
                                  title="Ver detalhes"
                                  className="h-6 w-6"
                                >
                                  <Eye />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setTimeout(handlePrint, 100);
                                  }}
                                  title="Imprimir"
                                  className="h-6 w-6"
                                >
                                  <Printer />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="finished">
              {isOrdersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : finishedOrders.length === 0 ? (
                <div className="text-center py-6">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Nenhuma encomenda finalizada
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Nenhuma encomenda nos estados cancelado ou entregue.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Data de Entrega</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Estado do Pagamento</TableHead>
                          <TableHead>Método de Pagamento</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {finishedOrders.map((order) => {
                          const status = order.status;
                          return (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-sm text-muted-foreground">
                                {getOrderCode(order.id)}
                              </TableCell>
                              <TableCell className="font-medium truncate max-w-[10dvw]">
                                {order.clientName}
                              </TableCell>
                              <TableCell>{formatDate(order.dueDate)}</TableCell>
                              <TableCell>
                                R$ {order.price.replace(".", ",")}
                              </TableCell>
                              <TableCell className="w-[6dvw]">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "w-fit",
                                    status === "delivered" &&
                                      "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50",
                                    status === "canceled" &&
                                      "bg-gray-100/80 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-900/50",
                                  )}
                                >
                                  {status === "delivered" && "Entregue"}
                                  {status === "canceled" && "Cancelado"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "w-fit",
                                    order.paymentStatus === "pending" &&
                                      "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
                                    order.paymentStatus === "partially_paid" &&
                                      "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50",
                                    order.paymentStatus === "paid" &&
                                      "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50",
                                  )}
                                >
                                  {order.paymentStatus === "pending" &&
                                    "Pagamento Pendente"}
                                  {order.paymentStatus === "paid" &&
                                    "Pagamento Efetuado"}
                                  {order.paymentStatus === "partially_paid" &&
                                    "Parcialmente Pago"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {order.paymentMethod === "credit_card" &&
                                  "Cartão de Crédito"}
                                {order.paymentMethod === "debit_card" &&
                                  "Cartão de Débito"}
                                {order.paymentMethod === "pix" && "Pix"}
                                {order.paymentMethod === "cash" && "Dinheiro"}
                                {!order.paymentMethod && "Não informado"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      navigate(`/orders/${order.id}`)
                                    }
                                    title="Ver detalhes"
                                    className="flex items-center justify-center"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="md:hidden space-y-4">
                    {finishedOrders.map((order) => {
                      const status = order.status;
                      return (
                        <Card key={order.id}>
                          <CardContent
                            className="p-4 cursor-pointer relative"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-sm text-muted-foreground">
                                  {getOrderCode(order.id)}
                                </p>
                                <h3 className="font-medium truncate max-w-[32dvw]">
                                  {order.clientName}
                                </h3>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(order.dueDate)}
                              </p>
                              <div className="flex flex-col mt-1 text-xs text-muted-foreground gap-0.5">
                                <span>
                                  <strong>Pagamento:</strong>{" "}
                                  {order.paymentStatus === "pending" &&
                                    "Pagamento Pendente"}
                                  {order.paymentStatus === "paid" &&
                                    "Pagamento Efetuado"}
                                  {order.paymentStatus === "partially_paid" &&
                                    "Parcialmente Pago"}
                                </span>
                                <span>
                                  <strong>Método:</strong>{" "}
                                  {order.paymentMethod === "credit_card" &&
                                    "Cartão de Crédito"}
                                  {order.paymentMethod === "debit_card" &&
                                    "Cartão de Débito"}
                                  {order.paymentMethod === "pix" && "Pix"}
                                  {order.paymentMethod === "cash" && "Dinheiro"}
                                  {!order.paymentMethod && "Não informado"}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "w-fit absolute top-4 right-4 z-10",
                                  status === "delivered" &&
                                    "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50",
                                  status === "canceled" &&
                                    "bg-gray-100/80 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-900/50",
                                )}
                              >
                                {status === "delivered" && "Entregue"}
                                {status === "canceled" && "Cancelado"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <OrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        orderId={dialogOrderId}
        orderData={selectedOrder}
        onSuccess={handleListUpdate}
      />

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja cancelar a encomenda?</DialogTitle>
            <DialogDescription>
              Após marcar a encomenda como cancelada{" "}
              <span className="font-bold text-destructive">
                não será mais possível alterá-la
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleCloseCancelDialog}
              className="w-full sm:w-auto"
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              className="w-full sm:w-auto"
            >
              Marcar como cancelado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="hidden">
        {selectedOrder && (
          <div ref={printRef}>
            <OrderLabel order={selectedOrder} />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersView;
