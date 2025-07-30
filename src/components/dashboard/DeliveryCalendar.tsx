import { Calendar } from "lucide-react";
import { cn, formatDate, getOrderCode } from "@/lib/utils";
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
import dayjs from "@/lib/dayjs";

interface DeliveryCalendarProps {
  orders: Order[];
  loading?: boolean;
}

function DeliveryCalendar({ orders, loading = false }: DeliveryCalendarProps) {
  const navigate = useNavigate();
  const today = dayjs().startOf("day");
  const tomorrow = today.add(1, "day");

  const activeOrders =
    orders?.filter(
      (order) => order.status !== "canceled" && order.status !== "delivered",
    ) || [];

  const overdueOrders = activeOrders.filter((order) => {
    const orderDate = dayjs(order.dueDate);
    return orderDate.isBefore(today) && order.status !== "done";
  });

  const todayOrders = activeOrders.filter((order) => {
    const orderDate = dayjs(order.dueDate);
    return orderDate.isSame(today, "day");
  });

  const tomorrowOrders = activeOrders.filter((order) => {
    const orderDate = dayjs(order.dueDate);
    return orderDate.isSame(tomorrow, "day");
  });

  const futureOrders = activeOrders
    .filter((order) => {
      const orderDate = dayjs(order.dueDate);
      return orderDate.isAfter(tomorrow);
    })
    .sort((a, b) => dayjs(a.dueDate).diff(dayjs(b.dueDate)));

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
          const isOverdue = dayjs(order.dueDate).isBefore(dayjs());
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
                      status === "done" &&
                        "bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50",
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
