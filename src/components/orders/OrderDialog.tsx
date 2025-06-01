import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabaseService, OrderType } from "@/services/supabaseService";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useQueryClient } from "@tanstack/react-query";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  orderId?: string;
  orderData?: OrderType;
  onSuccess?: (updatedOrder: OrderType) => void;
}

const formSchema = z.object({
  client_name: z.string().min(1, "Por favor, informe o nome do cliente"),
  phone: z
    .string()
    .regex(/^$|^\(\d{2}\) \d{5}-\d{4}$/, "O telefone inválido")
    .optional(),
  description: z.string().min(1, "Por favor, descreva a encomenda"),
  due_date: z.string().min(1, "Por favor, selecione a data de entrega")
    .refine((date) => {
      // Criar as datas no fuso horário local
      const today = new Date();
      const selectedDate = new Date(date + 'T00:00:00');
      
      // Reset hours to 0 for both dates to compare only the dates
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      return selectedDate.getTime() >= today.getTime();
    }, "A data de entrega não pode ser anterior a hoje"),
  due_time: z.string().min(1, "Por favor, selecione a hora de entrega"),
  price: z
    .string()
    .min(1, "Por favor, informe um valor válido")
    .refine(
      (value) => {
        const numericValue = parseFloat(value.replace(".", "").replace(",", "."));
        return !isNaN(numericValue) && numericValue > 0;
      },
      "O valor deve ser maior que zero"
    ),
});

type FormValues = z.infer<typeof formSchema>;

const OrderDialog = ({
  open,
  onOpenChange,
  mode,
  orderId,
  orderData,
  onSuccess,
}: OrderDialogProps) => {
  const { toast } = useToast();
  const { tenant } = useWorkspaceContext();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_name: "",
      phone: "",
      description: "",
      due_date: "",
      due_time: "12:00",
      price: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (mode === "edit" && orderData) {
        const date = new Date(orderData.due_date);
        form.reset({
          client_name: orderData.client_name,
          phone: orderData.phone || "",
          description: orderData.description || "",
          due_date: format(date, "yyyy-MM-dd"),
          due_time: format(date, "HH:mm"),
          price: orderData.price.toFixed(2).replace(".", ","),
        });
      } else {
        form.reset({
          client_name: "",
          phone: "",
          description: "",
          due_date: "",
          due_time: "12:00",
          price: "",
        });
      }
    }
  }, [open, mode, orderData, form]);

  // Formata o telefone enquanto digita e limita a 11 dígitos
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 11) {
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
    return value;
  };

  // Formata o valor enquanto digita
  const formatPrice = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    
    // Se não houver números, retorna vazio
    if (numbers.length === 0) return "";

    // Converte para número e divide por 100 para ter os centavos
    const amount = parseInt(numbers) / 100;

    // Formata o número com 2 casas decimais
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const onSubmit = async (data: FormValues) => {
    if (!tenant) return;

    setLoading(true);
    try {
      const [hours, minutes] = data.due_time.split(":");
      // Criar a data no fuso horário local
      const dueDate = new Date(data.due_date + 'T00:00:00');
      dueDate.setHours(parseInt(hours), parseInt(minutes));

      const orderData = {
        client_name: data.client_name,
        phone: data.phone || null,
        description: data.description,
        due_date: dueDate.toISOString(),
        price: parseFloat(data.price.replace(".", "").replace(",", ".")),
        tenant_id: tenant.id,
        status: "pending" as const,
        ...(mode === "edit" && orderId ? { id: orderId } : {}),
      };

      if (mode === "create") {
        const { data: newOrder, error } = await supabaseService.orders.createOrder(orderData);
        if (error) throw error;

        // Atualiza a lista otimisticamente
        queryClient.setQueryData<OrderType[]>(["orders", tenant.id], (old = []) => {
          return [newOrder as OrderType, ...old];
        });

        // Invalida a query para forçar uma nova busca
        await queryClient.invalidateQueries({ queryKey: ["orders", tenant.id] });

        onSuccess?.(newOrder as OrderType);

        toast({
          title: "Encomenda criada!",
          description: "A encomenda foi criada com sucesso.",
        });
      } else if (mode === "edit" && orderId) {
        const { data: updatedOrder, error } = await supabaseService.orders.updateOrder(
          orderId,
          orderData,
        );
        if (error) throw error;

        // Atualiza a lista otimisticamente
        queryClient.setQueryData<OrderType[]>(["orders", tenant.id], (old = []) => {
          return old.map((order) => (order.id === orderId ? updatedOrder as OrderType : order));
        });

        // Invalida a query para forçar uma nova busca
        await queryClient.invalidateQueries({ queryKey: ["orders", tenant.id] });

        // Notifica o componente pai sobre a atualização
        onSuccess?.(updatedOrder as OrderType);

        toast({
          title: "Encomenda atualizada!",
          description: "A encomenda foi atualizada com sucesso.",
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar encomenda",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[160]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nova Encomenda" : "Editar Encomenda"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Preencha os dados para criar uma nova encomenda."
              : "Atualize os dados da encomenda conforme necessário."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone do Cliente</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="(00) 00000-0000"
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Detalhes da encomenda..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Entrega</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Entrega</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço (R$)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      onChange={(e) => {
                        const formatted = formatPrice(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row justify-end gap-2 border-t pt-8 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog; 