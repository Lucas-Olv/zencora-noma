import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Order } from "@/lib/types";
import {
  CreditCardIcon,
  ReceiptText,
  CircleDollarSign,
  CheckCircle,
  Calendar,
  User,
} from "lucide-react";
import { Separator } from "../ui/separator";

interface DeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onDelivered: () => void;
  isLoading?: boolean;
}

const getPaymentStatusLabel = (status?: string) => {
  if (status === "pending") return "Pagamento Pendente";
  if (status === "paid") return "Pagamento Efetuado";
  if (status === "partially_paid") return "Parcialmente Pago";
  return "Não informado";
};

const getPaymentMethodLabel = (method?: string) => {
  if (method === "credit_card") return "Cartão de Crédito";
  if (method === "debit_card") return "Cartão de Débito";
  if (method === "pix") return "Pix";
  if (method === "cash") return "Dinheiro";
  return "Não informado";
};

export const DeliveryDialog: React.FC<DeliveryDialogProps> = ({
  open,
  onOpenChange,
  order,
  onDelivered,
  isLoading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Iniciar Entrega</DialogTitle>
          <DialogDescription>
            Ao marcar encomenda como entregue, a quantia paga será atualizada e
            ela será finalizada e não será mais possível alterá-la.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Cliente</span>
                <div className="font-medium">{order.clientName}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Data de Entrega
                </span>
                <div>{formatDate(order.dueDate)}</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100/80 dark:bg-green-900/30 rounded-lg">
                <CircleDollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Valor</span>
                <div>R$ {order.price.replace(".", ",")}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100/80 dark:bg-blue-900/30 rounded-lg">
                <CircleDollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Quantia Paga
                </span>
                <div>
                  {order.amountPaid
                    ? `R$ ${order.amountPaid.replace(".", ",")}`
                    : "-"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 rounded-lg">
                <ReceiptText className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Estado do Pagamento
                </span>
                <div>{getPaymentStatusLabel(order.paymentStatus)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <CreditCardIcon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Método de Pagamento
                </span>
                <div>{getPaymentMethodLabel(order.paymentMethod)}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-complementary/10 rounded-lg">
              <ReceiptText className="h-5 w-5 text-complementary" />
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Descrição</span>
              <div className="text-muted-foreground">{order.description}</div>
            </div>
          </div>
        </div>
        <Separator />
        <DialogFooter>
          <Button
            onClick={onDelivered}
            disabled={isLoading}
            className="w-full"
            variant="default"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar como entregue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
