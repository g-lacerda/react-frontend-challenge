import { Skeleton } from '@/shared/ui/skeleton'

export function MovieCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border">
      <Skeleton className="aspect-[2/3] rounded-none" />
      <div className="grid gap-2 p-3">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-2.5 w-2/3" />
        <div className="flex gap-1">
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <Skeleton className="mt-1 h-8 w-full" />
      </div>
    </div>
  )
}
