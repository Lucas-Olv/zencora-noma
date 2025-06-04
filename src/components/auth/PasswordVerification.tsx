import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { db } from "@/lib/db";
import { supabaseService } from "@/services/supabaseService";

export default function PasswordVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Extract parameters from state with default values
  const targetPath = location.state?.redirect || "/dashboard";
  const targetName = location.state?.name || "a página";
  const fromRoleSwitch = location.state?.fromRoleSwitch || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify the current session password
      const { error } = await supabaseService.auth.verifyPassword(password);

      if (error) throw error;

      // If from role switch, clear current role before redirecting
      if (fromRoleSwitch) {
        await db.updateRolesData(null);
      }

      // If password is correct, navigate to the target path with verified state
      navigate(targetPath, { 
        replace: true,
        state: { 
          ...location.state,
          verified: true 
        }
      });
    } catch (error: any) {
      toast({
        title: "Senha incorreta",
        description: "A senha fornecida está incorreta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Verificação de Senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Digite sua senha para acessar {targetName}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="sr-only">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-lg border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? "Verificando..." : "Verificar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 