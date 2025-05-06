
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample production data
const initialOrders = [
  {
    id: "1",
    customer: "Maria Silva",
    product: "Bolo de Chocolate",
    date: "12/05/2025",
    description: "Bolo de chocolate com cobertura de brigadeiro, decorado com morangos.",
    isReady: false,
  },
  {
    id: "2",
    customer: "João Oliveira",
    product: "Docinhos para festa",
    date: "15/05/2025",
    description: "100 unidades de brigadeiro, beijinho e cajuzinho (mix).",
    isReady: false,
  },
  {
    id: "3",
    customer: "Ana Costa",
    product: "Kit festa infantil",
    date: "18/05/2025",
    description: "Bolo de chocolate, 50 docinhos variados, 30 mini sanduíches e 20 mini quiches.",
    isReady: false,
  },
  {
    id: "4",
    customer: "Fernanda Lopes",
    product: "Cupcakes",
    date: "10/05/2025",
    description: "24 cupcakes de chocolate com cobertura de cream cheese.",
    isReady: false,
  },
  {
    id: "5",
    customer: "Lucas Mendes",
    product: "Bolo de aniversário",
    date: "08/05/2025",
    description: "Bolo de chocolate com recheio de brigadeiro e cobertura de pasta americana, tema super-heróis.",
    isReady: false,
  },
];

const ProductionView = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState("pending");

  const handleToggleReady = (id: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, isReady: !order.isReady } : order
      )
    );
    
    // Find the order to get its details
    const order = orders.find(o => o.id === id);
    
    if (order) {
      toast({
        title: order.isReady ? "Encomenda reaberta" : "Encomenda concluída",
        description: order.isReady 
          ? `A encomenda de ${order.customer} voltou para produção.` 
          : `A encomenda de ${order.customer} foi marcada como pronta!`,
      });
    }
  };

  const pendingOrders = orders.filter(order => !order.isReady);
  const readyOrders = orders.filter(order => order.isReady);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Modo Produção</h2>
        <p className="text-muted-foreground">
          Visualize as encomendas pendentes e marque-as como prontas quando finalizadas.
        </p>
      </div>
      
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="pending" className="relative">
            Pendentes
            {pendingOrders.length > 0 && (
              <Badge className="ml-2 bg-primary/90">{pendingOrders.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ready">
            Prontas
            {readyOrders.length > 0 && (
              <Badge className="ml-2 bg-green-600">{readyOrders.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingOrders.length > 0 ? (
            pendingOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1">
                    <CardHeader>
                      <div className="flex justify-between">
                        <CardTitle className="text-xl flex items-center gap-2">
                          {order.product}
                          <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                            <Clock className="h-3 w-3 mr-1" />
                            {order.date}
                          </Badge>
                        </CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        Cliente: {order.customer}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <h4 className="font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                          <FileText className="h-4 w-4" /> Detalhes:
                        </h4>
                        <p>{order.description}</p>
                      </div>
                    </CardContent>
                  </div>
                  
                  <div className="p-4 flex items-center justify-center bg-accent/30 lg:flex-col lg:w-32">
                    <Button
                      variant="outline"
                      className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      onClick={() => handleToggleReady(order.id)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Pronto
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Não há encomendas pendentes! 🎉</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="ready" className="space-y-4">
          {readyOrders.length > 0 ? (
            readyOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden bg-green-50 dark:bg-green-950/10 border-green-200 dark:border-green-900/20">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1">
                    <CardHeader>
                      <div className="flex justify-between">
                        <CardTitle className="text-xl flex items-center gap-2">
                          {order.product}
                          <Badge className="bg-green-200 text-green-800 hover:bg-green-300">
                            {order.date}
                          </Badge>
                        </CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        Cliente: {order.customer}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <h4 className="font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                          <FileText className="h-4 w-4" /> Detalhes:
                        </h4>
                        <p>{order.description}</p>
                      </div>
                    </CardContent>
                  </div>
                  
                  <div className="p-4 flex items-center justify-center bg-green-100/50 lg:flex-col lg:w-32">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleToggleReady(order.id)}
                    >
                      Reabrir
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma encomenda finalizada ainda.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionView;
