import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RemindersViewSkeleton() {
  const renderReminderSkeleton = () => (
    <div className="flex items-center gap-2 p-2 border rounded-lg">
      <Skeleton className="h-5 w-5 rounded" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-8 w-20 rounded-md" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <Card>
        <CardHeader>
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <Skeleton className="h-8 w-24" />
            </TabsList>
            <TabsContent value="pending">
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => renderReminderSkeleton())}
              </div>
            </TabsContent>
            <TabsContent value="completed">
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => renderReminderSkeleton())}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
