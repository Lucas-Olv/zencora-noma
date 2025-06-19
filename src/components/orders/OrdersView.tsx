import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import {
  formatDate,
  usePrint,
  getOrderCode,
  getStatusDisplay,
  cn,
} from "@/lib/utils";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import OrderDialog from "./OrderDialog";
import { SubscriptionGate } from "../subscription/SubscriptionGate";
import { useTenantStorage } from "@/storage/tenant";
import { Order } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getNomaApi } from "@/lib/apiHelpers";

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
     const {data: ordersData, isLoading: isOrdersLoading, isError: isOrdersError, refetch } = useQuery({
      queryKey: ["orders"],
      queryFn: () => getNomaApi(`/api/noma/v1/orders/tenant`, {params: { tenantId: tenant?.id }}),
    })
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
    const isOverdue = new Date(order.dueDate) < new Date();
    const status =
      isOverdue && order.status === "pending" ? "overdue" : order.status;
    const statusDisplay = getStatusDisplay(status, order.dueDate);

    return (
      <div className="w-[100mm] h-[150mm] bg-white text-black p-6">
        <div className="border border-gray-300 rounded-xl shadow-sm h-full flex flex-col justify-between p-6 space-y-4">
          {/* Bloco do código da encomenda */}
          <div className="text-center py-4">
            <p className="text-[10px] uppercase font-medium text-zinc-400 tracking-wide">
              Código
            </p>
            <h1 className="font-mono text-2xl font-bold tracking-widest text-zinc-800">
              {getOrderCode(order.id)}
            </h1>
          </div>

          {/* Informações principais */}
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

          {/* Rodapé */}
          <div className="text-center text-[10px] text-zinc-400 border-t pt-2">
            <p>
              Gerado em{" "}
              {formatDate(new Date().toISOString(), "dd/MM/yyyy 'às' HH:mm")}
            </p>
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
    if(ordersData) {
      const fetchedOrders = ordersData.data as Order[];
      setOrders(fetchedOrders);
    }
  }, [ordersData, isOrdersLoading]);

  const handleStatusChange = async (
    id: string,
    targetStatus: "pending" | "production" | "done",
  ) => {
    // try {
    //   const { error } = await supabaseService.orders.updateOrderStatus(
    //     id,
    //     targetStatus,
    //   );
    //   if (error) throw error;

    //   setOrders(
    //     orders.map((order) =>
    //       order.id === id ? { ...order, status: targetStatus } : order,
    //     ),
    //   );

    //   toast({
    //     title: "Status atualizado!",
    //     description: `A encomenda foi marcada como ${targetStatus === "pending" ? "pendente" : targetStatus === "production" ? "Produção" : "concluída"}.`,
    //   });
    // } catch (error: any) {
    //   toast({
    //     title: "Erro ao atualizar status",
    //     description: error.message,
    //     variant: "destructive",
    //   });
    // }
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

  const filteredOrders =
    searchTerm.trim() === ""
      ? orders
      : orders.filter(
          (order) =>
            getOrderCode(order.id)
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            order.clientName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (order.description &&
              order.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase())),
        );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Encomendas</h2>
          <p className="text-muted-foreground">
            Gerencie todas as suas encomendas em um só lugar
          </p>
        </div>

        <SubscriptionGate>
          <Button onClick={handleNewOrder} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" /> Nova Encomenda
          </Button>
        </SubscriptionGate>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>Lista de Encomendas</CardTitle>
            <div className="relative w-full sm:w-64">
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
          {isOrdersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-6">
              {searchTerm ? (
                <>
                  <p className="text-muted-foreground">
                    Nenhuma encomenda encontrada para "{searchTerm}"
                  </p>
                  <Button
                    variant="link"
                    onClick={() => setSearchTerm("")}
                    className="mt-2"
                  >
                    Limpar busca
                  </Button>
                </>
              ) : (
                <>
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Nenhuma encomenda
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Comece registrando sua primeira encomenda.
                  </p>
                </>
              )}
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
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const isOverdue = new Date(order.dueDate) < new Date();
                      const status =
                        isOverdue && order.status === "pending"
                          ? "overdue"
                          : order.status;
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {getOrderCode(order.id)}
                          </TableCell>
                          <TableCell className="font-medium truncate max-w-[20dvw]">
                            {order.clientName}
                          </TableCell>
                          <TableCell>{formatDate(order.dueDate)}</TableCell>
                          <TableCell>
                            R$ {order.price.replace(".", ",")}
                          </TableCell>
                          <TableCell>
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
                                  "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50",
                              )}
                            >
                              {status === "overdue" && "Atrasado"}
                              {status === "pending" && "Pendente"}
                              {status === "production" && "Produção"}
                              {status === "done" && "Concluído"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <SubscriptionGate blockMode="disable">
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
                                  <X className="h-4 w-4" />
                                </Button>
                              </SubscriptionGate>
                              <SubscriptionGate blockMode="disable">
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
                              </SubscriptionGate>
                              <SubscriptionGate blockMode="disable">
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
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              </SubscriptionGate>
                              <SubscriptionGate blockMode="disable">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditOrder(order)}
                                  title="Editar encomenda"
                                  className="flex items-center justify-center"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </SubscriptionGate>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/orders/${order.id}`)}
                                title="Ver detalhes"
                                className="flex items-center justify-center"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <SubscriptionGate blockMode="disable">
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
                              </SubscriptionGate>
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
                {filteredOrders.map((order) => {
                  const isOverdue = new Date(order.dueDate) < new Date();
                  const status =
                    isOverdue && order.status === "pending"
                      ? "overdue"
                      : order.status;
                  return (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-sm text-muted-foreground">
                                  {getOrderCode(order.id)}
                                </p>
                                <h3 className="font-medium truncate max-w-[40dvw]">
                                  {order.dueDate}
                                </h3>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(order.dueDate)}
                              </p>
                            </div>
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
                                  "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50",
                              )}
                            >
                              {status === "overdue" && "Atrasado"}
                              {status === "pending" && "Pendente"}
                              {status === "production" && "Produção"}
                              {status === "done" && "Concluído"}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <SubscriptionGate blockMode="disable">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleStatusChange(order.id, "pending")
                                }
                                title="Marcar como pendente"
                                disabled={order.status === "pending"}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </SubscriptionGate>
                            <SubscriptionGate blockMode="disable">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleStatusChange(order.id, "production")
                                }
                                title="Marcar como Produção"
                                disabled={order.status === "production"}
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                            </SubscriptionGate>
                            <SubscriptionGate blockMode="disable">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleStatusChange(order.id, "done")
                                }
                                title="Marcar como concluída"
                                disabled={order.status === "done"}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            </SubscriptionGate>
                            <SubscriptionGate blockMode="disable">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditOrder(order)}
                                title="Editar encomenda"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </SubscriptionGate>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/orders/${order.id}`)}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <SubscriptionGate blockMode="disable">
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
                            </SubscriptionGate>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
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

      {/* Hidden print content */}
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
