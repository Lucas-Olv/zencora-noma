import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

import { useSettingsStorage } from "@/storage/settings";
import { Collaborator, Settings } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  delNomaApi,
  getNomaApi,
  patchNomaApi,
  postNomaApi,
} from "@/lib/apiHelpers";
import { useTenantStorage } from "@/storage/tenant";
import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect } from "react";
import { useAnalytics } from "@/contexts/AnalyticsProviderContext";
import CollaboratorDialog from "./CollaboratorDialog";
import CollaboratorsList from "./CollaboratorsList";

export default function SettingsView() {
  const { settings, setSettings } = useSettingsStorage();
  const { tenant } = useTenantStorage();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  // Estados para o dialog de colaboradores
  const [collaboratorDialogOpen, setCollaboratorDialogOpen] = useState(false);
  const [collaboratorDialogMode, setCollaboratorDialogMode] = useState<
    "create" | "edit"
  >("create");
  const [selectedCollaborator, setSelectedCollaborator] = useState<
    Collaborator | undefined
  >(undefined);

  const {
    mutate: updateSettings,
    error: updateSettingsError,
    data: updateSettingsData,
    isPending: isUpdatingSettings,
  } = useMutation({
    mutationFn: ({ settingsData }: { settingsData: Settings }) =>
      patchNomaApi(
        `/api/noma/v1/settings/update`,
        { settingsData },
        {
          params: { tenantId: tenant?.id, settingsId: settingsData.id },
        },
      ),
    onSuccess: async (updateSettingsData) => {
      await setSettings(updateSettingsData.data);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar configurações",
        description:
          "Não foi possível atualizar as configurações. Tente novamente.",
        variant: "destructive",
      });
      console.log(error);
    },
  });

  const {
    mutate: updateCollaborator,
    error: updateCollaboratorError,
    data: updateCollaboratorData,
    isPending: isUpdatingCollaborator,
  } = useMutation({
    mutationFn: ({ collaboratorData }: { collaboratorData: Collaborator }) =>
      patchNomaApi(
        `/api/noma/v1/collaborators/update`,
        { collaboratorData },
        {
          params: { tenantId: tenant?.id, collaboratorId: collaboratorData.id },
        },
      ),
    onSuccess: async (updateCollaboratorData) => {
      setCollaborators(updateCollaboratorData.data);
      toast({
        title: "Colaborador atualizado",
        description:
          "As informações do colaborador foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar colaborador",
        description:
          "Não foi possível atualizar o colaborador. Tente novamente.",
        variant: "destructive",
      });
      console.log(error);
    },
  });

  const {
    mutate: createCollaborator,
    error: createCollaboratorError,
    data: createCollaboratorData,
    isPending: isCreatingCollaborator,
  } = useMutation({
    mutationFn: ({ collaboratorData }: { collaboratorData: Collaborator }) =>
      postNomaApi(
        `/api/noma/v1/collaborators/create`,
        { collaboratorData },
        {
          params: { tenantId: tenant?.id },
        },
      ),
    onSuccess: async (createCollaboratorData) => {
      setCollaborators(createCollaboratorData.data);
      toast({
        title: "Colaborador criado",
        description: "O colaborador foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar colaborador",
        description: "Não foi possível criar o colaborador. Tente novamente.",
        variant: "destructive",
      });
      console.log(error);
    },
  });

  const {
    mutate: deleteCollaborator,
    error: deleteCollaboratorError,
    data: deleteCollaboratorData,
    isPending: isDeletingCollaborator,
  } = useMutation({
    mutationFn: ({ collaboratorId }: { collaboratorId: string }) =>
      delNomaApi(`/api/noma/v1/collaborators/delete`, {
        params: { tenantId: tenant?.id, collaboratorId: collaboratorId },
      }),
    onSuccess: async (deleteCollaboratorData) => {
      toast({
        title: "Colaborador excluído",
        description: "O colaborador foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao deletar colaborador",
        description: "Não foi possível deletar o colaborador. Tente novamente.",
        variant: "destructive",
      });
      console.log(error);
    },
  });

  const {
    data: collaboratorsData,
    isLoading: isCollaboratorsLoading,
    isError: isCollaboratorsError,
    refetch,
  } = useQuery({
    queryKey: ["collaborators", tenant?.id],
    queryFn: () =>
      getNomaApi(`/api/noma/v1/collaborators`, {
        params: { tenantId: tenant?.id },
      }),
    enabled: !!tenant?.id && !!settings?.enableCollaborators,
  });

  // Sobrecarga para aceitar string para partialPaymentPercentage
  function handleUpdateSettings(
    field: "partialPaymentPercentage",
    value: string,
  ): void;

  function handleUpdateSettings(field: keyof Settings, value: boolean): void;

  function handleUpdateSettings(
    field: keyof Settings,
    value: boolean | string,
  ) {
    if (!settings) return;
    const updatedSettings: Settings = {
      ...settings,
      [field]: value,
    };
    trackEvent("settings_updated", {
      field: field,
      value: value.toString(),
    });
    updateSettings({ settingsData: updatedSettings });
  }

  // Estado local para o input de porcentagem
  const [partialPercent, setPartialPercent] = useState(
    settings?.partialPaymentPercentage || "",
  );

  // Sincronizar valor local com settings ao abrir/atualizar
  useEffect(() => {
    setPartialPercent(settings?.partialPaymentPercentage || "");
  }, [settings?.partialPaymentPercentage]);

  // Sincronizar colaboradores com dados da API
  useEffect(() => {
    if (collaboratorsData?.data && settings?.enableCollaborators) {
      setCollaborators(collaboratorsData.data);
    }
  }, [collaboratorsData?.data, settings?.enableCollaborators]);

  // Debounce para salvar porcentagem do pagamento parcial
  const debouncedUpdatePartialPayment = useDebouncedCallback(
    (value: string) => {
      handleUpdateSettings("partialPaymentPercentage", value);
    },
    800,
  );

  // Handlers para colaboradores
  const handleCreateCollaborator = () => {
    setCollaboratorDialogMode("create");
    setSelectedCollaborator(undefined);
    setCollaboratorDialogOpen(true);
  };

  const handleEditCollaborator = (collaborator: Collaborator) => {
    setCollaboratorDialogMode("edit");
    setSelectedCollaborator(collaborator);
    setCollaboratorDialogOpen(true);
  };

  const handleDeleteCollaborator = (collaboratorId: string) => {
    deleteCollaborator({ collaboratorId });
  };

  const handleToggleCollaboratorStatus = (
    collaboratorId: string,
    status: "active" | "revoked",
  ) => {
    const collaborator = collaborators.find((c) => c.id === collaboratorId);
    if (collaborator) {
      const updatedCollaborator = { ...collaborator, status };
      updateCollaborator({ collaboratorData: updatedCollaborator });

      toast({
        title: `Colaborador ${status === "active" ? "habilitado" : "desabilitado"}`,
        description: `${collaborator.name} foi ${status === "active" ? "habilitado" : "desabilitado"} com sucesso.`,
      });
    }
  };

  const handleCollaboratorSubmit = (data: any) => {
    if (collaboratorDialogMode === "create") {
      const newCollaborator: Partial<Collaborator> = {
        ...data,
        tenantId: tenant?.id || "",
        status: "active",
      };
      createCollaborator({ collaboratorData: newCollaborator as Collaborator });
    } else if (selectedCollaborator) {
      const updatedCollaborator = {
        ...selectedCollaborator,
        ...data,
        // Se a senha não foi fornecida, manter a atual
        password: data.password || selectedCollaborator.password,
      };
      updateCollaborator({ collaboratorData: updatedCollaborator });
    }
    setCollaboratorDialogOpen(false);
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
            <CardTitle className="text-xl">Configurações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Bloquear relatórios por senha</Label>
                <p className="text-sm text-muted-foreground">
                  Exige senha para acessar os relatórios.
                </p>
              </div>
              <Switch
                checked={settings?.lockReportsByPassword}
                onCheckedChange={(checked) =>
                  handleUpdateSettings("lockReportsByPassword", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Bloquear configurações por senha</Label>
                <p className="text-sm text-muted-foreground">
                  Exige senha para acessar as configurações.
                </p>
              </div>
              <Switch
                checked={settings?.lockSettingsByPassword}
                onCheckedChange={(checked) =>
                  handleUpdateSettings("lockSettingsByPassword", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Habilitar pagamento parcial</Label>
                <p className="text-sm text-muted-foreground">
                  Habilita funcionalidade de pagamento parcial ao cadastrar uma
                  encomenda.
                </p>
              </div>
              <Switch
                checked={settings?.enablePartialPaymentAmount}
                onCheckedChange={(checked) =>
                  handleUpdateSettings("enablePartialPaymentAmount", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Porcentagem do pagamento parcial</Label>
                <p className="text-sm text-muted-foreground">
                  Porcentagem esperada para o pagamento parcial, é aplicado
                  apenas em encomendas criadas após a alteração.
                </p>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  disabled={!settings?.enablePartialPaymentAmount}
                  min={0}
                  max={100}
                  step={1}
                  className="text-start leading-10 w-18"
                  value={partialPercent}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^0-9]/g, "");
                    if (value !== "") {
                      let num = Math.max(0, Math.min(100, parseInt(value)));
                      value = num.toString();
                    }
                    setPartialPercent(value);
                    debouncedUpdatePartialPayment(value);
                  }}
                  inputMode="numeric"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none select-none">
                  %
                </span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Habilitar colaboradores</Label>
                <p className="text-sm text-muted-foreground">
                  Permite gerenciar colaboradores e controlar o acesso ao
                  sistema.
                </p>
              </div>
              <Switch
                checked={settings?.enableCollaborators}
                onCheckedChange={(checked) =>
                  handleUpdateSettings("enableCollaborators", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Card de Controle de Acesso */}
        {settings?.enableCollaborators && (
          <CollaboratorsList
            collaborators={collaborators}
            isLoading={isCollaboratorsLoading}
            onEdit={handleEditCollaborator}
            onDelete={handleDeleteCollaborator}
            onToggleStatus={handleToggleCollaboratorStatus}
            onCreateNew={handleCreateCollaborator}
          />
        )}
      </div>

      {/* Dialog de Colaborador */}
      <CollaboratorDialog
        open={collaboratorDialogOpen}
        onOpenChange={setCollaboratorDialogOpen}
        mode={collaboratorDialogMode}
        collaborator={selectedCollaborator}
        onSubmit={handleCollaboratorSubmit}
        isPending={isCreatingCollaborator || isUpdatingCollaborator}
      />
    </div>
  );
}
