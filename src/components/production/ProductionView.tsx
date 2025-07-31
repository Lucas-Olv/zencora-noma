import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { io, Socket } from "socket.io-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Printer, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/ui/loading-state";
import {
  cn,
  formatDate,
  getOrderCode,
  usePrint,
  getStatusDisplay,
} from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SettingsGate } from "../settings/SettingsGate";
import { useTenantStorage } from "@/storage/tenant";
import { Order } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getNomaApi, patchNomaApi } from "@/lib/apiHelpers";
import { useSessionStorage } from "@/storage/session";
import ProductionViewSkeleton from "./ProductionViewSkeleton";
import { useAnalytics } from "@/contexts/AnalyticsProviderContext";
import dayjs from "@/lib/dayjs";

function ConnectionStatus({
  isConnected,
  onReconnect,
}: {
  isConnected: boolean | undefined;
  onReconnect: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {isConnected === false && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReconnect}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reconectar
        </Button>
      )}
      <div className="flex items-center gap-2">
        {isConnected === undefined && (
          <span className="text-xs text-muted-foreground">Conectando...</span>
        )}
        <div className="relative">
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              isConnected === undefined && "bg-gray-400",
              isConnected === true && "bg-green-500 animate-pulse",
              isConnected === false && "bg-red-500",
            )}
          />
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              isConnected === undefined && "bg-gray-400",
              isConnected === true && "bg-green-500",
              isConnected === false && "bg-red-500",
              isConnected && "opacity-50 animate-ping",
            )}
          />
        </div>
      </div>
    </div>
  );
}

