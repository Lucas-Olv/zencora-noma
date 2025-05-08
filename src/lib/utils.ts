import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

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
