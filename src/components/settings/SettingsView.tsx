import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

import { useSettingsStorage } from "@/storage/settings";
import { Settings } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { patchNomaApi } from "@/lib/apiHelpers";
import { useTenantStorage } from "@/storage/tenant";
import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect } from "react";

export default function SettingsView() {
  const { settings, setSettings } = useSettingsStorage();
  const { tenant } = useTenantStorage();
  const { toast } = useToast();

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
      toast({
        title: "Configurações atualizadas com sucesso!",
      });
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

  // Debounce para salvar porcentagem do pagamento parcial
  const debouncedUpdatePartialPayment = useDebouncedCallback(
    (value: string) => {
      handleUpdateSettings("partialPaymentPercentage", value);
    },
    800,
  );

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
