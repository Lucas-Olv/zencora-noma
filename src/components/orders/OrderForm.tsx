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
import { useTenant } from "@/contexts/TenantContext";
import { formatDate } from "@/lib/utils";

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
  deliveryTime: string;
}

interface FormErrors {
  customerName?: string;
  phone?: string;
  description?: string;
  value?: string;
  deliveryDate?: string;
  deliveryTime?: string;
}

const OrderForm = ({ mode = "create", orderId }: OrderFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    phone: "",
    description: "",
    value: "0,00",
    deliveryDate: "",
    deliveryTime: "12:00",
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

        const dueDate = parseISO(data.due_date);
        setFormData({
          customerName: data.client_name,
          phone: data.phone || "",
          description: data.description || "",
          value: data.price.toFixed(2).replace('.', ','),
          deliveryDate: formatDate(data.due_date, "yyyy-MM-dd"),
          deliveryTime: formatDate(data.due_date, "HH:mm"),
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
    } else if (!formData.deliveryTime) {
      newErrors.deliveryTime = "Hora de entrega é obrigatória";
    } else {
      const deliveryDateTime = new Date(`${formData.deliveryDate}T${formData.deliveryTime}:00`);
      const now = new Date();
      
      if (deliveryDateTime < now) {
        newErrors.deliveryDate = "Data e hora de entrega não podem ser no passado";
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

    if (tenantLoading || tenantError || !tenant) {
      toast({
        title: "Erro de tenant",
        description: "Não foi possível identificar o tenant atual.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        client_name: formData.customerName,
        phone: formData.phone || null,
        description: formData.description,
        price: parseFloat(formData.value.replace(',', '.')),
        due_date: `${formData.deliveryDate}T${formData.deliveryTime}:00`,
        tenant_id: tenant.id,
        collaborator_id: null,
        status: 'pending' as const
      };

      if (mode === "create") {
        const { error } = await supabaseService.orders.createOrder(orderData);
        if (error) throw error;
        
        toast({
          title: "Encomenda criada",
          description: "A encomenda foi criada com sucesso.",
        });
        navigate("/orders");
      } else if (mode === "edit" && orderId) {
        const { error } = await supabaseService.orders.updateOrder(orderId, orderData);
        if (error) throw error;
        
        toast({
          title: "Encomenda atualizada",
          description: "A encomenda foi atualizada com sucesso.",
        });
        navigate("/orders");
      }
    } catch (error: any) {
      toast({
        title: "Erro ao salvar encomenda",
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
        <CardHeader>
          <CardTitle>{mode === "create" ? "Nova Encomenda" : "Editar Encomenda"}</CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Preencha os dados para criar uma nova encomenda."
              : "Atualize os dados da encomenda conforme necessário."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nome do Cliente</Label>
              <Input
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Nome do cliente"
                disabled={isSubmitting}
              />
              {errors.customerName && (
                <p className="text-sm text-destructive">{errors.customerName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Produto</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva o produto ou serviço"
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                name="value"
                value={priceInput}
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
                placeholder="R$ 0,00"
                disabled={isSubmitting}
              />
              {errors.value && (
                <p className="text-sm text-destructive">{errors.value}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Data de Entrega</Label>
                <Input
                  id="deliveryDate"
                  name="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.deliveryDate && (
                  <p className="text-sm text-destructive">{errors.deliveryDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Hora de Entrega</Label>
                <Input
                  id="deliveryTime"
                  name="deliveryTime"
                  type="time"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.deliveryTime && (
                  <p className="text-sm text-destructive">{errors.deliveryTime}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex md:justify-end sm:justify-start">
          <Button className="w-full md:w-auto" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : mode === "create" ? "Criar Encomenda" : "Salvar Alterações"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default OrderForm;
