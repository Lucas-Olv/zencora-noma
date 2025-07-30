import { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
import { useSettingsStorage } from "@/storage/settings";
import { Order } from "@/lib/types";
import { patchNomaApi, postNomaApi } from "@/lib/apiHelpers";
import dayjs from "@/lib/dayjs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAnalytics } from "@/contexts/AnalyticsProviderContext";

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
      return dayjs(date).isSameOrAfter(dayjs(), "day");
    }, "A data de entrega não pode ser anterior a hoje"),
  dueTime: z.string().min(1, "Por favor, selecione a hora de entrega"),
  paymentStatus: z
    .string()
    .min(1, "Por favor, selecione o estado do pagamento"),
  paymentMethod: z.string().optional(),
  amountPaid: z.string().optional(),
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
  const { settings } = useSettingsStorage();
  const isMobile = useIsMobile();
  const { trackEvent } = useAnalytics();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      description: "",
      dueDate: "",
      dueTime: "12:00",
      price: "",
      paymentStatus: "",
      paymentMethod: "",
      amountPaid: "",
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
      trackEvent("order_created");
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
      patchNomaApi(
        `/api/noma/v1/orders/update`,
        { tenantId: tenant?.id, orderData },
        {
          params: { orderId: orderData.id },
        },
      ),
    onSuccess: () => {
      onSuccess?.(updateOrderData);
      onOpenChange(false);
      trackEvent("order_updated");
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
        form.reset({
          clientName: orderData.clientName,
          clientPhone: orderData.clientPhone || "",
          description: orderData.description || "",
          dueDate: dayjs(orderData.dueDate).format("YYYY-MM-DD"),
          dueTime: dayjs(orderData.dueDate).format("HH:mm"),
          price: orderData.price.replace(".", ","),
          paymentStatus: orderData.paymentStatus || "",
          paymentMethod: orderData.paymentMethod || "",
        });
      } else {
        form.reset({
          clientName: "",
          clientPhone: "",
          description: "",
          dueDate: "",
          dueTime: "12:00",
          price: "",
          paymentStatus: "",
          paymentMethod: "",
        });
      }
    }
  }, [open, mode, orderData, form]);

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

  const formatPrice = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length === 0) return "";
    const amount = parseInt(numbers) / 100;
    return amount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const onSubmit = async (data: FormValues) => {
    if (!tenant) return;
    const [hours, minutes] = data.dueTime.split(":");
    const dueDate = dayjs(data.dueDate)
      .hour(parseInt(hours))
      .minute(parseInt(minutes));

    const orderPayload = {
      clientName: data.clientName,
      clientPhone: data.clientPhone || null,
      description: data.description,
      dueDate: dueDate.toISOString(),
      price: data.price.replace(".", "").replace(",", "."),
      status: "pending" as const,
      paymentStatus: data.paymentStatus as
        | "pending"
        | "paid"
        | "partially_paid",
      paymentMethod: data.paymentMethod as
        | "credit_card"
        | "debit_card"
        | "pix"
        | "cash"
        | undefined,
      id: mode === "edit" && orderId ? orderId : undefined,
      amountPaid: data.amountPaid,
    };

    if (mode === "create") {
      if (
        settings?.enablePartialPaymentAmount &&
        orderPayload.paymentStatus === "partially_paid"
      ) {
        const amountPaid =
          (parseInt(settings?.partialPaymentPercentage) / 100) *
          parseFloat(orderPayload.price);
        orderPayload.amountPaid = amountPaid.toFixed(2);
      } else if (orderPayload.paymentStatus === "paid") {
        orderPayload.amountPaid = orderPayload.price;
      }
      createOrder({ orderData: orderPayload });
    } else {
      updateOrder({ orderData: orderPayload });
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
                  <FormLabel>Nome do Cliente *</FormLabel>
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
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={isMobile ? 2 : 6}
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
                  <FormItem className="w-full">
                    <FormLabel>Data de Entrega *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        min={dayjs().format("YYYY-MM-DD")}
                        className="w-full [&::-webkit-datetime-edit-fields-wrapper]:p-0 [&::-webkit-date-and-time-value]:text-left [&::-webkit-calendar-picker-indicator]:ml-auto"
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
                  <FormItem className="w-full">
                    <FormLabel>Hora de Entrega *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="time"
                        className="w-full [&::-webkit-datetime-edit-fields-wrapper]:p-0 [&::-webkit-date-and-time-value]:text-left [&::-webkit-calendar-picker-indicator]:ml-auto"
                      />
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
                  <FormLabel>Preço (R$) *</FormLabel>
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

            <div
              className={cn(
                mode === "create"
                  ? "grid grid-cols-2 gap-4"
                  : "grid grid-cols-1 gap-4",
              )}
            >
              {mode === "create" && (
                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pagamento *</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent className="z-[200]">
                            <SelectItem value="pending">
                              Pagamento Pendente
                            </SelectItem>
                            <SelectItem value="paid">
                              Pagamento Efetuado
                            </SelectItem>
                            {settings?.enablePartialPaymentAmount && (
                              <SelectItem value="partially_paid">{`Parcialmente Pago - ${settings?.partialPaymentPercentage}%`}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Pagamento</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          <SelectItem value="credit_card">
                            Cartão de Crédito
                          </SelectItem>
                          <SelectItem value="debit_card">
                            Cartão de Débito
                          </SelectItem>
                          <SelectItem value="pix">Pix</SelectItem>
                          <SelectItem value="cash">Dinheiro</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
