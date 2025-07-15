import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useReactToPrint, type UseReactToPrintOptions } from "react-to-print";
import { useSubscriptionStorage } from "@/storage/subscription";
import { useTenantStorage } from "@/storage/tenant";
import { useSettingsStorage } from "@/storage/settings";
import { useSessionStorage } from "@/storage/session";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: string | null | undefined,
  formatStr: string = "dd 'de' MMMM 'às' HH:mm",
): string {
  if (!date) return "Data não definida";

  try {
    const parsedDate = parseISO(date);
    if (isNaN(parsedDate.getTime())) {
      return "Data inválida";
    }
    return format(parsedDate, formatStr, { locale: ptBR });
  } catch (error) {
    return "Data inválida";
  }
}

export function parseDate(date: string | null | undefined): Date | null {
  if (!date) return null;

  try {
    const parsedDate = parseISO(date);
    if (isNaN(parsedDate.getTime())) {
      return null;
    }
    return parsedDate;
  } catch (error) {
    return null;
  }
}

export async function cleanWorkspaceData() {
  await useSubscriptionStorage.getState().clearSubscription();
  await useTenantStorage.getState().clearTenant();
  await useSettingsStorage.getState().clearSettings();
  await useSessionStorage.getState().clearSession();
  window.location.href = "/login";
}

export function getOrderCode(id: string): string {
  // Pega os últimos 6 caracteres do UUID
  return id.slice(-6).toUpperCase();
}

export function usePrint(
  ref: React.RefObject<HTMLElement>,
  options?: Partial<UseReactToPrintOptions>,
) {
  return useReactToPrint({
    contentRef: ref,
    pageStyle:
      options?.pageStyle ||
      `
      @page {
        size: auto;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `,
    ...options,
  });
}

export function getStatusDisplay(
  status: string | null,
  dueDate?: string | null,
) {
  // Verifica se está atrasado (apenas para status pendente ou produção)
  const isOverdue =
    dueDate &&
    ["pending", "production"].includes(status || "") &&
    new Date(dueDate) < new Date();

  if (isOverdue) {
    return {
      label: "Atrasado",
      variant: "destructive" as const,
      className:
        "bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50",
    };
  }

  switch (status) {
    case "pending":
      return {
        label: "Pendente",
        variant: "outline" as const,
        className:
          "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
      };
    case "production":
      return {
        label: "Produção",
        variant: "secondary" as const,
        className:
          "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50",
      };
    case "done":
      return {
        label: "Concluído",
        variant: "default" as const,
        className:
          "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50",
      };
    default:
      return {
        label: "Pendente",
        variant: "outline" as const,
        className:
          "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
      };
  }
}
