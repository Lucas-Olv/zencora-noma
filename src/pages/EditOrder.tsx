import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrderForm from "@/components/orders/OrderForm";
import { supabaseService } from "@/services/supabaseService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EditOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Editar Encomenda | Zencora Noma";
    
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
      } catch (error: any) {
        toast({
          title: "Erro ao carregar encomenda",
          description: error.message,
          variant: "destructive"
        });
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/orders/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Editar Encomenda</h2>
          <p className="text-muted-foreground">
            Atualize os dados da encomenda conforme necessário.
          </p>
        </div>
      </div>

      <OrderForm mode="edit" orderId={id} />
    </div>
  );
};

export default EditOrder; 