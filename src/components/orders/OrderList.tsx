
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Eye, Plus, Search, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabaseService, OrderType } from "@/services/supabaseService";

// Interface para a ordem com dados do colaborador
interface OrderWithCollaborator extends OrderType {
  collaborator?: {
    name: string | null;
  } | null;
}

const OrderList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithCollaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { session } = await supabaseService.auth.getCurrentSession();
      
      if (session?.user) {
        const { data, error } = await supabaseService.orders.getUserOrders(session.user.id);
          
        if (error) throw error;
        setOrders(data || []);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar encomendas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleOrderStatus = async (id: string, currentStatus: string) => {
    try {
      const { error } = await supabaseService.orders.toggleOrderStatus(id, currentStatus);
        
      if (error) throw error;
      
      // Atualiza localmente
      const newStatus = currentStatus === 'pending' ? 'done' : 'pending';
      setOrders(orders.map(order => 
        order.id === id ? { ...order, status: newStatus } : order
      ));
      
      toast({
        title: `Encomenda ${newStatus === 'done' ? 'concluída' : 'reaberta'}`,
        description: `Status atualizado com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const filteredOrders = searchQuery.trim() === "" 
    ? orders 
    : orders.filter(order => 
        order.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.description && order.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Encomendas</h2>
          <p className="text-muted-foreground">
            Gerencie todas as suas encomendas em um só lugar
          </p>
        </div>
        
        <Button onClick={() => navigate("/orders/new")} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Nova Encomenda
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>Lista de Encomendas</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar encomendas..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-6">
              {searchQuery ? (
                <>
                  <p className="text-muted-foreground">Nenhuma encomenda encontrada para "{searchQuery}"</p>
                  <Button variant="link" onClick={() => setSearchQuery("")}>Limpar busca</Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-2">Você ainda não possui encomendas</p>
                  <Button onClick={() => navigate("/orders/new")}>
                    <Plus className="mr-2 h-4 w-4" /> Criar primeira encomenda
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data de Entrega</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.client_name}</TableCell>
                      <TableCell>
                        {format(new Date(order.due_date), "dd 'de' MMM", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        R$ {order.price.toFixed(2).replace('.', ',')}
                      </TableCell>
                      <TableCell>
                        {order.collaborator?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.status === "done" ? "success" : "outline"}>
                          {order.status === "done" ? "Concluída" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleOrderStatus(order.id, order.status || 'pending')}
                            title={order.status === "done" ? "Marcar como pendente" : "Marcar como concluída"}
                          >
                            {order.status === "done" ? (
                              <X className="h-4 w-4" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/orders/${order.id}`)}
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderList;
