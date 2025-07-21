import { useEffect } from "react";
import DeliveryView from "@/components/delivery/DeliveryView";

const Production = () => {
  useEffect(() => {
    document.title = "Entregas | Zencora Noma";
  }, []);

  return <DeliveryView />;
};

export default Production;
