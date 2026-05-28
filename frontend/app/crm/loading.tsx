export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="h-7 w-40 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700/60" />
          <div className="mt-1.5 h-4 w-64 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700/60" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-700/60"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-700/60" />
    </div>
  );
}
