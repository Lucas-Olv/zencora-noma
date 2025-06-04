import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn, formatDate, getOrderCode } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { SettingsGate } from "../settings/SettingsGate";
import { SubscriptionGate } from "../subscription/SubscriptionGate";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Order = Tables<"orders">;

interface OrdersListProps {
  orders: Order[];
  loading?: boolean;
  title?: string;
  description?: string;
  onEdit?: (order: Order) => void;
  onDelete?: (order: Order) => void;
  onCreate?: () => void;
}

function OrdersList({ 
  orders, 
  loading = false,
  title = "Lista de Encomendas",
  description = "Lista de todas as encomendas",
  onEdit,
  onDelete,
  onCreate
}: OrdersListProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <SubscriptionGate blockMode="disable">
          <SettingsGate permission="create">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onCreate?.();
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Encomenda
            </Button>
          </SettingsGate>
        </SubscriptionGate>
      </CardHeader>
      <CardContent>
        <LoadingState
          loading={loading}
          empty={!orders.length}
          emptyText="Nenhuma encomenda encontrada"
          emptyIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
        >
          <div className="space-y-2">
            {orders.map((order) => {
              const isOverdue = new Date(order.due_date) < new Date();
              const status = (isOverdue && order.status === "pending") ? "overdue" : order.status;
              return (
                <div
                  key={order.id}
                  className="grid grid-cols-1 gap-4 rounded-lg border p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="grid grid-cols-[minmax(0,1fr),auto] gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm text-muted-foreground shrink-0">
                          {getOrderCode(order.id)}
                        </p>
                        <h3 className="font-semibold truncate">
                          {order.client_name}
                        </h3>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {order.description || "Sem descrição"}
                        </p>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">
                          Entrega:{" "}
                          <span className={cn(
                            "font-semibold",
                            isOverdue && (order.status === "pending" || order.status === "production") && "text-red-500"
                          )}>
                            {order.due_date
                              ? formatDate(order.due_date)
                              : "Sem data"}
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
                        <div className="text-right">
                          <p className="font-medium">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(order.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <SubscriptionGate blockMode="disable">
                            <SettingsGate permission="edit">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit?.(order);
                                }}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </SettingsGate>
                          </SubscriptionGate>
                          <SubscriptionGate blockMode="disable">
                            <SettingsGate permission="delete">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete?.(order);
                                }}
                                title="Excluir"
                                className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </SettingsGate>
                          </SubscriptionGate>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </LoadingState>
      </CardContent>
    </Card>
  );
}

export default OrdersList; 