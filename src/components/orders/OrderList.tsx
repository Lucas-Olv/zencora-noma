import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Eye, Plus, Search, X, Loader2, Package, Pencil } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabaseService, OrderType } from "@/services/supabaseService";

// Interface para a ordem com dados do colaborador
interface OrderWithCollaborator extends OrderType {
  collaborator?: {
    name: string | null;
  } | null;
}

const getStatusDisplay = (status: string | null) => {
  switch (status) {
    case "pending":
      return { 
        label: "Pendente", 
        className: "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50" 
      };
    case "production":
      return { 
        label: "Em produção", 
        className: "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50" 
      };
    case "done":
      return { 
        label: "Concluído", 
        className: "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50" 
      };
    default:
      return { 
        label: "Pendente", 
        className: "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50" 
      };
  }
};

const OrderList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithCollaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    try {
      const { user } = await supabaseService.auth.getCurrentUser();
      if (!user) return;

      const { data, error } = await supabaseService.orders.getUserOrders(user.id);
      if (error) throw error;

      setOrders(data as OrderWithCollaborator[]);
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
  
  const handleStatusChange = async (id: string, targetStatus: "pending" | "production" | "done") => {
    try {
      const { error } = await supabaseService.orders.updateOrderStatus(id, targetStatus);
      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === id ? { ...order, status: targetStatus } : order
      ));

      toast({
        title: "Status atualizado!",
        description: `A encomenda foi marcada como ${targetStatus === "pending" ? "pendente" : targetStatus === "production" ? "em produção" : "concluída"}.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const filteredOrders = searchTerm.trim() === "" 
    ? orders 
    : orders.filter(order => 
        order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.description && order.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setSearchTerm("")}
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
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-6">
              {searchTerm ? (
                <>
                  <p className="text-muted-foreground">Nenhuma encomenda encontrada para "{searchTerm}"</p>
                  <Button
                    variant="link"
                    onClick={() => setSearchTerm("")}
                    className="mt-2"
                  >
                    Limpar busca
                  </Button>
                </>
              ) : (
                <>
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma encomenda</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece registrando sua primeira encomenda.
                  </p>
                  <Button onClick={() => navigate("/orders/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Encomenda
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data de Entrega</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const statusDisplay = getStatusDisplay(order.status);
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.client_name}</TableCell>
                          <TableCell>
                            {format(new Date(order.due_date), "dd 'de' MMMM", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            R$ {order.price.toFixed(2).replace('.', ',')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusDisplay.className}>
                              {statusDisplay.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(order.id, "pending")}
                                title="Marcar como pendente"
                                disabled={order.status === "pending"}
                                className="flex items-center justify-center"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(order.id, "production")}
                                title="Marcar como em produção"
                                disabled={order.status === "production"}
                                className="flex items-center justify-center"
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleStatusChange(order.id, "done")}
                                title="Marcar como concluída"
                                disabled={order.status === "done"}
                                className="flex items-center justify-center"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/orders/edit/${order.id}`)}
                                title="Editar encomenda"
                                className="flex items-center justify-center"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/orders/${order.id}`)}
                                title="Ver detalhes"
                                className="flex items-center justify-center"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredOrders.map((order) => {
                  const statusDisplay = getStatusDisplay(order.status);
                  return (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{order.client_name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(order.due_date), "dd 'de' MMMM", { locale: ptBR })}
                              </p>
                            </div>
                            <Badge variant="outline" className={statusDisplay.className}>
                              {statusDisplay.label}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusChange(order.id, "pending")}
                              title="Marcar como pendente"
                              disabled={order.status === "pending"}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusChange(order.id, "production")}
                              title="Marcar como em produção"
                              disabled={order.status === "production"}
                            >
                              <Package className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusChange(order.id, "done")}
                              title="Marcar como concluída"
                              disabled={order.status === "done"}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/orders/edit/${order.id}`)}
                              title="Editar encomenda"
                            >
                              <Pencil className="h-4 w-4" />
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
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderList;
