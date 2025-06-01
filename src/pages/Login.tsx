import { LoginForm } from "@/components/auth/LoginForm";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left side - Artistic panel */}
      <div className="relative hidden md:flex flex-col bg-gradient-to-br from-primary to-secondary">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/80" />

        <div className="relative z-10 p-8">
          <Link
            to="/"
            className="flex items-center text-2xl font-bold text-white"
          >
            <img
              src="/zencora-noma-logo.svg"
              alt="Zencora Noma Logo"
              className="h-8 mr-2"
            />
            <p>Zencora Noma</p>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center relative z-10 p-8">
          <div className="max-w-md text-white space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold">
              Gerencie suas encomendas com facilidade
            </h1>
            <p className="text-white/80 text-lg">
              O Noma é o aplicativo ideal para pequenos empreendedores que
              precisam de agilidade e organização no dia a dia.
            </p>
          </div>
        </div>

        <div className="relative z-10 p-8 text-white/60 text-sm">
          © {new Date().getFullYear()} Zencora. Todos os direitos reservados.
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex flex-col p-4">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center text-2xl font-bold zencora-gradient-text md:hidden"
          >
            <img
              src="/zencora-noma-logo.png"
              alt="Zencora Noma Logo"
              className="h-8 mr-2"
            />
            Zencora Noma
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
