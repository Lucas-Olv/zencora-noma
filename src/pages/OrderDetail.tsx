import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDate, parseDate } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  ReceiptText,
  CreditCardIcon,
  Edit,
  Trash,
  Package,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import OrderDialog from "@/components/orders/OrderDialog";
import { SettingsGate } from "@/components/settings/SettingsGate";
import { Order } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { delNomaAPi, getNomaApi, patchNomaApi } from "@/lib/apiHelpers";
import { useTenantStorage } from "@/storage/tenant";

const getStatusDisplay = (status: string | null, dueDate?: string | null) => {
  switch (status) {
    case "pending":
      // Verifica se está atrasado
      if (dueDate && new Date(dueDate) < new Date()) {
        return {
          label: "Atrasado",
          className:
            "bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50",
        };
      }
      return {
        label: "Pendente",
        className:
          "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
      };
    case "production":
      // Verifica se está atrasado
      if (dueDate && new Date(dueDate) < new Date()) {
        return {
          label: "Atrasado",
          className:
            "bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50",
        };
      }
      return {
        label: "Produção",
        className:
          "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50",
      };
    case "done":
      return {
        label: "Concluído",
        className:
          "bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50",
      };
    case "delivered":
      return {
        label: "Entregue",
        className:
          "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50",
      };
    case "canceled":
      return {
        label: "Cancelado",
        className:
          "bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50",
      };
    default:
      return {
        label: "Pendente",
        className:
          "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
      };
  }
};

