import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn, formatDate, parseDate, getOrderCode } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/lib/types";

interface RecentOrdersProps {
  orders: Order[];
  loading?: boolean;
}

function RecentOrders({ orders, loading = false }: RecentOrdersProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encomendas Recentes</CardTitle>
        <CardDescription>
          Últimas encomendas registradas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoadingState
          loading={loading}
          empty={!orders.length}
          emptyText="Nenhuma encomenda encontrada"
          emptyIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
        >
          <div className="space-y-4">
            {orders.map((order) => {
              const isOverdue = new Date(order.dueDate) < new Date();
              const status =
                isOverdue && order.status === "pending"
                  ? "overdue"
                  : order.status;
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
                          {order.clientName}
                        </h3>
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
                            {order.dueDate
                              ? formatDate(order.dueDate)
                              : "Sem data"}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
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
                </div>
              );
            })}
          </div>
        </LoadingState>
      </CardContent>
    </Card>
  );
}

export default RecentOrders;
