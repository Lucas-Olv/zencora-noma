import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { settingsService, rolesService, RoleType, SettingsType } from "@/services/supabaseService";

const DEFAULT_SETTINGS: Omit<SettingsType, "id" | "created_at" | "updated_at"> = {
  enable_roles: false,
  lock_reports_by_password: false,
  require_password_to_switch_role: false,
  tenant_id: "",
};

export default function SettingsView() {
  const { tenant } = useAuthContext();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [isDeleteRoleDialogOpen, setIsDeleteRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [newRole, setNewRole] = useState<Partial<RoleType>>({
    name: "",
    can_access_reports: false,
    can_access_calendar: false,
    can_access_production: false,
    can_access_orders: false,
    can_access_reminders: false,
    can_access_settings: false,
    can_access_dashboard: false,
    can_create_orders: false,
    can_delete_orders: false,
    can_update_orders: false,
  });

  useEffect(() => {
    if (tenant?.id) {
      initializeSettings();
      fetchRoles();
    }
  }, [tenant]);

  const initializeSettings = async () => {
    try {
      const { data, error } = await settingsService.getTenantSettings(tenant?.id);
      
      if (error && error.code === "PGRST116") { // Registro não encontrado
        // Criar configurações padrão
        const { data: newSettings, error: createError } = await settingsService.upsertSettings({
          ...DEFAULT_SETTINGS,
          tenant_id: tenant?.id,
        });

        if (createError) throw createError;
        setSettings(newSettings);
      } else if (error) {
        throw error;
      } else {
        setSettings(data);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const fetchRoles = async () => {
    if (!settings?.enable_roles) return;
    
    try {
      const { data, error } = await rolesService.getTenantRoles(tenant?.id);
      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar papéis",
        description: "Não foi possível carregar os papéis. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSettings = async (field: keyof SettingsType, value: boolean) => {
    try {
      if (!settings || !tenant?.id) return;

      const { data, error } = await settingsService.upsertSettings({
        ...settings,
        [field]: value,
        tenant_id: tenant.id,
      });

      if (error) throw error;
      setSettings(data);

      // Se a funcionalidade de papéis foi ativada, buscar os papéis
      if (field === "enable_roles" && value) {
        fetchRoles();
      }

      toast({
        title: "Configurações atualizadas",
        description: "As configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar configurações",
        description: "Não foi possível atualizar as configurações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCreateRole = async () => {
    try {
      if (!tenant?.id) return;

      const { data, error } = await rolesService.createRole({
        ...newRole,
        tenant_id: tenant.id,
      } as RoleType);

      if (error) throw error;

      setRoles((prev) => [...prev, data]);
      setIsCreateRoleDialogOpen(false);
      setNewRole({
        name: "",
        can_access_reports: false,
        can_access_calendar: false,
        can_access_production: false,
        can_access_orders: false,
        can_access_reminders: false,
        can_access_settings: false,
        can_access_dashboard: false,
        can_create_orders: false,
        can_delete_orders: false,
        can_update_orders: false,
      });

      toast({
        title: "Papel criado",
        description: "O papel foi criado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar papel",
        description: "Não foi possível criar o papel. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = async () => {
    try {
      if (!selectedRole) return;

      const { data, error } = await rolesService.updateRole(selectedRole.id, selectedRole);

      if (error) throw error;

      setRoles((prev) =>
        prev.map((role) => (role.id === selectedRole.id ? data : role))
      );
      setIsEditRoleDialogOpen(false);
      toast({
        title: "Papel atualizado",
        description: "O papel foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar papel",
        description: "Não foi possível atualizar o papel. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRole = async () => {
    try {
      if (!selectedRole) return;

      const { error } = await rolesService.deleteRole(selectedRole.id);

      if (error) throw error;

      setRoles((prev) => prev.filter((role) => role.id !== selectedRole.id));
      setIsDeleteRoleDialogOpen(false);
      setSelectedRole(null);
      toast({
        title: "Papel excluído",
        description: "O papel foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir papel",
        description: "Não foi possível excluir o papel. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema e papéis de usuários.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Card de Configurações */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ativar funcionalidade de papéis</Label>
                <p className="text-sm text-muted-foreground">
                  Permite criar e gerenciar papéis de usuário com diferentes permissões.
                </p>
              </div>
              <Switch
                checked={settings?.enable_roles}
                onCheckedChange={(checked) => handleUpdateSettings("enable_roles", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Bloquear relatórios por senha</Label>
                <p className="text-sm text-muted-foreground">
                  Exige senha para acessar os relatórios.
                </p>
              </div>
              <Switch
                checked={settings?.lock_reports_by_password}
                onCheckedChange={(checked) =>
                  handleUpdateSettings("lock_reports_by_password", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Exigir senha para trocar de papel</Label>
                <p className="text-sm text-muted-foreground">
                  Exige senha ao trocar entre papéis de usuário.
                </p>
              </div>
              <Switch
                checked={settings?.require_password_to_switch_role}
                onCheckedChange={(checked) =>
                  handleUpdateSettings("require_password_to_switch_role", checked)
                }
                disabled={!settings?.enable_roles}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card de Papéis - Só exibe se a funcionalidade estiver ativada */}
        {settings?.enable_roles && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Papéis</CardTitle>
              <Button
                onClick={() => setIsCreateRoleDialogOpen(true)}
                className="ml-auto"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Papel
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <span className="font-medium">{role.name}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedRole(role);
                          setIsEditRoleDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedRole(role);
                          setIsDeleteRoleDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de Criar Papel */}
      <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Papel</DialogTitle>
            <DialogDescription>
              Defina o nome e as permissões do novo papel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Papel</Label>
              <Input
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                placeholder="Ex: Gerente, Vendedor, etc."
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <Label>Permissões de Acesso</Label>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label>Dashboard</Label>
                  <Switch
                    checked={newRole.can_access_dashboard}
                    onCheckedChange={(checked) =>
                      setNewRole({ ...newRole, can_access_dashboard: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Relatórios</Label>
                  <Switch
                    checked={newRole.can_access_reports}
                    onCheckedChange={(checked) =>
                      setNewRole({ ...newRole, can_access_reports: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Calendário</Label>
                  <Switch
                    checked={newRole.can_access_calendar}
                    onCheckedChange={(checked) =>
                      setNewRole({ ...newRole, can_access_calendar: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Produção</Label>
                  <Switch
                    checked={newRole.can_access_production}
                    onCheckedChange={(checked) =>
                      setNewRole({ ...newRole, can_access_production: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Encomendas</Label>
                  <Switch
                    checked={newRole.can_access_orders}
                    onCheckedChange={(checked) =>
                      setNewRole({ ...newRole, can_access_orders: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Lembretes</Label>
                  <Switch
                    checked={newRole.can_access_reminders}
                    onCheckedChange={(checked) =>
                      setNewRole({ ...newRole, can_access_reminders: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Configurações</Label>
                  <Switch
                    checked={newRole.can_access_settings}
                    onCheckedChange={(checked) =>
                      setNewRole({ ...newRole, can_access_settings: checked })
                    }
                  />
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <Label>Permissões de Encomendas</Label>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label>Criar Encomendas</Label>
                  <Switch
                    checked={newRole.can_create_orders}
                    onCheckedChange={(checked) =>
                      setNewRole({ ...newRole, can_create_orders: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Atualizar Encomendas</Label>
                  <Switch
                    checked={newRole.can_update_orders}
                    onCheckedChange={(checked) =>
                      setNewRole({ ...newRole, can_update_orders: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Excluir Encomendas</Label>
                  <Switch
                    checked={newRole.can_delete_orders}
                    onCheckedChange={(checked) =>
                      setNewRole({ ...newRole, can_delete_orders: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateRoleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRole}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Editar Papel */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Papel</DialogTitle>
            <DialogDescription>
              Modifique o nome e as permissões do papel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Papel</Label>
              <Input
                value={selectedRole?.name}
                onChange={(e) =>
                  setSelectedRole(
                    selectedRole ? { ...selectedRole, name: e.target.value } : null
                  )
                }
                placeholder="Ex: Gerente, Vendedor, etc."
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <Label>Permissões de Acesso</Label>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label>Dashboard</Label>
                  <Switch
                    checked={selectedRole?.can_access_dashboard}
                    onCheckedChange={(checked) =>
                      setSelectedRole(
                        selectedRole
                          ? { ...selectedRole, can_access_dashboard: checked }
                          : null
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Relatórios</Label>
                  <Switch
                    checked={selectedRole?.can_access_reports}
                    onCheckedChange={(checked) =>
                      setSelectedRole(
                        selectedRole
                          ? { ...selectedRole, can_access_reports: checked }
                          : null
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Calendário</Label>
                  <Switch
                    checked={selectedRole?.can_access_calendar}
                    onCheckedChange={(checked) =>
                      setSelectedRole(
                        selectedRole
                          ? { ...selectedRole, can_access_calendar: checked }
                          : null
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Produção</Label>
                  <Switch
                    checked={selectedRole?.can_access_production}
                    onCheckedChange={(checked) =>
                      setSelectedRole(
                        selectedRole
                          ? { ...selectedRole, can_access_production: checked }
                          : null
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Encomendas</Label>
                  <Switch
                    checked={selectedRole?.can_access_orders}
                    onCheckedChange={(checked) =>
                      setSelectedRole(
                        selectedRole
                          ? { ...selectedRole, can_access_orders: checked }
                          : null
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Lembretes</Label>
                  <Switch
                    checked={selectedRole?.can_access_reminders}
                    onCheckedChange={(checked) =>
                      setSelectedRole(
                        selectedRole
                          ? { ...selectedRole, can_access_reminders: checked }
                          : null
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Configurações</Label>
                  <Switch
                    checked={selectedRole?.can_access_settings}
                    onCheckedChange={(checked) =>
                      setSelectedRole(
                        selectedRole
                          ? { ...selectedRole, can_access_settings: checked }
                          : null
                      )
                    }
                  />
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <Label>Permissões de Encomendas</Label>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label>Criar Encomendas</Label>
                  <Switch
                    checked={selectedRole?.can_create_orders}
                    onCheckedChange={(checked) =>
                      setSelectedRole(
                        selectedRole
                          ? { ...selectedRole, can_create_orders: checked }
                          : null
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Atualizar Encomendas</Label>
                  <Switch
                    checked={selectedRole?.can_update_orders}
                    onCheckedChange={(checked) =>
                      setSelectedRole(
                        selectedRole
                          ? { ...selectedRole, can_update_orders: checked }
                          : null
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Excluir Encomendas</Label>
                  <Switch
                    checked={selectedRole?.can_delete_orders}
                    onCheckedChange={(checked) =>
                      setSelectedRole(
                        selectedRole
                          ? { ...selectedRole, can_delete_orders: checked }
                          : null
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateRole}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Excluir Papel */}
      <AlertDialog open={isDeleteRoleDialogOpen} onOpenChange={setIsDeleteRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Papel</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o papel "{selectedRole?.name}"? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteRoleDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
