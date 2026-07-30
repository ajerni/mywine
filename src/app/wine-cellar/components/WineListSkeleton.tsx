import { Skeleton } from '@/components/ui/skeleton';

export function WineListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your wine collection">
      <div className="divide-border divide-y lg:hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-1 py-4">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <Skeleton className="h-6 w-10 rounded-full" />
          </div>
        ))}
      </div>

      <div className="hidden lg:block">
        <div className="space-y-3 py-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-center gap-6">
              <Skeleton className="h-4 flex-[3]" />
              <Skeleton className="h-4 flex-[2]" />
              <Skeleton className="h-4 flex-[2]" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
