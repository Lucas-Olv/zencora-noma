import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Sample data for recent orders
const orders = [
  {
    id: "1",
    customer: "Maria Silva",
    product: "Bolo de Chocolate",
    date: "12/05/2025",
    value: "R$ 120,00",
    status: "pendente",
    initials: "MS",
  },
  {
    id: "2",
    customer: "João Oliveira",
    product: "Docinhos para festa",
    date: "15/05/2025",
    value: "R$ 250,00",
    status: "confirmado",
    initials: "JO",
  },
  {
    id: "3",
    customer: "Ana Costa",
    product: "Kit festa infantil",
    date: "18/05/2025",
    value: "R$ 350,00",
    status: "produção",
    initials: "AC",
  },
  {
    id: "4",
    customer: "Pedro Santos",
    product: "Torta salgada",
    date: "20/05/2025",
    value: "R$ 85,00",
    status: "concluído",
    initials: "PS",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pendente":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "confirmado":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "produção":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    case "concluído":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    default:
      return "bg-muted text-text-primary hover:bg-accent";
  }
};

const RecentOrders = () => {
  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Encomendas Recentes</CardTitle>
          <CardDescription>
            Veja as últimas encomendas registradas
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/orders">Ver todas</a>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 rounded-lg bg-card hover:bg-accent/50 transition-colors border"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {order.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{order.customer}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {order.product}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-right">
                  <div className="font-medium">{order.value}</div>
                  <div className="text-muted-foreground">Entrega: {order.date}</div>
                </div>
                <Badge variant="outline" className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
