import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Clock,
  FileText,
  Loader2,
  Pencil,
  Printer,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LoadingState } from "@/components/ui/loading-state";
import {
  cn,
  formatDate,
  parseDate,
  getOrderCode,
  usePrint,
  getStatusDisplay,
} from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SubscriptionGate } from "../subscription/SubscriptionGate";
import { SettingsGate } from "../settings/SettingsGate";
import { useTenantStorage } from "@/storage/tenant";
import { Order } from "@/lib/types";

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
  const { isLoading } = useWorkspaceContext();
  const {tenant } = useTenantStorage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState<boolean | undefined>(
    undefined,
  );
  const channelRef = useRef<any>(null);
  const navigate = useNavigate();

  // const setupRealtimeSubscription = async () => {
  //   if (!tenant) return;

  //   // Cleanup existing subscription if any
  //   if (channelRef.current) {
  //     channelRef.current.unsubscribe();
  //   }

  //   // Reset connection state
  //   setIsConnected(undefined);

  //   try {
  //     // Set auth for Realtime
  //     await supabase.realtime.setAuth();

  //     // Create new subscription
  //     const channel = supabase
  //       .channel(`orders:${tenant.id}`, {
  //         config: { private: true },
  //       })
  //       .on("broadcast", { event: "INSERT" }, (payload) => {
  //         if (payload.payload?.record) {
  //           setOrders((currentOrders) => [
  //             ...currentOrders,
  //             payload.payload.record,
  //           ]);
  //         }
  //       })
  //       .on("broadcast", { event: "UPDATE" }, (payload) => {
  //         if (payload.payload?.record) {
  //           setOrders((currentOrders) => {
  //             const updatedOrders = [...currentOrders];
  //             const orderIndex = updatedOrders.findIndex(
  //               (o) => o.id === payload.payload.record.id,
  //             );
  //             if (orderIndex >= 0) {
  //               updatedOrders[orderIndex] = payload.payload.record;
  //             }
  //             return updatedOrders;
  //           });
  //         }
  //       })
  //       .on("broadcast", { event: "DELETE" }, (payload) => {
  //         if (payload.payload?.old_record?.id) {
  //           setOrders((currentOrders) =>
  //             currentOrders.filter(
  //               (order) => order.id !== payload.payload.old_record.id,
  //             ),
  //           );
  //         }
  //       })
  //       .subscribe((status) => {
  //         const wasConnected = isConnected;
  //         setIsConnected(status === "SUBSCRIBED");

  //         // Só mostra o toast se já estava conectado e perdeu a conexão
  //         if (wasConnected && status === "CLOSED") {
  //           toast({
  //             title: "Conexão perdida",
  //             description: "Não é possível receber atualizações em tempo real",
  //             variant: "destructive",
  //           });
  //         } else if (status === "SUBSCRIBED" && !wasConnected) {
  //           // Só mostra o toast de conexão estabelecida se não estava conectado antes
  //           toast({
  //             title: "Conexão estabelecida",
  //             description: "Recebendo atualizações em tempo real",
  //           });
  //         }
  //       });

  //     channelRef.current = channel;
  //   } catch (error) {
  //     console.error("Error setting up realtime subscription:", error);
  //     setIsConnected(false);
  //   }
  // };

  useEffect(() => {
    if (!isLoading && tenant) {
      fetchOrders();
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [isLoading, tenant]);

  const handleReconnect = async () => {
  };

  const fetchOrders = async () => {
    // try {
    //   const { data, error } = await supabaseService.orders.getTenantOrders(
    //     tenant.id,
    //   );
    //   if (error) throw error;
    //   setOrders(
    //     (data || []).map((order) => ({
    //       ...order,
    //       status: order.status as "pending" | "production" | "done",
    //     })),
    //   );
    // } catch (error: any) {
    //   toast({
    //     title: "Erro ao carregar encomendas",
    //     description: error.message,
    //     variant: "destructive",
    //   });
    // } finally {
    //   setLoading(false);
    // }
  };

  const pendingOrders = orders
    .filter(
      (order) => order.status === "pending" || order.status === "production",
    )
    .sort((a, b) => {
      // Primeiro, ordena por status (production vem antes de pending)
      if (a.status === "production" && b.status !== "production") return -1;
      if (a.status !== "production" && b.status === "production") return 1;

      // Se o status for igual, ordena por data de entrega
      return parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime();
    });

  const completedOrders = orders
    .filter((order) => order.status === "done")
    .sort(
      (a, b) =>
        parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime(),
    );

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
    const isOverdue = new Date(order.dueDate) < new Date();
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
            <SubscriptionGate blockMode="disable">
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
                      : "Finalizar"}
                </Button>
              </SettingsGate>
            </SubscriptionGate>
            <SubscriptionGate blockMode="disable">
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
            </SubscriptionGate>
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
              <SubscriptionGate blockMode="disable">
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
                        : "Finalizar"}
                  </Button>
                </SettingsGate>
              </SubscriptionGate>
              <SubscriptionGate blockMode="disable">
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
              </SubscriptionGate>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  const handleChangeOrderStatus = async (id: string, status: string) => {
    // try {
    //   const order = orders.find((o) => o.id === id);
    //   if (!order) return;

    //   const newStatus = status === "pending" ? "production" : "done";

    //   const { error } = await supabaseService.orders.updateOrderStatus(
    //     id,
    //     newStatus,
    //   );
    //   if (error) throw error;

    //   // Atualiza o estado local
    //   setOrders(
    //     orders.map((order) =>
    //       order.id === id ? { ...order, status: newStatus } : order,
    //     ),
    //   );

    //   toast({
    //     title: "Status atualizado",
    //     description: "O status da encomenda foi atualizado com sucesso.",
    //   });
    // } catch (error: any) {
    //   console.error("Error updating order status:", error);
    //   toast({
    //     title: "Erro ao atualizar status",
    //     description: error.message,
    //     variant: "destructive",
    //   });
    // }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando encomendas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Painel de Produção
        </h2>
        <p className="text-muted-foreground">
          Acompanhe suas encomendas pendentes e concluídas em tempo real
        </p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Encomendas</CardTitle>
          </div>
          <ConnectionStatus
            isConnected={isConnected}
            onReconnect={handleReconnect}
          />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pendentes
                {pendingOrders.length > 0 && (
                  <Badge className="ml-2">{pendingOrders.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Concluídas
                {completedOrders.length > 0 && (
                  <Badge className="ml-2">{completedOrders.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <LoadingState
                loading={loading}
                empty={!pendingOrders.length}
                emptyText="Nenhuma encomenda pendente"
                emptyIcon={
                  <FileText className="h-12 w-12 text-muted-foreground" />
                }
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
            </TabsContent>

            <TabsContent value="completed">
              <LoadingState
                loading={loading}
                empty={!completedOrders.length}
                emptyText="Nenhuma encomenda concluída"
                emptyIcon={
                  <FileText className="h-12 w-12 text-muted-foreground" />
                }
              >
                <div className="space-y-4">
                  {completedOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </LoadingState>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
}

export default ProductionView;
