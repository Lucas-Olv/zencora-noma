import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Search, X, Loader2, Package } from "lucide-react";
import {
  formatDate,
  usePrint,
  getOrderCode,
  getStatusDisplay,
  cn,
} from "@/lib/utils";
import OrderDialog from "../orders/OrderDialog";
import { useTenantStorage } from "@/storage/tenant";
import { Order } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getNomaApi, patchNomaApi } from "@/lib/apiHelpers";
import { useSettingsStorage } from "@/storage/settings";
import { DeliveryDialog } from "./DeliveryDialog";
import { useAnalytics } from "@/contexts/AnalyticsProviderContext";

const DeliveryView = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [dialogOrderId, setDialogOrderId] = useState<string | undefined>();
  const printRef = useRef<HTMLDivElement>(null);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [deliveryOrder, setDeliveryOrder] = useState<Order | null>(null);
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

  // Mutation para marcar como entregue
  const { mutate: deliverOrder, isPending: isDeliveringOrder } = useMutation({
    mutationFn: ({
      orderId,
      price,
      paymentStatus,
    }: {
      orderId: string;
      price: string;
      paymentStatus: string;
    }) =>
      patchNomaApi(
        "/api/noma/v1/orders/update",
        {
          tenantId: tenant?.id,
          orderData: {
            id: orderId,
            status: "delivered",
            amountPaid: price,
            paymentStatus,
          },
        },
        {
          params: { orderId },
        },
      ),
    onSuccess: () => {
      setDeliveryDialogOpen(false);
      setDeliveryOrder(null);
      refetch();
      trackEvent("order_delivered", {
        price: deliveryOrder?.price,
        payment_status: deliveryOrder?.paymentStatus,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao marcar como entregue",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
    if (ordersData) {
      const fetchedOrders = ordersData.data as Order[];
      setOrders(fetchedOrders);
    }
  }, [ordersData, isOrdersLoading]);

  const handleListUpdate = async (updatedOrder: Order) => {
    refetch();
  };

  // Filtrar apenas encomendas marcadas como 'done' e aplicar busca
  const doneOrders = orders.filter((order) => order.status === "done");
  const filteredOrders =
    searchTerm.trim() === ""
      ? doneOrders
      : doneOrders.filter(
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Entregas</h2>
          <p className="text-muted-foreground">
            Gerencie suas encomendas prontas para entrega.
          </p>
        </div>
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
                    Nenhuma encomenda pronta para entrega encontrada
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
                      <TableHead>Quantia Paga</TableHead>
                      <TableHead>Estado do Pagamento</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
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
                          <TableCell>
                            {order.amountPaid
                              ? `R$ ${parseFloat(order.amountPaid).toFixed(2).replace(".", ",")}`
                              : "-"}
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
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setDeliveryOrder(order);
                                  setDeliveryDialogOpen(true);
                                }}
                                title="Iniciar entrega"
                              >
                                Iniciar Entrega
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
                {filteredOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">
                            {getOrderCode(order.id)}
                          </span>
                          <span className="font-medium truncate max-w-[55dvw]">
                            {order.clientName}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(order.dueDate)}
                        </span>
                        <span className="text-sm">
                          <strong>Preço:</strong> R${" "}
                          {order.price.replace(".", ",")}
                        </span>
                        <span className="text-sm">
                          <strong>Quantia Paga:</strong>{" "}
                          {order.amountPaid
                            ? `R$ ${parseFloat(order.amountPaid).toFixed(2).replace(".", ",")}`
                            : "-"}
                        </span>
                        <span className="text-sm">
                          <strong>Pagamento:</strong>{" "}
                          {order.paymentStatus === "pending" &&
                            "Pagamento Pendente"}
                          {order.paymentStatus === "paid" &&
                            "Pagamento Efetuado"}
                          {order.paymentStatus === "partially_paid" &&
                            "Parcialmente Pago"}
                        </span>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setDeliveryOrder(order);
                            setDeliveryDialogOpen(true);
                          }}
                          title="Iniciar entrega"
                        >
                          Iniciar Entrega
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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

      {/* Delivery Dialog */}
      {deliveryOrder && (
        <DeliveryDialog
          open={deliveryDialogOpen}
          onOpenChange={(open) => {
            setDeliveryDialogOpen(open);
            if (!open) setDeliveryOrder(null);
          }}
          order={deliveryOrder}
          isLoading={isDeliveringOrder}
          onClosed={() => {
            setDeliveryDialogOpen(false);
          }}
          onDelivered={() =>
            deliverOrder({
              orderId: deliveryOrder.id,
              price: deliveryOrder.price,
              paymentStatus: "paid",
            })
          }
        />
      )}

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

export default DeliveryView;
