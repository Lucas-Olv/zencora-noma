import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useReactToPrint, type UseReactToPrintOptions } from "react-to-print"
import bcrypt from "bcryptjs"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null | undefined, formatStr: string = "dd 'de' MMMM 'às' HH:mm"): string {
  if (!date) return "Data não definida"
  
  try {
    const parsedDate = parseISO(date)
    if (isNaN(parsedDate.getTime())) {
      return "Data inválida"
    }
    return format(parsedDate, formatStr, { locale: ptBR })
  } catch (error) {
    return "Data inválida"
  }
}

export function parseDate(date: string | null | undefined): Date | null {
  if (!date) return null
  
  try {
    const parsedDate = parseISO(date)
    if (isNaN(parsedDate.getTime())) {
      return null
    }
    return parsedDate
  } catch (error) {
    return null
  }
}

export function getOrderCode(id: string): string {
  // Pega os últimos 6 caracteres do UUID
  return id.slice(-6).toUpperCase();
}

export function usePrint(ref: React.RefObject<HTMLElement>, options?: Partial<UseReactToPrintOptions>) {
  return useReactToPrint({
    contentRef: ref,
    pageStyle: options?.pageStyle || `
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
    ...options
  });
}

export function getStatusDisplay(status: string | null) {
  switch (status) {
    case "pending":
      return {
        label: "Pendente",
        className: "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
      };
    case "production":
      return {
        label: "Produção",
        className: "bg-purple-100/80 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/50"
      };
    case "done":
      return {
        label: "Concluído",
        className: "bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50"
      };
    default:
      return {
        label: "Pendente",
        className: "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
      };
  }
};

export async function hashPassword(password: string): Promise<string> {
  const SALT_ROUNDS = 12
  const salt = await bcrypt.genSalt(SALT_ROUNDS)
  return bcrypt.hash(password, salt)
}

export function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
}

