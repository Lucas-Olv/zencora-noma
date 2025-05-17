import { format, addDays, isSameDay, isAfter, isBefore } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Printer } from "lucide-react"
import { cn, formatDate, parseDate, getOrderCode } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LoadingState } from "@/components/ui/loading-state"
import { Badge } from "@/components/ui/badge"
import { Tables } from "@/integrations/supabase/types"

type Order = Tables<"orders">

interface DeliveryCalendarProps {
  orders: Order[]
  loading?: boolean
}

function DeliveryCalendar({ orders, loading = false }: DeliveryCalendarProps) {
  const navigate = useNavigate()
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
        <CardTitle>Calendário de Entregas</CardTitle>
        <CardDescription>
          Encomendas agendadas para entrega
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoadingState
          loading={loading}
          empty={!orders.length}
          emptyText="Nenhuma encomenda agendada"
          emptyIcon={<Calendar className="h-12 w-12 text-muted-foreground" />}
        >
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-1 gap-4 rounded-lg border p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
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
                  <div className="flex items-center justify-end">
                    <Badge
                      variant="outline"
                      className={cn(
                        "w-fit",
                        order.status === "pending" && "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
                        order.status === "production" && "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50",
                        order.status === "done" && "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50"
                      )}
                    >
                      {order.status === "pending" && "Pendente"}
                      {order.status === "production" && "Produção"}
                      {order.status === "done" && "Concluído"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </LoadingState>
      </CardContent>
    </Card>
  )
}

export default DeliveryCalendar
