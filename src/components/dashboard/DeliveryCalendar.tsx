import { format, addDays, isSameDay, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Printer } from "lucide-react";
import { cn, formatDate, parseDate, getOrderCode } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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

interface DeliveryCalendarProps {
  orders: Order[];
  loading?: boolean;
}

function DeliveryCalendar({ orders, loading = false }: DeliveryCalendarProps) {
  const navigate = useNavigate();
  const today = new Date();
  const tomorrow = addDays(today, 1);

  // Filter out canceled and delivered orders
  const activeOrders =
    orders?.filter(
      (order) => order.status !== "canceled" && order.status !== "delivered",
    ) || [];

  const overdueOrders = activeOrders.filter((order) => {
    const orderDate = parseDate(order.dueDate);
    return orderDate && isBefore(orderDate, today) && order.status !== "done";
  });

  const todayOrders = activeOrders.filter((order) => {
    const orderDate = parseDate(order.dueDate);
    return orderDate && isSameDay(orderDate, today);
  });

  const tomorrowOrders = activeOrders.filter((order) => {
    const orderDate = parseDate(order.dueDate);
    return orderDate && isSameDay(orderDate, tomorrow);
  });

  const futureOrders = activeOrders
    .filter((order) => {
      const orderDate = parseDate(order.dueDate);
      return orderDate && isAfter(orderDate, tomorrow);
    })
    .sort((a, b) => {
      const dateA = parseDate(a.dueDate);
      const dateB = parseDate(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    });

  // Limit each section to 5 orders
  const overdueOrdersLimited = overdueOrders.slice(0, 5);
  const todayOrdersLimited = todayOrders.slice(0, 5);
  const tomorrowOrdersLimited = tomorrowOrders.slice(0, 5);
  const futureOrdersLimited = futureOrders.slice(0, 5);

  const renderOrderSection = (
    orders: Order[],
    title: string,
    titleColor: string,
    hasMore: boolean,
  ) => {
    if (orders.length === 0) return null;

    return (
      <div className="space-y-2">
        <h3 className={`text-sm font-medium ${titleColor}`}>{title}</h3>
        {orders.map((order) => {
          const isOverdue = new Date(order.dueDate) < new Date();
          const status =
            isOverdue && order.status === "pending" ? "overdue" : order.status;
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
                        {order.dueDate ? formatDate(order.dueDate) : "Sem data"}
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
                      status === "delivered" &&
                        "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50",
                      status === "done" &&
                        "bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50",
                      status === "canceled" &&
                        "bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50",
                    )}
                  >
                    {status === "overdue" && "Atrasado"}
                    {status === "pending" && "Pendente"}
                    {status === "production" && "Produção"}
                    {status === "done" && "Concluído"}
                    {status === "delivered" && "Entregue"}
                    {status === "canceled" && "Cancelado"}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
        {hasMore && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate("/orders")}
            >
              Ver mais
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo de Encomendas</CardTitle>
        <CardDescription>Resumo das encomendas em andamento</CardDescription>
      </CardHeader>
      <CardContent>
        <LoadingState
          loading={loading}
          empty={!activeOrders.length}
          emptyText="Nenhuma encomenda agendada"
          emptyIcon={<Calendar className="h-12 w-12 text-muted-foreground" />}
        >
          <div className="space-y-4">
            {renderOrderSection(
              overdueOrdersLimited,
              "Atrasadas",
              "text-red-500",
              overdueOrders.length > 5,
            )}

            {renderOrderSection(
              todayOrdersLimited,
              "Hoje",
              "text-muted-foreground",
              todayOrders.length > 5,
            )}

            {renderOrderSection(
              tomorrowOrdersLimited,
              "Amanhã",
              "text-muted-foreground",
              tomorrowOrders.length > 5,
            )}

            {renderOrderSection(
              futureOrdersLimited,
              "Futuras Entregas",
              "text-muted-foreground",
              futureOrders.length > 5,
            )}
          </div>
        </LoadingState>
      </CardContent>
    </Card>
  );
}

export default DeliveryCalendar;
