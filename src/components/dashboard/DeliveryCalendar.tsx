
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Sample delivery data
const deliveries = [
  { 
    id: 1, 
    date: "Hoje", 
    items: [
      { title: "Bolo de Chocolate", customer: "Maria Silva" },
      { title: "Cupcakes", customer: "Fernanda Lopes" }
    ] 
  },
  { 
    id: 2, 
    date: "Amanhã", 
    items: [
      { title: "Kit festa infantil", customer: "Ana Costa" }
    ] 
  },
  { 
    id: 3, 
    date: "08/05/2025", 
    items: [
      { title: "Torta salgada", customer: "Pedro Santos" },
      { title: "Bolo de aniversário", customer: "Lucas Mendes" }
    ] 
  },
];

const DeliveryCalendar = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Entregas</CardTitle>
        <CardDescription>
          Entregas programadas para os próximos dias
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{delivery.date}</h4>
                <Badge variant="outline" className={
                  delivery.date === "Hoje" 
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-muted"
                }>
                  {delivery.items.length} entregas
                </Badge>
              </div>
              <div className="space-y-2">
                {delivery.items.map((item, idx) => (
                  <div key={idx} className="flex flex-col p-2 rounded-md bg-accent/40">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-sm text-muted-foreground">{item.customer}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryCalendar;
