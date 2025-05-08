import { useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabaseService } from "@/services/supabaseService";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderFormProps {
  mode?: "create" | "edit";
  orderId?: string;
}

interface FormData {
  customerName: string;
  phone: string;
  description: string;
  value: string;
  deliveryDate: string;
}

interface FormErrors {
  customerName?: string;
  phone?: string;
  description?: string;
  value?: string;
  deliveryDate?: string;
}

const OrderForm = ({ mode = "create", orderId }: OrderFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    phone: "",
    description: "",
    value: "",
    deliveryDate: "",
  });

  const [priceInput, setPriceInput] = useState(
    mode === "edit" && orderId ? new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(formData.value.replace(',', '.'))) : ""
  );

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (mode !== "edit" || !orderId) return;
      
      try {
        const { data, error } = await supabaseService.orders.getOrderById(orderId);

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

        setFormData({
          customerName: data.client_name,
          phone: data.phone || "",
          description: data.description || "",
          value: data.price.toFixed(2).replace('.', ','),
          deliveryDate: format(parseISO(data.due_date), "yyyy-MM-dd"),
        });

        setPriceInput(new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(data.price));
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
  }, [mode, orderId, navigate, toast]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Nome do cliente
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Nome do cliente é obrigatório";
    } else if (formData.customerName.length < 3) {
      newErrors.customerName = "Nome deve ter pelo menos 3 caracteres";
    }
    
    // Telefone (opcional, mas se preenchido deve ser válido)
    if (formData.phone && !/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = "Telefone inválido. Use o formato (00) 00000-0000";
    }
    
    // Descrição
    if (!formData.description.trim()) {
      newErrors.description = "Descrição do produto é obrigatória";
    } else if (formData.description.length < 5) {
      newErrors.description = "Descrição deve ter pelo menos 5 caracteres";
    }
    
    // Valor
    if (!formData.value) {
      newErrors.value = "Valor é obrigatório";
    } else {
      const numericValue = parseFloat(formData.value.replace(',', '.'));
      if (isNaN(numericValue) || numericValue <= 0) {
        newErrors.value = "Valor deve ser maior que zero";
      }
    }
    
    // Data de entrega
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = "Data de entrega é obrigatória";
    } else {
      const deliveryDate = new Date(formData.deliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deliveryDate < today) {
        newErrors.deliveryDate = "Data de entrega não pode ser no passado";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatCurrency = (value: string): string => {
    // Remove tudo que não é número ou vírgula
    const numbers = value.replace(/[^\d,]/g, '');
    
    // Se não houver números, retorna vazio
    if (!numbers) return '';
    
    // Garante que há apenas uma vírgula
    const parts = numbers.split(',');
    if (parts.length > 2) {
      return `${parts[0]},${parts.slice(1).join('')}`;
    }
    
    // Limita a 2 casas decimais
    if (parts[1]?.length > 2) {
      return `${parts[0]},${parts[1].slice(0, 2)}`;
    }
    
    return numbers;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Aplica formatação específica para cada campo
    switch (name) {
      case 'phone':
        formattedValue = formatPhoneNumber(value);
        break;
      case 'value':
        formattedValue = formatCurrency(value);
        break;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
    
    // Limpa o erro do campo quando ele é alterado
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPriceInput(value);

    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d,]/g, "").replace(",", ".");
    
    // Convert to number and update form data
    const price = parseFloat(numericValue) || 0;
    setFormData(prev => ({ ...prev, value: price.toFixed(2).replace('.', ',') }));
  };

  const handlePriceBlur = () => {
    // Format the price when input loses focus
    const formattedPrice = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(formData.value.replace(',', '.')));
    setPriceInput(formattedPrice);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { user } = await supabaseService.auth.getCurrentUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }

      const orderData = {
        client_name: formData.customerName.trim(),
        phone: formData.phone.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.value.replace(',', '.')),
        due_date: formData.deliveryDate,
        user_id: user.id,
        collaborator_id: null,
        status: 'pending' as const
      };
      
      if (mode === "edit" && orderId) {
        const { error } = await supabaseService.orders.updateOrder(orderId, orderData);
        if (error) throw error;
        
        toast({
          title: "Encomenda atualizada!",
          description: "A encomenda foi atualizada com sucesso.",
        });
        
        navigate(-1);
      } else {
        const { error } = await supabaseService.orders.createOrder(orderData);
        if (error) throw error;
        
        toast({
          title: "Encomenda registrada!",
          description: "A encomenda foi registrada com sucesso.",
        });
        
        navigate("/orders");
      }
    } catch (error: any) {
      toast({
        title: mode === "edit" ? "Erro ao atualizar encomenda" : "Erro ao registrar encomenda",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nome do Cliente*</Label>
            <Input
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Nome completo do cliente"
              className={errors.customerName ? "border-destructive" : ""}
            />
            {errors.customerName && (
              <p className="text-sm text-destructive">{errors.customerName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Produto*</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva o produto e detalhes da encomenda"
              rows={3}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor*</Label>
              <Input
                id="value"
                name="value"
                value={priceInput}
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
                placeholder="R$ 0,00"
                className={errors.value ? "border-destructive" : ""}
              />
              {errors.value && (
                <p className="text-sm text-destructive">{errors.value}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Data de Entrega*</Label>
              <Input
                id="deliveryDate"
                name="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={errors.deliveryDate ? "border-destructive" : ""}
              />
              {errors.deliveryDate && (
                <p className="text-sm text-destructive">{errors.deliveryDate}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? (mode === "edit" ? "Atualizando..." : "Registrando...") 
              : (mode === "edit" ? "Atualizar Encomenda" : "Registrar Encomenda")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default OrderForm;
