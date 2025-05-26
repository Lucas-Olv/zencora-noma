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
import { Check, Clock, FileText, Loader2, Pencil, Printer } from "lucide-react";
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
import { useAuthContext } from "@/contexts/AuthContext";
import { supabaseService, OrderType } from "@/services/supabaseService";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SubscriptionGate } from "../subscription/SubscriptionGate";

export function ProductionView() {
  const { toast } = useToast();
  const { tenant, loading: tenantLoading, error: tenantError } = useAuthContext();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!tenantLoading && tenant) {
      fetchOrders();
    }
  }, [tenantLoading, tenant]);

  const fetchOrders = async () => {
    try {
      if (tenantError || !tenant) {
        throw new Error(tenantError || "Tenant não encontrado");
      }

      const { data, error } = await supabaseService.orders.getTenantOrders(
        tenant.id,
      );
      if (error) throw error;
      setOrders(
        (data || []).map((order) => ({
          ...order,
          status: order.status as "pending" | "production" | "done",
        })),
      );
    } catch (error: any) {
      toast({
        title: "Erro ao carregar encomendas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
      return parseDate(a.due_date).getTime() - parseDate(b.due_date).getTime();
    });

  const completedOrders = orders
    .filter((order) => order.status === "done")
    .sort(
      (a, b) =>
        parseDate(a.due_date).getTime() - parseDate(b.due_date).getTime(),
    );

  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
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

  const OrderCard = ({ order }: { order: OrderType }) => {
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
                <h3 className="font-semibold truncate">{order.client_name}</h3>
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
                    {order.due_date ? formatDate(order.due_date) : "Sem data"}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "w-fit",
                  order.status === "pending" &&
                    "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
                  order.status === "production" &&
                    "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50",
                )}
              >
                {order.status === "production" ? "Produção" : "Pendente"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SubscriptionGate blockMode="disable">
            <Button
              variant={order.status === "pending" ? "outline" : "default"}
              size="sm"
              onClick={() => handleChangeOrderStatus(order.id, order.status)}
              className="flex-1"
            >
              {order.status === "pending" ? "Iniciar Produção" : "Finalizar"}
              </Button>
            </SubscriptionGate>
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
              <h3 className="font-semibold truncate">{order.client_name}</h3>
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
                  {order.due_date ? formatDate(order.due_date) : "Sem data"}
                </span>
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end justify-between gap-2">
            <Badge
              variant="outline"
              className={cn(
                "w-fit",
                order.status === "pending" &&
                  "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
                order.status === "production" &&
                  "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50",
              )}
            >
              {order.status === "production" ? "Produção" : "Pendente"}
            </Badge>
            <div className="flex items-center gap-2">
              <SubscriptionGate blockMode="disable">
                <Button
                  variant={order.status === "pending" ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleChangeOrderStatus(order.id, order.status)}
                  className="flex-1 sm:flex-none"
              >
                {order.status === "pending" ? "Iniciar Produção" : "Finalizar"}
              </Button>
              </SubscriptionGate>
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
        </div>
      </div>
    );
  };

  const OrderLabel = ({ order }: { order: OrderType }) => {
    const statusDisplay = getStatusDisplay(order.status);

    return (
      <div className="w-[100mm] h-[150mm] bg-white text-black p-6">
        <div className="border border-gray-300 rounded-xl shadow-sm h-full flex flex-col justify-between p-6 space-y-4">

          {/* Bloco do código da encomenda */}
          <div className="text-center py-4">
            <p className="text-[10px] uppercase font-medium text-zinc-400 tracking-wide">Código</p>
            <h1 className="font-mono text-2xl font-bold tracking-widest text-zinc-800">
              {getOrderCode(order.id)}
            </h1>
          </div>

          {/* Informações principais */}
          <div className="flex-1 flex flex-col gap-4 text-zinc-800">

            <div className="grid grid-cols-2 gap-4">
              <LabelItem title="Cliente" content={order.client_name} />
              <LabelItem title="Entrega" content={formatDate(order.due_date)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <LabelItem title="Valor" content={`R$ ${order.price.toFixed(2).replace(".", ",")}`} />
              <LabelItem title="Status" content={statusDisplay.label} />
            </div>

            <LabelItem title="Descrição" content={order.description || "Sem descrição"} />
          </div>

          {/* Rodapé */}
          <div className="text-center text-[10px] text-zinc-400 border-t pt-2">
            <p>Gerado em {formatDate(new Date().toISOString(), "dd/MM/yyyy 'às' HH:mm")}</p>
            <p className="mt-0.5">Por Zencora Noma</p>
          </div>
        </div>
      </div>
    );
  };

  const LabelItem = ({ title, content }: { title: string; content: React.ReactNode }) => (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase font-medium text-zinc-400 tracking-wide">{title}</span>
      <span className="text-sm leading-tight break-words">{content}</span>
    </div>
  );


  const handleChangeOrderStatus = async (id: string, status: string) => {
    try {
      const order = orders.find((o) => o.id === id);
      if (!order) return;

      const newStatus = status === "pending" ? "production" : "done";

      const { error } = await supabaseService.orders.updateOrderStatus(
        id,
        newStatus,
      );
      if (error) throw error;

      // Atualiza o estado local
      setOrders(
        orders.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order,
        ),
      );

      toast({
        title: "Status atualizado",
        description: "O status da encomenda foi atualizado com sucesso.",
      });
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
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
          Acompanhe as encomendas pendentes e concluídas.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Encomendas</CardTitle>
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
                  {pendingOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
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
