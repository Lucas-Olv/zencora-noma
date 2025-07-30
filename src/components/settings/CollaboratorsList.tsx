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
import {
  Edit,
  Trash2,
  User,
  UserCheck,
  UserX,
  Plus,
  Calendar,
  FileText,
  Settings,
  BarChart3,
  Package,
  Bell,
  Home,
} from "lucide-react";

interface CollaboratorsListProps {
  collaborators: Collaborator[];
  isLoading: boolean;
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
  onEdit,
  onDelete,
  onToggleStatus,
  onCreateNew,
}: CollaboratorsListProps) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collaboratorToDelete, setCollaboratorToDelete] =
    useState<Collaborator | null>(null);

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
        return <Package className="h-4 w-4" />;
      case "calendar":
        return <Calendar className="h-4 w-4" />;
      case "production":
        return <Package className="h-4 w-4" />;
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
      collaborator.canAccessReminders,
      collaborator.canAccessReports,
      collaborator.canAccessSettings,
    ];
    return accesses.filter(Boolean).length;
  };

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
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (collaborators.length === 0) {
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Controle de Acesso</CardTitle>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Colaborador
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {collaborators.map((collaborator, index) => (
            <div key={collaborator.id}>
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
                        {getAccessCount(collaborator)} permissões
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
                    <span className="text-sm text-muted-foreground">Ativo</span>
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

              {index < collaborators.length - 1 && (
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
