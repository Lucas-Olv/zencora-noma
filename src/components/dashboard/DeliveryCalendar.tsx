import { format, addDays, isSameDay, isAfter, isBefore } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "lucide-react"
import { cn, formatDate, parseDate, getOrderCode } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingState } from "@/components/ui/loading-state"
import { Badge } from "@/components/ui/badge"
import { Tables } from "@/integrations/supabase/types"

type Order = Tables<"orders">

interface DeliveryCalendarProps {
  orders: Order[]
  loading?: boolean
}

function DeliveryCalendar({ orders, loading = false }: DeliveryCalendarProps) {
  const today = new Date()
  const tomorrow = addDays(today, 1)

  const todayOrders = orders?.filter(order => {
    const orderDate = parseDate(order.due_date)
    return orderDate && isSameDay(orderDate, today)
  }) || []

  const tomorrowOrders = orders?.filter(order => {
    const orderDate = parseDate(order.due_date)
    return orderDate && isSameDay(orderDate, tomorrow)
  }) || []

  const futureOrders = orders?.filter(order => {
    const orderDate = parseDate(order.due_date)
    return orderDate && isAfter(orderDate, tomorrow)
  }).sort((a, b) => {
    const dateA = parseDate(a.due_date)
    const dateB = parseDate(b.due_date)
    return dateA.getTime() - dateB.getTime()
  }) || []

  const allOrders = [...todayOrders, ...tomorrowOrders, ...futureOrders]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Entregas</CardTitle>
      </CardHeader>
      <CardContent>
        <LoadingState
          loading={loading}
          empty={!allOrders.length}
          emptyText="Nenhuma entrega programada"
          emptyIcon={<Calendar className="h-12 w-12 text-muted-foreground" />}
        >
          <div className="space-y-6">
            {todayOrders.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Hoje</h3>
                <div className="space-y-2">
                  {todayOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm text-muted-foreground">{getOrderCode(order.id)}</p>
                          <p className="font-medium">{order.client_name}</p>
                        </div>
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
                          ? "Produção"
                          : "Pendente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tomorrowOrders.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Amanhã</h3>
                <div className="space-y-2">
                  {tomorrowOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm text-muted-foreground">{getOrderCode(order.id)}</p>
                          <p className="font-medium">{order.client_name}</p>
                        </div>
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
                          ? "Produção"
                          : "Pendente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {futureOrders.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Futuras</h3>
                <div className="space-y-2">
                  {futureOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm text-muted-foreground">{getOrderCode(order.id)}</p>
                          <p className="font-medium">{order.client_name}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Entrega: {formatDate(order.due_date, "dd 'de' MMMM")}
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
                          ? "Produção"
                          : "Pendente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </LoadingState>
      </CardContent>
    </Card>
  )
}

export default DeliveryCalendar
