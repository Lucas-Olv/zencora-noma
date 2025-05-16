import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, FileText } from "lucide-react"
import { Link } from "react-router-dom"
import { cn, formatDate, parseDate, getOrderCode } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingState } from "@/components/ui/loading-state"
import { Badge } from "@/components/ui/badge"
import { Tables } from "@/integrations/supabase/types"

type Order = Tables<"orders">

interface RecentOrdersProps {
  orders: Order[]
  loading?: boolean
}

function RecentOrders({ orders, loading = false }: RecentOrdersProps) {
  const recentOrders = orders?.slice(0, 5) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encomendas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <LoadingState
          loading={loading}
          empty={!recentOrders.length}
          emptyText="Nenhuma encomenda recente"
          emptyIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
        >
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm text-muted-foreground">{getOrderCode(order.id)}</p>
                      <p className="font-medium">{order.client_name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(order.price)}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(order.due_date, "dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
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
              </Link>
            ))}
          </div>
        </LoadingState>
      </CardContent>
    </Card>
  )
}

export default RecentOrders
