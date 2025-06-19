import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

import { db } from "@/lib/db";
import { useSettingsStorage } from "@/storage/settings";
import { Settings } from "@/lib/types";

export default function SettingsView() {
  const { settings } = useSettingsStorage();
  const { toast } = useToast();

  const handleUpdateSettings = async (
    field: keyof Settings,
    value: boolean,
  ) => {
    // try {
    //   if (!settings || !tenant?.id) return;
    //   const updatedSettings = {
    //     ...settings,
    //     [field]: value,
    //     tenant_id: tenant.id,
    //   };
    //   await updateSettings(updatedSettings);
    //   await db.updateSettingsData(updatedSettings);
    //   toast({
    //     title: "Configurações atualizadas",
    //     description: "As configurações foram atualizadas com sucesso.",
    //   });
    // } catch (error) {
    //   toast({
    //     title: "Erro ao atualizar configurações",
    //     description:
    //       "Não foi possível atualizar as configurações. Tente novamente.",
    //     variant: "destructive",
    //   });
    // }
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
                <Label>Exigir senha para trocar de papel</Label>
                <p className="text-sm text-muted-foreground">
                  Exige senha ao trocar entre papéis de usuário.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
