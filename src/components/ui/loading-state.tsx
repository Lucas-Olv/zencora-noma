import { Loader2, FileText } from "lucide-react"
import { Button } from "./button"

interface LoadingStateProps {
  loading?: boolean
  empty?: boolean
  emptyText?: string
  emptyIcon?: React.ReactNode
  emptyAction?: {
    label: string
    onClick: () => void
  }
  children: React.ReactNode
  className?: string
}

export function LoadingState({
  loading,
  empty,
  emptyText = "Nenhum item encontrado",
  emptyIcon = <FileText className="h-12 w-12 text-muted-foreground" />,
  emptyAction,
  children,
  className
}: LoadingStateProps) {
  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (empty) {
    return (
      <div className="flex h-32 flex-col items-center justify-center space-y-4">
        {emptyIcon}
        <p className="text-sm text-muted-foreground">{emptyText}</p>
        {emptyAction && (
          <Button
            variant="outline"
            size="sm"
            onClick={emptyAction.onClick}
          >
            {emptyAction.label}
          </Button>
        )}
      </div>
    )
  }

  return <div className={className}>{children}</div>
} 