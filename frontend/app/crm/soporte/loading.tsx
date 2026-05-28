export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <div className="h-7 w-32 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700/60" />
      <div className="mt-1.5 h-4 w-56 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700/60" />
      <div className="h-96 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-700/60" />
    </div>
  );
}
