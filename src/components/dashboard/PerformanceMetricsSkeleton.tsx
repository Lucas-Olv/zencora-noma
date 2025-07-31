import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PerformanceMetricsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-48" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-64 mt-1" />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-10">
        {/* Faturamento Semanal Skeleton */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-start justify-start">
            <h3 className="text-lg font-medium">
              <Skeleton className="h-5 w-40" />
            </h3>
            <p className="text-2xl font-bold">
              <Skeleton className="h-8 w-32 mt-1" />
            </p>
            <p className="text-sm">
              <Skeleton className="h-4 w-48 mt-1" />
            </p>
          </div>
          <div className="w-full h-[30dvh] md:h-[36dvh]">
            <Skeleton className="h-full w-full" />
          </div>
        </div>

        {/* Variação de Encomendas Skeleton */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-start justify-start">
            <h3 className="text-lg font-medium">
              <Skeleton className="h-5 w-44" />
            </h3>
            <p className="text-2xl font-bold">
              <Skeleton className="h-8 w-16 mt-1" />
            </p>
            <p className="text-sm">
              <Skeleton className="h-4 w-24 mt-1" />
            </p>
            <p className="text-sm">
              <Skeleton className="h-4 w-48 mt-1" />
            </p>
          </div>
          <div className="w-full h-[30dvh] md:h-[36dvh]">
            <Skeleton className="h-full w-full" />
          </div>
        </div>

        {/* Relação de Pagamentos Skeleton */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-start justify-start">
            <h3 className="text-lg font-medium">
              <Skeleton className="h-5 w-48" />
            </h3>
          </div>
          <div className="w-full h-[30dvh] md:h-[36dvh]">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
