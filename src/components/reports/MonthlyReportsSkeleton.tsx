import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import OrdersTableSkeleton from "../orders/OrdersTableSkeleton";

export default function MonthlyReportsSkeleton() {
  const StatsCardSkeleton = () => (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          <Skeleton className="h-4 w-32" />
        </CardTitle>
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-3 w-40 mt-1" />
      </CardContent>
    </Card>
  );

  const ChartSkeleton = () => (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            <Skeleton className="h-5 w-40" />
          </h3>
          <p className="text-sm text-muted-foreground">
            <Skeleton className="h-4 w-64 mt-1" />
          </p>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[280px] h-[25dvh] sm:min-w-[600px] sm:h-[30dvh]">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full md:w-96 mt-2" />
      </div>

      <div className="flex flex-col w-full gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-4">
          <Card className="overflow-hidden">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle>
                <Skeleton className="h-6 w-48" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-64 mt-1" />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-3 sm:space-y-4 sm:p-4">
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="space-y-6">
        <OrdersTableSkeleton />
      </div>
    </div>
  );
}
