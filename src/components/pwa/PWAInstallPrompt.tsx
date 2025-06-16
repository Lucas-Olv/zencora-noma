import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const PWA_INSTALL_PROMPT_KEY = "pwa_install_prompt_shown";

export function PWAInstallPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Verifica se o prompt já foi mostrado
    const hasShownPrompt = localStorage.getItem(PWA_INSTALL_PROMPT_KEY);

    // Verifica se o app pode ser instalado como PWA
    const isInstallable =
      window.matchMedia("(display-mode: standalone)").matches === false;

    // Só mostra o prompt se for dispositivo móvel
    if (!hasShownPrompt && isInstallable && isMobile) {
      setIsOpen(true);
    }
  }, [isMobile]);

  const handleClose = () => {
    localStorage.setItem(PWA_INSTALL_PROMPT_KEY, "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Download className="h-5 w-5 text-primary" />
            Instale o Zencora Noma
          </DialogTitle>
          <DialogDescription className="pt-2">
            Instale o Zencora Noma no seu dispositivo para ter uma melhor
            experiência em seu dispositivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Benefícios:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Acesso rápido direto da tela inicial
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Melhor experiência de navegação
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Experiência nativa como um app
              </li>
            </ul>
          </div>

          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <p className="text-muted-foreground">
              Para instalar, use o botão de compartilhar no seu navegador e
              selecione "Adicionar à Tela Inicial" ou "Instalar App".
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2">
          <Button variant="outline" onClick={handleClose}>
            Agora não
          </Button>
          <Button onClick={handleClose}>Entendi!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
