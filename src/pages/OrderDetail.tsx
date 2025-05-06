
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Calendar, CheckCircle, Clock, DollarSign, Edit, Trash } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabaseService, OrderType } from "@/services/supabaseService";

// Interface para a ordem com dados do colaborador
interface OrderWithCollaborator extends OrderType {
  collaborator?: {
    name: string | null;
  } | null;
}

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
        setOrder(data);
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
  }, [id, toast]);

  const handleStatusToggle = async () => {
    if (!id || !order) return;
    
    try {
      const { error } = await supabaseService.orders.toggleOrderStatus(id, order.status || 'pending');

      if (error) throw error;
      
      const newStatus = order.status === 'pending' ? 'done' : 'pending';
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast({
        title: `Encomenda ${newStatus === 'done' ? 'concluída' : 'reaberta'}`,
        description: `Status da encomenda atualizado com sucesso.`,
        variant: "default"
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Encomenda não encontrada</h2>
        </div>
        <p className="text-muted-foreground">A encomenda solicitada não existe ou foi removida.</p>
        <Button onClick={() => navigate("/orders")}>Voltar para encomendas</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Detalhes da Encomenda</h2>
        </div>
        
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
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
            <AlertDialogContent>
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
          <Badge variant={order.status === 'done' ? "success" : "outline"}>{
            order.status === 'done' ? "Concluída" : "Pendente"
          }</Badge>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Descrição</h3>
            <p className="text-muted-foreground">{order.description || "Sem descrição"}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Data de Entrega</p>
                <p className="font-medium">{format(new Date(order.due_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="font-medium">R$ {order.price.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-complementary" />
              <div>
                <p className="text-sm text-muted-foreground">Criada em</p>
                <p className="font-medium">{format(new Date(order.created_at), "dd/MM/yyyy")}</p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            variant={order.status === 'done' ? "outline" : "default"}
            className={`w-full ${order.status === 'done' ? "" : "bg-green-600 hover:bg-green-700"}`}
            onClick={handleStatusToggle}
          >
            {order.status === 'done' ? 
              <>
                <Clock className="h-4 w-4 mr-2" />
                Marcar como Pendente
              </> : 
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Concluída
              </>
            }
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderDetail;
