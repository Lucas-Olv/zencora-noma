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
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { format } from "date-fns";
import { id, ptBR } from "date-fns/locale";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenantStorage } from "@/storage/tenant";
import { Order } from "@/lib/types";
import { postNomaApi, putNomaApi } from "@/lib/apiHelpers";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  orderId?: string;
  orderData?: Order;
  onSuccess?: (updatedOrder: Order) => void;
}

const formSchema = z.object({
  clientName: z.string().min(1, "Por favor, informe o nome do cliente"),
  clientPhone: z
    .string()
    .regex(/^$|^\(\d{2}\) \d{5}-\d{4}$/, "O telefone inválido")
    .optional(),
  description: z.string().min(1, "Por favor, descreva a encomenda"),
  dueDate: z
    .string()
    .min(1, "Por favor, selecione a data de entrega")
    .refine((date) => {
      // Criar as datas no fuso horário local
      const today = new Date();
      const selectedDate = new Date(date + "T00:00:00");

      // Reset hours to 0 for both dates to compare only the dates
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      return selectedDate.getTime() >= today.getTime();
    }, "A data de entrega não pode ser anterior a hoje"),
  dueTime: z.string().min(1, "Por favor, selecione a hora de entrega"),
  price: z
    .string()
    .min(1, "Por favor, informe um valor válido")
    .refine((value) => {
      const numericValue = parseFloat(value.replace(".", "").replace(",", "."));
      return !isNaN(numericValue) && numericValue > 0;
    }, "O valor deve ser maior que zero"),
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
  const { tenant } = useTenantStorage();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      description: "",
      dueDate: "",
      dueTime: "12:00",
      price: "",
    },
  });
  const {
    mutate: createOrder,
    error: createOrderError,
    data: createOrderData,
    isPending: isCreatingOrder,
    error: isCreatingOrderError,
  } = useMutation({
    mutationFn: ({
      orderData,
    }: {
      orderData: Omit<Order, "id" | "createdAt" | "updatedAt" | "tenantId">;
    }) =>
      postNomaApi(
        "/api/noma/v1/orders/create",
        { orderData },
        { params: { tenantId: tenant?.id } },
      ),
    onSuccess: () => {
      onSuccess?.(createOrderData);
      onOpenChange(false);
      toast({
        title: "Encomenda criada com sucesso",
        description:
          "Sua encomenda foi criada com sucesso! Você pode visualizá-la na lista de encomendas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar encomenda",
        description:
          "ocorreu um erro ao criar a encomenda. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
      console.log(error);
    },
  });

  const {
    mutate: updateOrder,
    error: updateOrderError,
    data: updateOrderData,
    isPending: isUpdatingOrder,
    error: isUpdatingOrderError,
  } = useMutation({
    mutationFn: ({
      orderData,
    }: {
      orderData: Omit<Order, "createdAt" | "updatedAt" | "tenantId" | "id"> & {
        id: string;
      };
    }) =>
      putNomaApi(
        `/api/noma/v1/orders/update`,
        { tenantId: tenant?.id, orderData },
        {
          params: { orderId: orderData.id },
        },
      ),
    onSuccess: () => {
      onSuccess?.(updateOrderData);
      onOpenChange(false);
      toast({
        title: "Encomenda criada com sucesso",
        description:
          "Sua encomenda foi criada com sucesso! Você pode visualizá-la na lista de encomendas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar encomenda",
        description:
          "ocorreu um erro ao criar a encomenda. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
      console.log(error);
    },
  });

  useEffect(() => {
    if (open) {
      if (mode === "edit" && orderData) {
        const date = new Date(orderData.dueDate);
        form.reset({
          clientName: orderData.clientName,
          clientPhone: orderData.clientPhone || "",
          description: orderData.description || "",
          dueDate: format(date, "yyyy-MM-dd"),
          dueTime: format(date, "HH:mm"),
          price: orderData.price.replace(".", ","),
        });
      } else {
        form.reset({
          clientName: "",
          clientPhone: "",
          description: "",
          dueDate: "",
          dueTime: "12:00",
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
      if (numbers.length <= 6)
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      if (numbers.length <= 10)
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
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
    return amount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const onSubmit = async (data: FormValues) => {
    if (!tenant) return;
    const [hours, minutes] = data.dueTime.split(":");
    const dueDate = new Date(data.dueDate + "T00:00:00");
    dueDate.setHours(parseInt(hours), parseInt(minutes));

    const orderData = {
      clientName: data.clientName,
      clientPhone: data.clientPhone || null,
      description: data.description,
      dueDate: dueDate.toISOString(),
      price: data.price.replace(".", "").replace(",", "."),
      status: "pending" as const,
      id: mode === "edit" && orderId ? orderId : undefined,
    };

    if (mode === "create") {
      createOrder({ orderData });
    } else {
      updateOrder({ orderData });
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
              name="clientName"
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
              name="clientPhone"
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
                name="dueDate"
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
                name="dueTime"
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
              <Button
                type="submit"
                disabled={isCreatingOrder || isUpdatingOrder}
                className="w-full sm:w-auto"
              >
                {isCreatingOrder || isUpdatingOrder ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;
