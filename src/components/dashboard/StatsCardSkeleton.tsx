import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          <Skeleton className="h-4 w-32" />
        </CardTitle>
        <Skeleton className="h-6 w-6 rounded-sm" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <Skeleton className="h-8 w-24" />
        </div>
        <p className="text-xs text-muted-foreground">
          <Skeleton className="h-3 w-40 mt-1" />
        </p>
      </CardContent>
    </Card>
  );
}