const AutoResizeTextarea = ({
  value,
  className,
}: {
  value: string;
  className?: string;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
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
  const [order, setOrder] = useState<Order | null>(null);
  const { tenant } = useTenantStorage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    data: orderData,
    isLoading: isOrderLoading,
    isError: isOrderError,
    refetch,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () =>
      getNomaApi(`/api/noma/v1/orders`, {
        params: { tenantId: tenant?.id, orderId: id },
      }),
  });

  useEffect(() => {
    document.title = "Detalhes da Encomenda | Zencora Noma";
    if (orderData) {
      setOrder(orderData.data);
    }
  }, [orderData, isOrderLoading, isOrderError]);

  const {
    mutate: updateOrderStatus,
    error: updateOrderStatusError,
    data: updatedOrderData,
    isPending: isUpdateOrderStatus,
    error: isUpdateOrderStatusError,
  } = useMutation({
    mutationFn: ({
      status,
    }: {
      status: "pending" | "production" | "done" | "canceled" | "delivered";
    }) =>
      patchNomaApi(
        `/api/noma/v1/orders/update`,
        { tenantId: tenant?.id, orderData: { status } },
        {
          params: { orderId: id },
        },
      ),
    onSuccess: (_data, variables) => {
      toast({
        title: "Encomenda atualizada com sucesso",
        description: "O status da encomenda foi atualizado com sucesso!",
      });
      setOrder((prevOrder) =>
        prevOrder ? { ...prevOrder, status: variables.status } : prevOrder,
      );
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar encomenda",
        description:
          "ocorreu um erro ao atualizar o status da encomenda. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
      console.log(error);
    },
  });

  const {
    mutate: deleteOrder,
    error: deleteOrderError,
    isPending: isDeleteOrder,
    error: isDeleteOrderError,
  } = useMutation({
    mutationFn: () =>
      delNomaAPi(`/api/noma/v1/orders/delete`, {
        params: { tenantId: tenant?.id, orderId: id },
      }),
    onSuccess: () => {
      toast({
        title: "Encomenda excluída com sucesso",
        description: "A encomenda foi excluÍda com sucesso!",
      });

      navigate("/orders");
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir encomenda",
        description:
          "ocorreu um erro ao excluir a encomenda. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
      console.log(error);
    },
  });

  const handleOrderUpdate = () => {
    refetch();
  };

  if (isOrderLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Encomenda não encontrada
        </h2>
        <p className="text-muted-foreground">
          A encomenda solicitada não existe ou foi removida.
        </p>
        <Button onClick={() => navigate("/orders")}>
          Voltar para encomendas
        </Button>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(order.status, order.dueDate);
  const isFinalized =
    order.status === "canceled" || order.status === "delivered";

  if (isFinalized) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Detalhes da Encomenda
              </h2>
              <p className="text-muted-foreground">
                Visualize os detalhes desta encomenda
              </p>
            </div>
          </div>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <CardTitle className="text-xl truncate max-w-[50dvw]">
              {order.clientName}
            </CardTitle>
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
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Data de Entrega
                  </p>
                  <p className="font-medium">{formatDate(order.dueDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100/80 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-medium">
                    R$ {order.price.replace(".", ",")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-complementary/10 rounded-lg">
                  <Clock className="h-5 w-5 text-complementary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Criada em</p>
                  <p className="font-medium">
                    {formatDate(order.createdAt, "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 rounded-lg">
                  <ReceiptText className="h-5 w-5 bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Estado do pagamento
                  </p>
                  <p className="font-medium">
                    {order.paymentStatus === "pending" && "Pagamento Pendente"}
                    {order.paymentStatus === "paid" && "Pagamento Efetuado"}
                    {order.paymentStatus === "partially_paid" &&
                      "Parcialmente Pago"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <CreditCardIcon className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Método de pagamento
                  </p>
                  <p className="font-medium">
                    {order.paymentMethod === "credit_card" &&
                      "Cartão de Crédito"}
                    {order.paymentMethod === "debit_card" && "Cartão de Débito"}
                    {order.paymentMethod === "pix" && "Pix"}
                    {order.paymentMethod === "cash" && "Dinheiro"}
                    {!order.paymentMethod && "Não informado"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-6 border-t">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Caso não seja finalizada, retorna layout completo
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Detalhes da Encomenda
            </h2>
            <p className="text-muted-foreground">
              Visualize e gerencie os detalhes desta encomenda
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <CardTitle className="text-xl truncate max-w-[50dvw]">
            {order.clientName}
          </CardTitle>
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

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Entrega</p>
                <p className="font-medium">{formatDate(order.dueDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100/80 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="font-medium">
                  R$ {order.price.replace(".", ",")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-complementary/10 rounded-lg">
                <Clock className="h-5 w-5 text-complementary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Criada em</p>
                <p className="font-medium">
                  {formatDate(order.createdAt, "dd/MM/yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 rounded-lg">
                <ReceiptText className="h-5 w-5 bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Estado do pagamento
                </p>
                <p className="font-medium">
                  {order.paymentStatus === "pending" && "Pagamento Pendente"}
                  {order.paymentStatus === "paid" && "Pagamento Efetuado"}
                  {order.paymentStatus === "partially_paid" &&
                    "Parcialmente Pago"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <CreditCardIcon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Método de pagamento
                </p>
                <p className="font-medium">
                  {order.paymentMethod === "credit_card" && "Cartão de Crédito"}
                  {order.paymentMethod === "debit_card" && "Cartão de Débito"}
                  {order.paymentMethod === "pix" && "Pix"}
                  {order.paymentMethod === "cash" && "Dinheiro"}
                  {!order.paymentMethod && "Não informado"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-6 border-t">
            <div className="w-full">
              <h3 className="font-semibold mb-3">Ações</h3>
              <div className="grid grid-rows-2 sm:grid-cols-1 gap-3">
                <SettingsGate permission="edit">
                  {isFinalized ? (
                    <Button
                      onClick={() => navigate(-1)}
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Voltar
                    </Button>
                  ) : (
                    <>
                      {order.status !== "pending" && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            updateOrderStatus({ status: "pending" })
                          }
                        >
                          <Clock className="h-4 w-4 row-span-full mr-2" />
                          Marcar como Pendente
                        </Button>
                      )}
                      {order.status !== "production" && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            updateOrderStatus({ status: "production" })
                          }
                        >
                          <Package className="h-4 w-4 row-span-full mr-2" />
                          Marcar como Produção
                        </Button>
                      )}
                      {order.status !== "done" && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => updateOrderStatus({ status: "done" })}
                        >
                          <CheckCircle className="h-4 w-4 row-span-full mr-2" />
                          Marcar como Concluída
                        </Button>
                      )}
                    </>
                  )}
                </SettingsGate>
              </div>
            </div>
          </CardFooter>
      </Card>
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6">
            <div className="grid grid-rows-2 sm:grid-cols-1 gap-3">
              <SettingsGate permission="edit">
                {!isFinalized && (
                  <Button
                    variant="defaultText"
                    size="sm"
                    onClick={() => setDialogOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}
              </SettingsGate>

              <SettingsGate permission="delete">
                {!isFinalized && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir encomenda?</AlertDialogTitle>
                        <AlertDialogDescription className="line-clamp-3 max-w-[80dvw] md:max-w-[18dvw]">
                          Esta ação não poderá ser desfeita. Isso excluirá
                          permanentemente a encomenda do cliente{" "}
                          {order?.clientName}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => deleteOrder()}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Button
                  onClick={() => navigate(-1)}
                  variant="outline"
                  size="sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
              </SettingsGate>
            </div>
          </CardContent>
        </Card>
      <OrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode="edit"
        orderId={id}
        orderData={order || undefined}
        onSuccess={handleOrderUpdate}
      />
    </div>
  );
};

export default OrderDetail;
