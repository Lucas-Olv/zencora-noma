import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, FileText, Loader2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getOrders, Order } from "@/lib/api";
import { LoadingState } from "@/components/ui/loading-state";
import { cn, formatDate, parseDate } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const getStatusDisplay = (status: string | null) => {
  switch (status) {
    case "pending":
      return { 
        label: "Pendente", 
        className: "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50" 
      };
    case "production":
      return { 
        label: "Em produção", 
        className: "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50" 
      };
    case "done":
      return { 
        label: "Concluído", 
        className: "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50" 
      };
    default:
      return { 
        label: "Pendente", 
        className: "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50" 
      };
  }
};

export function ProductionView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });
  const navigate = useNavigate();

  const pendingOrders = orders?.filter((order) => order.status === "pending" || order.status === "production")
    .sort((a, b) => {
      // Primeiro, ordena por status (production vem antes de pending)
      if (a.status === "production" && b.status !== "production") return -1;
      if (a.status !== "production" && b.status === "production") return 1;
      
      // Se o status for igual, ordena por data de entrega
      return parseDate(a.due_date).getTime() - parseDate(b.due_date).getTime();
    }) || [];

  const completedOrders = orders?.filter((order) => order.status === "done")
    .sort((a, b) => parseDate(a.due_date).getTime() - parseDate(b.due_date).getTime()) || [];

  const handleToggleReady = async (id: string) => {
    try {
      const order = orders?.find((o) => o.id === id);
      if (!order) return;

      const newStatus =
        order.status === "pending"
          ? "production"
          : order.status === "production"
          ? "done"
          : "pending";

      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      // Invalidate and refetch the orders query
      await queryClient.invalidateQueries({ queryKey: ["orders"] });

      toast({
        title: "Status atualizado",
        description: "O status da encomenda foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da encomenda.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
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
    <Card>
      <CardHeader>
        <CardTitle>Encomendas em Produção</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              Em Produção
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
              loading={isLoading}
              empty={!pendingOrders.length}
              emptyText="Nenhuma encomenda em produção"
              emptyIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
            >
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">
                        {order.client_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {order.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            order.status === "pending" && "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
                            order.status === "production" && "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                          )}
                        >
                          {order.status === "production"
                            ? "Em produção"
                            : "Pendente"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Entrega: <span className="font-semibold">
                            {order.due_date ? formatDate(order.due_date, "dd 'de' MMMM") : "Sem data"}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={order.status === "production"}
                        onClick={() => handleToggleReady(order.id)}
                      >
                        Iniciar Produção
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        disabled={order.status === "pending"}
                        onClick={() => handleToggleReady(order.id)}
                      >
                        Finalizar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </LoadingState>
          </TabsContent>

          <TabsContent value="completed">
            <LoadingState
              loading={isLoading}
              empty={!completedOrders.length}
              emptyText="Nenhuma encomenda concluída"
              emptyIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
            >
              <div className="space-y-4">
                {completedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <h3 className="font-semibold">
                        {order.client_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {order.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50"
                        >
                          Concluído
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Concluído em{" "}
                          {order.due_date ? formatDate(order.due_date, "dd/MM/yyyy") : "Sem data"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </LoadingState>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ProductionView;
