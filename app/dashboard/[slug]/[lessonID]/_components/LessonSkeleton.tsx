import { Skeleton } from "@/components/ui/skeleton";

export function LessonSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background pl-6">
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="py-4 border-b">
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="space-y-3 pt-3">
        <Skeleton className="h-8 w-3/4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    </div>
  );
}
