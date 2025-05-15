import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useReactToPrint, type UseReactToPrintOptions } from "react-to-print"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null | undefined, formatStr: string = "dd 'de' MMMM"): string {
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
