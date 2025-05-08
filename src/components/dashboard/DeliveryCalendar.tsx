import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "lucide-react"
import { cn, formatDate, parseDate } from "@/lib/utils"

import { getOrders } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingState } from "@/components/ui/loading-state"
import { Badge } from "@/components/ui/badge"

function DeliveryCalendar() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  })

  const today = new Date()
  const todayOrders = orders?.filter(
    (order) =>
      formatDate(order.created_at, "dd/MM/yyyy") ===
      formatDate(today.toISOString(), "dd/MM/yyyy")
  ) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entregas do Dia</CardTitle>
      </CardHeader>
      <CardContent>
        <LoadingState
          loading={isLoading}
          empty={!todayOrders.length}
          emptyText="Nenhuma entrega programada"
          emptyIcon={<Calendar className="h-12 w-12 text-muted-foreground" />}
        >
          <div className="space-y-4">
            {todayOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{order.client_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.description}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    order.status === "pending" && "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
                    order.status === "production" && "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50",
                    order.status === "done" && "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50"
                  )}
                >
                  {order.status === "done"
                    ? "Concluído"
                    : order.status === "production"
                    ? "Em produção"
                    : "Pendente"}
                </Badge>
              </div>
            ))}
          </div>
        </LoadingState>
      </CardContent>
    </Card>
  )
}

export default DeliveryCalendar
