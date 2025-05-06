
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabaseService } from "@/services/supabaseService";

const OrderForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    product: "",
    description: "",
    value: "",
    deliveryDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.customerName || !formData.product || !formData.value || !formData.deliveryDate) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtém o usuário atual
      const { user } = await supabaseService.auth.getCurrentUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }
      
      // Cria uma nova encomenda
      const { error } = await supabaseService.orders.createOrder({
        client_name: formData.customerName,
        description: formData.description,
        price: parseFloat(formData.value.replace(',', '.')),
        due_date: formData.deliveryDate,
        user_id: user.id,
        collaborator_id: null, // Adicionado para atender ao tipo
        status: 'pending' // Adicionado para atender ao tipo
      });
      
      if (error) throw error;
      
      toast({
        title: "Encomenda registrada!",
        description: "A encomenda foi registrada com sucesso.",
      });
      
      navigate("/orders");
    } catch (error: any) {
      toast({
        title: "Erro ao registrar encomenda",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Nova Encomenda</CardTitle>
        <CardDescription>
          Registre uma nova encomenda com os detalhes do cliente e produto.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nome do Cliente*</Label>
              <Input
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Nome completo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product">Produto*</Label>
            <Input
              id="product"
              name="product"
              value={formData.product}
              onChange={handleChange}
              placeholder="Nome do produto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalhes adicionais sobre a encomenda"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor*</Label>
              <Input
                id="value"
                name="value"
                value={formData.value}
                onChange={handleChange}
                placeholder="R$ 0,00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Data de Entrega*</Label>
              <Input
                id="deliveryDate"
                name="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => navigate("/orders")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Registrar Encomenda"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default OrderForm;
