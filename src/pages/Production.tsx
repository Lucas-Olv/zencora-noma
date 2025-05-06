
import { useEffect } from "react";
import ProductionView from "@/components/production/ProductionView";

const Production = () => {
  useEffect(() => {
    document.title = "Produção | Zencora Noma";
  }, []);

  return <ProductionView />;
};

export default Production;
