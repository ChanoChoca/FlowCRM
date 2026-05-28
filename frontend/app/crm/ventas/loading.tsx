import { VentaTableSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="h-7 w-24 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700/60" />
          <div className="mt-1.5 h-4 w-56 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700/60" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700/60" />
          <div className="h-10 w-36 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700/60" />
        </div>
      </div>
      <VentaTableSkeleton rows={10} />
    </div>
  );
}