export function ProductionView() {
  const { toast } = useToast();
  const { tenant } = useTenantStorage();
  const { session } = useSessionStorage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isConnected, setIsConnected] = useState<boolean | undefined>(
    undefined,
  );
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();

  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    refetch,
  } = useQuery({
    queryKey: ["productionOrders", tenant?.id],
    queryFn: () =>
      getNomaApi(`/api/noma/v1/orders/tenant`, {
        params: { tenantId: tenant?.id },
      }),
  });

  const {
    mutate: updateOrder,
    error: updateOrderError,
    data: updateOrderData,
    isPending: isUpdatingOrder,
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
        title: "Erro ao atualizar encomenda",
        description:
          "ocorreu um erro ao atualizar a encomenda. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
      console.log(error);
    },
  });

  useEffect(() => {
    if (ordersData) {
      setOrders(
        (ordersData.data || []).map((order: Order) => ({
          ...order,
          status: order.status as "pending" | "production" | "done",
        })),
      );
    }
  }, [ordersData]);

  // Realtime socket.io
  useEffect(() => {
    if (!session.token || !tenant?.id) return;

    console.log("[SocketIO] Tentando conectar...");
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(import.meta.env.VITE_ZENCORA_NOMA_API_URL, {
      auth: { token: session.token, tenantId: tenant.id },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[SocketIO] Conectado!");
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("[SocketIO] Desconectado! Motivo:", reason);
      setIsConnected(false);
      if (reason !== "io client disconnect") {
        toast({
          title: "Conexão perdida",
          description: "Não é possível receber atualizações em tempo real",
          variant: "destructive",
        });
      }
    });

    socket.on("connect_error", (err) => {
      console.error("[SocketIO] Erro de conexão:", err);
      setIsConnected(false);
      toast({
        title: "Erro ao conectar",
        description: err.message || "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    });

    socket.on("order_created", (order) => {
      console.log("[SocketIO] Pedido criado:", order);
      setOrders((current) => [...current, order]);
    });

    socket.on("order_updated", (order) => {
      console.log("[SocketIO] Pedido atualizado:", order);
      setOrders((current) => {
        const updated = [...current];
        const index = updated.findIndex((o) => o.id === order.id);
        if (index >= 0) updated[index] = order;
        return updated;
      });
    });

    socket.on("order_deleted", ({ id }) => {
      console.log("[SocketIO] Pedido deletado:", id);
      setOrders((current) => current.filter((o) => o.id !== id));
    });

    return () => {
      console.log("[SocketIO] Desconectando socket...");
      socket.disconnect();
    };
  }, [session.token, tenant.id]);

  const handleReconnect = () => {
    if (socketRef.current) {
      console.log("[SocketIO] Forçando reconexão...");
      socketRef.current.connect();
    } else {
      setIsConnected(undefined);
    }
  };

  const pendingOrders = orders
    .filter(
      (order) => order.status === "pending" || order.status === "production",
    )
    .sort((a, b) => {
      if (a.status === "production" && b.status !== "production") return -1;
      if (a.status !== "production" && b.status === "production") return 1;
      return dayjs(a.dueDate).diff(dayjs(b.dueDate));
    });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
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

  const isMobile = useMediaQuery("(max-width: 640px)");

  const OrderCard = ({ order }: { order: Order }) => {
    const isOverdue = dayjs(order.dueDate).isBefore(dayjs());
    const status =
      isOverdue && order.status === "pending" ? "overdue" : order.status;

    if (isMobile) {
      return (
        <div
          className="grid grid-cols-1 gap-4 rounded-lg border p-4 hover:bg-accent/50 cursor-pointer transition-colors"
          onClick={() => navigate(`/orders/${order.id}`)}
        >
          <div className="grid grid-cols-[minmax(0,1fr),auto] gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-muted-foreground shrink-0">
                  {getOrderCode(order.id)}
                </p>
                <h3 className="font-semibold truncate">{order.clientName}</h3>
              </div>
              <div className="mt-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {order.description}
                </p>
              </div>
              <div className="mt-2">
                <span className="text-sm text-muted-foreground">
                  Entrega:{" "}
                  <span className="font-semibold">
                    {order.dueDate ? formatDate(order.dueDate) : "Sem data"}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
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
          </div>
          <div className="flex items-center gap-2">
            <SettingsGate permission="edit">
              <Button
                variant={order.status === "pending" ? "outline" : "default"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChangeOrderStatus(order.id, order.status);
                }}
                className="flex-1"
                disabled={order.status === "done"}
              >
                {order.status === "pending"
                  ? "Iniciar Produção"
                  : order.status === "done"
                    ? "Concluído"
                    : "Finalizar Produção"}
              </Button>
            </SettingsGate>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOrder(order);
                setTimeout(handlePrint, 100);
              }}
              title="Imprimir"
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-4 rounded-lg border p-4 hover:bg-accent/50 cursor-pointer transition-colors"
        onClick={() => navigate(`/orders/${order.id}`)}
      >
        <div className="grid grid-cols-[minmax(0,1fr),auto] gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-muted-foreground shrink-0">
                {getOrderCode(order.id)}
              </p>
              <h3 className="font-semibold truncate">{order.clientName}</h3>
            </div>
            <div className="mt-1">
              <p className="text-sm text-muted-foreground">
                {order.description}
              </p>
            </div>
            <div className="mt-2">
              <span className="text-sm text-muted-foreground">
                Entrega:{" "}
                <span className="font-semibold">
                  {order.dueDate ? formatDate(order.dueDate) : "Sem data"}
                </span>
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end justify-between gap-2">
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
            <div className="flex items-center gap-2">
              <SettingsGate permission="edit">
                <Button
                  variant={order.status === "pending" ? "outline" : "default"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeOrderStatus(order.id, order.status);
                  }}
                  className="flex-1 sm:flex-none"
                  disabled={order.status === "done"}
                >
                  {order.status === "pending"
                    ? "Iniciar Produção"
                    : order.status === "done"
                      ? "Concluído"
                      : "Finalizar Produção"}
                </Button>
              </SettingsGate>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOrder(order);
                  setTimeout(handlePrint, 100);
                }}
                title="Imprimir"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  const handleChangeOrderStatus = async (id: string, status: string) => {
    updateOrder(
      {
        orderId: id,
        orderStatus: status === "pending" ? "production" : "done",
      },
      {
        onSuccess: () => {
          trackEvent("order_status_updated", {
            status: status === "pending" ? "production" : "done",
          });
        },
      },
    );
  };

  if (isOrdersLoading) {
    return <ProductionViewSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Produção</h2>
        <p className="text-muted-foreground">
          Acompanhe suas encomendas pendentes em tempo real.
        </p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-end">
          <ConnectionStatus
            isConnected={isConnected}
            onReconnect={handleReconnect}
          />
        </CardHeader>
        <CardContent>
          <LoadingState
            loading={isOrdersLoading}
            empty={!pendingOrders.length}
            emptyText="Nenhuma encomenda pendente"
            emptyIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
          >
            <div className="space-y-4">
              {pendingOrders.map((order) => {
                const statusDisplay = getStatusDisplay(
                  order.status,
                  order.dueDate,
                );
                return <OrderCard key={order.id} order={order} />;
              })}
            </div>
          </LoadingState>
        </CardContent>
      </Card>

      <div className="hidden">
        {selectedOrder && (
          <div ref={printRef}>
            <OrderLabel order={selectedOrder} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductionView;
