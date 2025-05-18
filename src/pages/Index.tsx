import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const Index = () => {
  useEffect(() => {
    document.title = "Zencora Noma";
  }, []);

  // Redirect to login page
  return <Navigate to="/" replace />;
};

export default Index;
