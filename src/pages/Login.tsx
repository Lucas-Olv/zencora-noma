import { useEffect } from "react";
import LoginForm from "@/components/auth/LoginForm";
import ThemeToggle from "@/components/layout/ThemeToggle";

const Login = () => {
  useEffect(() => {
    document.title = "Login | Zencora Noma";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex flex-col items-center pt-12 px-4 gap-8">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            Z
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight zencora-gradient-text mb-2">
            Zencora Noma
          </h1>
          <p className="text-muted-foreground">
            Simplifique o gerenciamento de suas encomendas criativas
          </p>
        </div>
        
        <LoginForm />
      </div>
      
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>© 2025 Zencora. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Login;
