import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, FileText, Loader2, Pencil, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LoadingState } from "@/components/ui/loading-state";
import { cn, formatDate, parseDate, getOrderCode, usePrint, getStatusDisplay } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/contexts/TenantContext";
import { supabaseService, OrderType } from "@/services/supabaseService";
import { useMediaQuery } from "@/hooks/use-media-query";

export function ProductionView() {
  const { toast } = useToast();
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantLoading && tenant) {
      fetchOrders();
    }
  }, [tenantLoading, tenant]);

  const fetchOrders = async () => {
    try {
      if (tenantError || !tenant) {
        throw new Error(tenantError || 'Tenant não encontrado');
      }

      const { data, error } = await supabaseService.orders.getTenantOrders(tenant.id);
      if (error) throw error;
      setOrders((data || []).map(order => ({
        ...order,
        status: order.status as "pending" | "production" | "done"
      })));
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

  const pendingOrders = orders.filter((order) => order.status === "pending" || order.status === "production")
    .sort((a, b) => {
      // Primeiro, ordena por status (production vem antes de pending)
      if (a.status === "production" && b.status !== "production") return -1;
      if (a.status !== "production" && b.status === "production") return 1;

      // Se o status for igual, ordena por data de entrega
      return parseDate(a.due_date).getTime() - parseDate(b.due_date).getTime();
    });

  const completedOrders = orders.filter((order) => order.status === "done")
    .sort((a, b) => parseDate(a.due_date).getTime() - parseDate(b.due_date).getTime());

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
    `
  });

  const isMobile = useMediaQuery("(max-width: 640px)");

  const OrderCard = ({ order }: { order: OrderType }) => {
    if (isMobile) {
      return (
        <div className="grid grid-cols-1 gap-4 rounded-lg border p-4">
          <div className="grid grid-cols-[minmax(0,1fr),auto] gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-muted-foreground shrink-0">{getOrderCode(order.id)}</p>
                <h3 className="font-semibold truncate">
                  {order.client_name}
                </h3>
              </div>
              <div className="mt-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {order.description}
                </p>
              </div>
              <div className="mt-2">
                <span className="text-sm text-muted-foreground">
                  Entrega: <span className="font-semibold">
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
                  order.status === "pending" && "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
                  order.status === "production" && "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                )}
              >
                {order.status === "production"
                  ? "Produção"
                  : "Pendente"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={order.status === "pending" ? "outline" : "default"}
              size="sm"
              onClick={() => handleChangeOrderStatus(order.id, order.status)}
              className="flex-1"
            >
              {order.status === "pending" ? "Iniciar Produção" : "Finalizar"}
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
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-4 rounded-lg border p-4">
        <div className="grid grid-cols-[minmax(0,1fr),auto] gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-muted-foreground shrink-0">{getOrderCode(order.id)}</p>
              <h3 className="font-semibold truncate">
                {order.client_name}
              </h3>
            </div>
            <div className="mt-1">
              <p className="text-sm text-muted-foreground">
                {order.description}
              </p>
            </div>
            <div className="mt-2">
              <span className="text-sm text-muted-foreground">
                Entrega: <span className="font-semibold">
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
                order.status === "pending" && "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
                order.status === "production" && "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50"
              )}
            >
              {order.status === "production"
                ? "Produção"
                : "Pendente"}
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                variant={order.status === "pending" ? "outline" : "default"}
                size="sm"
                onClick={() => handleChangeOrderStatus(order.id, order.status)}
                className="flex-1 sm:flex-none"
              >
                {order.status === "pending" ? "Iniciar Produção" : "Finalizar"}
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
          </div>
        </div>
      </div>
    );
  };

  const OrderLabel = ({ order }: { order: OrderType }) => {
    const statusDisplay = getStatusDisplay(order.status);
    return (
      <div className="p-4 w-[100mm] h-[150mm] bg-white text-black">
        <div className="border-2 border-black h-full p-4 flex flex-col">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">ZENCORA</h1>
            <p className="text-sm">Etiqueta de Encomenda</p>
          </div>

          <div className="space-y-2 flex-1">
            <div>
              <p className="text-xs text-gray-500">Código</p>
              <p className="font-mono text-lg font-bold">{getOrderCode(order.id)}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Cliente</p>
              <p className="font-medium">{order.client_name}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Descrição</p>
              <p className="text-sm">{order.description || "Sem descrição"}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Data de Entrega</p>
              <p className="text-sm">{formatDate(order.due_date)}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Preço</p>
              <p className="text-sm">R$ {order.price.toFixed(2).replace('.', ',')}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-medium">{statusDisplay.label}</p>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Impresso em {formatDate(new Date().toISOString(), "dd/MM/yyyy 'às' HH:mm")}</p>
          </div>
        </div>
      </div>
    );
  };

  const handleChangeOrderStatus = async (id: string, status: string) => {
    try {
      const order = orders.find((o) => o.id === id);
      if (!order) return;

      const newStatus = status === "pending" ? "production" : "done";

      const { error } = await supabaseService.orders.updateOrderStatus(id, newStatus);
      if (error) throw error;

      // Atualiza o estado local
      setOrders(orders.map(order =>
        order.id === id ? { ...order, status: newStatus } : order
      ));

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
        <h2 className="text-3xl font-bold tracking-tight">Painel de Produção</h2>
        <p className="text-muted-foreground">
          Acompanhe as encomendas Produção e concluídas.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Encomendas Produção</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Produção
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
                emptyText="Nenhuma encomenda Produção"
                emptyIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
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
                emptyIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
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
