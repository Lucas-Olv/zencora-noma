
import { useEffect } from "react";
import OrderForm from "@/components/orders/OrderForm";

const NewOrder = () => {
  useEffect(() => {
    document.title = "Nova Encomenda | Zencora Noma";
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Nova Encomenda</h2>
        <p className="text-muted-foreground">
          Registre uma nova encomenda preenchendo os dados abaixo.
        </p>
      </div>

      <OrderForm />
    </div>
  );
};

export default NewOrder;
