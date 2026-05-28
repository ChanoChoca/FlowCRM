"use client";

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700/60 ${className ?? ""}`}
    />
  );
}

export function VentaTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/80 shadow-sm backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700/50">
          <thead className="bg-neutral-50/80 dark:bg-neutral-800/50">
            <tr>
              {["ID", "Cliente", "Producto", "Promo", "Central", "Estado", "Acciones"].map((h) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 ${h === "Acciones" ? "text-right" : "text-left"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-3"><Pulse className="h-4 w-8" /></td>
                <td className="px-4 py-3"><Pulse className="h-4 w-32" /></td>
                <td className="px-4 py-3"><Pulse className="h-4 w-24" /></td>
                <td className="px-4 py-3"><Pulse className="h-4 w-20" /></td>
                <td className="px-4 py-3"><Pulse className="h-4 w-20" /></td>
                <td className="px-4 py-3"><Pulse className="h-5 w-16 rounded-full" /></td>
                <td className="px-4 py-3 flex justify-end"><Pulse className="h-7 w-12" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-neutral-100 p-4 dark:border-neutral-800/50">
        <Pulse className="h-8 w-48 mx-auto" />
      </div>
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/60 p-5 dark:border-neutral-700/50 dark:bg-neutral-900/40">
      <Pulse className="h-3 w-24 mb-3" />
      <Pulse className="h-8 w-16 mb-3" />
      <Pulse className="h-4 w-32" />
    </div>
  );
}

export function VentaDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-14">
      <Pulse className="h-6 w-40" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <Pulse className="h-3 w-20" />
            <Pulse className="h-5 w-32" />
          </div>
        ))}
      </div>
      <Pulse className="h-px w-full" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <Pulse className="h-3 w-16" />
            <Pulse className="h-5 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
