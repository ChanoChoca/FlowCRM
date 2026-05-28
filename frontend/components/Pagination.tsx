import Link from "next/link";

function buildHref(
  page: number,
  size: number,
  extraParams?: Record<string, string>,
) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) {
      if (v) params.set(k, v);
    }
  }
  return `?${params.toString()}`;
}

export default function Pagination({
  currentPage,
  currentSize,
  totalPages,
  extraParams,
}: {
  currentPage: number;
  currentSize: number;
  totalPages: number;
  extraParams?: Record<string, string>;
}) {
  const prev = Math.max(currentPage - 1, 0);
  const next = Math.min(currentPage + 1, totalPages - 1);

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Página {currentPage + 1} de {Math.max(totalPages, 1)}
      </p>

      <div className="flex gap-2">
        <Link
          className={`rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 active:scale-95 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 ${
            currentPage === 0 ? "pointer-events-none opacity-40" : ""
          }`}
          href={buildHref(prev, currentSize, extraParams)}
        >
          Anterior
        </Link>
        <Link
          className={`rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 active:scale-95 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 ${
            currentPage >= totalPages - 1
              ? "pointer-events-none opacity-40"
              : ""
          }`}
          href={buildHref(next, currentSize, extraParams)}
        >
          Siguiente
        </Link>
      </div>
    </div>
  );
}
