import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Eye, Plus, Search, X, Loader2, Package, Pencil, Printer } from "lucide-react";
import { formatDate, usePrint, getOrderCode, getStatusDisplay } from "@/lib/utils";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCollaborator | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = usePrint(printRef, {
    pageStyle: `
      @page {
        size: 100mm 150mm;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `
  });

  const OrderLabel = ({ order }: { order: OrderWithCollaborator }) => {
    const statusDisplay = getStatusDisplay(order.status);
    return (
      <div className="p-4 w-[100mm] h-[150mm] bg-white text-black">
        <div className="border-2 border-black h-full p-4 flex flex-col">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">ZENCORA</h1>
            <p className="text-sm">Etiqueta de Encomenda</p>
          </div>

          <div className="space-y-2 flex-1">
            <div>
              <p className="text-xs text-gray-500">Código</p>
              <p className="font-mono text-lg font-bold">{getOrderCode(order.id)}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Cliente</p>
              <p className="font-medium">{order.client_name}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Descrição</p>
              <p className="text-sm">{order.description || "Sem descrição"}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Data de Entrega</p>
              <p className="text-sm">{formatDate(order.due_date)}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Preço</p>
              <p className="text-sm">R$ {order.price.toFixed(2).replace('.', ',')}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-medium">{statusDisplay.label}</p>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Impresso em {formatDate(new Date().toISOString(), "dd/MM/yyyy 'às' HH:mm")}</p>
          </div>
        </div>
      </div>
    );
  };

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
        description: `A encomenda foi marcada como ${targetStatus === "pending" ? "pendente" : targetStatus === "production" ? "Produção" : "concluída"}.`,
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
                      <TableHead>Código</TableHead>
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
                          <TableCell className="font-mono text-sm text-muted-foreground">{getOrderCode(order.id)}</TableCell>
                          <TableCell className="font-medium">{order.client_name}</TableCell>
                          <TableCell>
                            {formatDate(order.due_date)}
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
                                title="Marcar como Produção"
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
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setTimeout(handlePrint, 100);
                                }}
                                title="Imprimir"
                              >
                                <Printer className="h-4 w-4" />
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
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-sm text-muted-foreground">{getOrderCode(order.id)}</p>
                                <h3 className="font-medium">{order.client_name}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(order.due_date)}
                              </p>
                            </div>
                            <Badge variant="outline" className={statusDisplay.className}>
                              {statusDisplay.label}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between gap-2">
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
                              title="Marcar como Produção"
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedOrder(order);
                                setTimeout(handlePrint, 100);
                              }}
                              title="Imprimir"
                            >
                              <Printer className="h-4 w-4" />
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

      {/* Hidden print content */}
      <div className="hidden">
        {selectedOrder && (
          <div ref={printRef}>
            <OrderLabel order={selectedOrder} />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
