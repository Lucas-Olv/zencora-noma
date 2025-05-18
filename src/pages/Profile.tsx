import { useEffect } from "react";

const Profile = () => {
  useEffect(() => {
    document.title = "Meu Perfil | Zencora Noma";
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Meu Perfil</h2>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e preferências.
        </p>
      </div>

      <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
        <p>Gerenciamento de perfil em desenvolvimento.</p>
        <p>
          Em breve você poderá atualizar suas informações pessoais e
          preferências.
        </p>
      </div>
    </div>
  );
};

export default Profile;
