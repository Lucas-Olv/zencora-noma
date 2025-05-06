
import { useEffect } from "react";
import OrderList from "@/components/orders/OrderList";

const Orders = () => {
  useEffect(() => {
    document.title = "Encomendas | Zencora Noma";
  }, []);

  return (
    <OrderList />
  );
};

export default Orders;
