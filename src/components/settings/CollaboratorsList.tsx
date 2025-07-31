import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useToast } from "@/components/ui/use-toast";
import { Collaborator } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Edit,
  Trash2,
  User,
  Plus,
  Calendar,
  FileText,
  Settings,
  BarChart3,
  Bell,
  Home,
  PackageCheck,
  PackageOpen,
  Copy,
} from "lucide-react";

interface CollaboratorsListProps {
  collaborators: Collaborator[];
  isLoading: boolean;
  tenantId?: string;
  onEdit: (collaborator: Collaborator) => void;
  onDelete: (collaboratorId: string) => void;
  onToggleStatus: (
    collaboratorId: string,
    status: "active" | "revoked",
  ) => void;
  onCreateNew: () => void;
}

export default function CollaboratorsList({
  collaborators,
  isLoading,
  tenantId,
  onEdit,
  onDelete,
  onToggleStatus,
  onCreateNew,
}: CollaboratorsListProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collaboratorToDelete, setCollaboratorToDelete] =
    useState<Collaborator | null>(null);

  // Garantir que collaborators seja sempre um array
  const safeCollaborators = Array.isArray(collaborators) ? collaborators : [];

  // Função para copiar o link de acesso
  const handleCopyAccessLink = async () => {
    if (!tenantId) return;

    const accessLink = `${window.location.origin}/collaborators/${tenantId}`;

    try {
      await navigator.clipboard.writeText(accessLink);
      toast({
        title: "Link copiado",
        description:
          "O link de acesso foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (collaborator: Collaborator) => {
    setCollaboratorToDelete(collaborator);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (collaboratorToDelete) {
      onDelete(collaboratorToDelete.id);
      setDeleteDialogOpen(false);
      setCollaboratorToDelete(null);
    }
  };

  const handleToggleStatus = (collaborator: Collaborator) => {
    const newStatus = collaborator.status === "active" ? "revoked" : "active";
    onToggleStatus(collaborator.id, newStatus);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Ativo</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      case "revoked":
        return <Badge variant="destructive">Desabilitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAccessIcon = (access: string) => {
    switch (access) {
      case "dashboard":
        return <Home className="h-4 w-4" />;
      case "orders":
        return <FileText className="h-4 w-4" />;
      case "calendar":
        return <Calendar className="h-4 w-4" />;
      case "production":
        return <PackageOpen className="h-4 w-4" />;
      case "delivery":
        return <PackageCheck className="h-4 w-4" />;
      case "reminders":
        return <Bell className="h-4 w-4" />;
      case "reports":
        return <BarChart3 className="h-4 w-4" />;
      case "settings":
        return <Settings className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getAccessCount = (collaborator: Collaborator) => {
    const accesses = [
      collaborator.canAccessDashboard,
      collaborator.canAccessOrders,
      collaborator.canAccessCalendar,
      collaborator.canAccessProduction,
      collaborator.canAccessDelivery,
      collaborator.canAccessReminders,
      collaborator.canAccessReports,
      collaborator.canAccessSettings,
    ];
    return accesses.filter(Boolean).length;
  };

  const getAccessText = (collaborator: Collaborator) => {
    const count = getAccessCount(collaborator);
    if (count === 0) {
      return "Nenhuma permissão configurada";
    } else if (count === 1) {
      return "1 permissão configurada: ";
    } else {
      return `${count} permissões configuradas:  `;
    }
  };

  // Componente para card mobile
  const MobileCollaboratorCard = ({
    collaborator,
  }: {
    collaborator: Collaborator;
  }) => (
    <div className="p-4 border rounded-lg space-y-3">
      {/* Header com avatar e nome */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between space-x-2">
            <h3 className="font-medium truncate max-w-[30dvw]">
              {collaborator.name}
            </h3>
            {getStatusBadge(collaborator.status)}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {collaborator.email}
          </p>
        </div>
      </div>

      {/* Permissões */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {getAccessText(collaborator)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {collaborator.canAccessDashboard && (
            <div className="flex items-center space-x-1 text-xs bg-primary/10 px-2 py-1 rounded">
              <Home className="h-3 w-3" />
              <span>Dashboard</span>
            </div>
          )}
          {collaborator.canAccessOrders && (
            <div className="flex items-center space-x-1 text-xs bg-primary/10 px-2 py-1 rounded">
              <FileText className="h-3 w-3" />
              <span>Pedidos</span>
            </div>
          )}
          {collaborator.canAccessCalendar && (
            <div className="flex items-center space-x-1 text-xs bg-primary/10 px-2 py-1 rounded">
              <Calendar className="h-3 w-3" />
              <span>Calendário</span>
            </div>
          )}
          {collaborator.canAccessProduction && (
            <div className="flex items-center space-x-1 text-xs bg-primary/10 px-2 py-1 rounded">
              <PackageOpen className="h-3 w-3" />
              <span>Produção</span>
            </div>
          )}
          {collaborator.canAccessDelivery && (
            <div className="flex items-center space-x-1 text-xs bg-primary/10 px-2 py-1 rounded">
              <PackageCheck className="h-3 w-3" />
              <span>Entrega</span>
            </div>
          )}
          {collaborator.canAccessReminders && (
            <div className="flex items-center space-x-1 text-xs bg-primary/10 px-2 py-1 rounded">
              <Bell className="h-3 w-3" />
              <span>Lembretes</span>
            </div>
          )}
          {collaborator.canAccessReports && (
            <div className="flex items-center space-x-1 text-xs bg-primary/10 px-2 py-1 rounded">
              <BarChart3 className="h-3 w-3" />
              <span>Relatórios</span>
            </div>
          )}
          {collaborator.canAccessSettings && (
            <div className="flex items-center space-x-1 text-xs bg-primary/10 px-2 py-1 rounded">
              <Settings className="h-3 w-3" />
              <span>Configurações</span>
            </div>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Ativo</span>
          <Switch
            checked={collaborator.status === "active"}
            onCheckedChange={() => handleToggleStatus(collaborator)}
          />
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(collaborator)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(collaborator)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Controle de Acesso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={
                isMobile
                  ? "p-4 border rounded-lg space-y-3"
                  : "flex items-center justify-between p-4 border rounded-lg"
              }
            >
              {isMobile ? (
                <>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <div className="flex flex-wrap gap-1">
                      {[1, 2, 3].map((j) => (
                        <Skeleton key={j} className="h-6 w-16" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Skeleton className="h-6 w-16" />
                    <div className="flex space-x-1">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20" />
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (safeCollaborators.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Controle de Acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Nenhum colaborador encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando colaboradores para gerenciar o acesso ao
              sistema.
            </p>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Colaborador
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-6">
          <CardTitle className="text-xl">Controle de Acesso</CardTitle>
          <Button className="w-full md:w-auto" onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Colaborador
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seção do Link de Acesso */}
          <div className="space-y-4">
            {isMobile ? (
              // Layout mobile compacto
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">
                  Link de acesso de colaboradores
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAccessLink}
                  disabled={!tenantId}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              // Layout desktop completo
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium">
                    Link de Acesso dos Colaboradores
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Compartilhe este link com os colaboradores para que eles
                    possam acessar o sistema.
                  </p>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-muted-foreground truncate">
                      {tenantId
                        ? `${window.location.origin}/collaborators/${tenantId}`
                        : "Carregando..."}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAccessLink}
                    disabled={!tenantId}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              </>
            )}
          </div>

          <Separator />

          {safeCollaborators.map((collaborator, index) => (
            <div key={collaborator.id}>
              {isMobile ? (
                <MobileCollaboratorCard collaborator={collaborator} />
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{collaborator.name}</h3>
                        {getStatusBadge(collaborator.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {collaborator.email}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {getAccessText(collaborator)}
                        </span>
                        <div className="flex space-x-1">
                          {collaborator.canAccessDashboard &&
                            getAccessIcon("dashboard")}
                          {collaborator.canAccessOrders &&
                            getAccessIcon("orders")}
                          {collaborator.canAccessCalendar &&
                            getAccessIcon("calendar")}
                          {collaborator.canAccessProduction &&
                            getAccessIcon("production")}
                          {collaborator.canAccessDelivery &&
                            getAccessIcon("delivery")}
                          {collaborator.canAccessReminders &&
                            getAccessIcon("reminders")}
                          {collaborator.canAccessReports &&
                            getAccessIcon("reports")}
                          {collaborator.canAccessSettings &&
                            getAccessIcon("settings")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        Ativo
                      </span>
                      <Switch
                        checked={collaborator.status === "active"}
                        onCheckedChange={() => handleToggleStatus(collaborator)}
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(collaborator)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(collaborator)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {index < safeCollaborators.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Colaborador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o colaborador{" "}
              <strong>{collaboratorToDelete?.name}</strong>? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
