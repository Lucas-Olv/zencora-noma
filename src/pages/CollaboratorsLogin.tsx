import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import CollaboratorLoginForm from "@/components/auth/CollaboratorLoginForm";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/components/ui/use-toast";

export default function CollaboratorsLogin() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const { setTenant } = useTenant();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Login de Colaboradores | Zencora Noma";

    if (!tenantId) {
      toast({
        title: "Erro",
        description: "ID do tenant não encontrado",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Define o tenant no contexto sem fazer requisição
    setTenant({ id: tenantId } as any);
    
    // Remove o tenantId da URL
    navigate("/collaborators", { replace: true });
  }, [tenantId, setTenant, navigate, toast]);

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left side - Artistic panel */}
      <div className="relative hidden md:flex flex-col bg-gradient-to-br from-primary to-complementary">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-complementary/80" />
        
        <div className="relative z-10 p-8">
          <Link to="/" className="flex items-center text-2xl font-bold text-white">
            <img src="/noma-logo.svg" alt="Zencora Noma Logo" className="h-8 mr-2" />
            <p>Zencora Noma</p>
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-center relative z-10 p-8">
          <div className="max-w-md text-white space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold">
              Área do Colaborador
            </h1>
            <p className="text-white/80 text-lg">
              Acesse o sistema para gerenciar suas tarefas e acompanhar o progresso das encomendas.
            </p>
          </div>
        </div>
        
        <div className="relative z-10 p-8 text-white/60 text-sm">
          © {new Date().getFullYear()} Zencora. Todos os direitos reservados.
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="flex flex-col">
        <div className="flex justify-between items-center py-4 px-8">
          <Link to="/" className="flex items-center text-2xl font-bold zencora-gradient-text md:hidden">
            <img src="/noma-logo.svg" alt="Zencora Noma Logo" className="h-8 mr-2" />
            Zencora Noma
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <CollaboratorLoginForm />
        </div>
      </div>
    </div>
  );
} 