import { useEffect } from "react";
import OrdersView from "@/components/orders/OrdersView";

const Orders = () => {
  useEffect(() => {
    document.title = "Encomendas | Zencora Noma";
  }, []);

  return <OrdersView />;
};

export default Orders;
