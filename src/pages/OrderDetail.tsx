import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDate, parseDate } from "@/lib/utils";
import { ArrowLeft, Calendar, CheckCircle, Clock, DollarSign, Edit, Trash, Package } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabaseService, OrderType } from "@/services/supabaseService";

// Interface para a ordem com dados do colaborador
interface OrderWithCollaborator extends OrderType {
  collaborator?: {
    name: string | null;
  } | null;
  status: "done" | "pending" | "production";
}

const getStatusDisplay = (status: "done" | "pending" | "production" | null) => {
  switch (status) {
    case "pending":
      return { 
        label: "Pendente", 
        className: "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50" 
      };
    case "production":
      return { 
        label: "Produção", 
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

const AutoResizeTextarea = ({ value, className }: { value: string, className?: string }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className={className}
      value={value}
      readOnly
      rows={1}
    />
  );
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderWithCollaborator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Detalhes da Encomenda | Zencora Noma";
    
    const fetchOrderDetails = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabaseService.orders.getOrderById(id);

        if (error) throw error;
        if (!data) {
          toast({
            title: "Encomenda não encontrada",
            description: "A encomenda solicitada não existe ou foi removida.",
            variant: "destructive"
          });
          navigate("/orders");
          return;
        }

        // Garante que o status seja um dos valores permitidos
        const orderData = {
          ...data,
          status: (data.status || "pending") as "pending" | "production" | "done"
        };
        setOrder(orderData);
      } catch (error: any) {
        toast({
          title: "Erro ao carregar encomenda",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, toast, navigate]);

  const updateOrderStatus = async (newStatus: "pending" | "production" | "done") => {
    if (!id || !order) return;
    
    try {
      const { error } = await supabaseService.orders.updateOrderStatus(id, newStatus);

      if (error) throw error;
      
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      
      const statusLabels = {
        pending: "pendente",
        production: "Produção",
        done: "concluída"
      };
      
      toast({
        title: `Encomenda ${statusLabels[newStatus]}`,
        description: `Status da encomenda atualizado com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      const { error } = await supabaseService.orders.deleteOrder(id);

      if (error) throw error;
      
      toast({
        title: "Encomenda excluída",
        description: "A encomenda foi removida com sucesso.",
      });
      
      navigate("/orders");
    } catch (error: any) {
      toast({
        title: "Erro ao excluir encomenda",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Encomenda não encontrada</h2>
        </div>
        <p className="text-muted-foreground">A encomenda solicitada não existe ou foi removida.</p>
        <Button onClick={() => navigate("/orders")}>Voltar para encomendas</Button>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(order.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Detalhes da Encomenda</h2>
            <p className="text-muted-foreground">
              Visualize e gerencie os detalhes desta encomenda
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/orders/edit/${id}`)}>
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[400px] mx-auto rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirma exclusão?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não poderá ser desfeita. Isso excluirá permanentemente a encomenda do cliente {order.client_name}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl">{order.client_name}</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              {order.collaborator?.name ? `Responsável: ${order.collaborator.name}` : "Sem responsável designado"}
            </p>
          </div>
          <Badge variant="outline" className={statusDisplay.className}>
            {statusDisplay.label}
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Descrição</h3>
            <AutoResizeTextarea 
              value={order.description || "Sem descrição"} 
              className="text-muted-foreground w-full px-0 py-1 resize-none overflow-hidden bg-transparent focus:outline-none focus:ring-0"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Entrega</p>
                <p className="font-medium">{formatDate(order.due_date)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100/80 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="font-medium">R$ {order.price.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-complementary/10 rounded-lg">
                <Clock className="h-5 w-5 text-complementary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Criada em</p>
                <p className="font-medium">{formatDate(order.created_at, "dd/MM/yyyy")}</p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3 pt-6 border-t">
          <div className="w-full">
            <h3 className="font-semibold mb-3">Atualizar Status</h3>
            <div className="grid grid-rows-2 sm:grid-cols-1 gap-3">
              {order.status !== "pending" && (
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => updateOrderStatus("pending")}
                >
                  <Clock className="h-4 w-4 row-span-full mr-2" />
                  Marcar como Pendente
                </Button>
              )}
              {order.status !== "production" && (
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => updateOrderStatus("production")}
                >
                  <Package className="h-4 w-4 row-span-full mr-2" />
                  Marcar como Produção
                </Button>
              )}
              {order.status !== "done" && (
                <Button 
                  variant="default"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => updateOrderStatus("done")}
                >
                  <CheckCircle className="h-4 w-4 row-span-full mr-2" />
                  Marcar como Concluída
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderDetail;
