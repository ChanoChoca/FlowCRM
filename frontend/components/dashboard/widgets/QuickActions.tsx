"use client";

import type { AccionRapida } from "@/types/dashboard";
import Link from "next/link";
import { getIconForCode } from "../utils";

export default function QuickActions({
  acciones,
}: {
  acciones: AccionRapida[];
}) {
  if (!acciones.length) return null;

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
        Acciones rápidas
      </h3>
      <div className="mt-3 grid sm:grid-cols-2 gap-2">
        {acciones.map((a) => {
          const Icon = getIconForCode(a.icono);
          return (
            <Link
              key={a.codigo}
              href={a.ruta}
              className="group flex items-center gap-2.5 rounded-xl border border-neutral-200/80 bg-white/50 px-3 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:scale-[1.02] hover:bg-neutral-50 hover:shadow-md active:scale-[0.98] dark:border-neutral-700/50 dark:bg-neutral-800/40 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <div className="flex shrink-0 h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 transition-colors group-hover:bg-indigo-100 dark:bg-neutral-700 dark:group-hover:bg-indigo-950/50">
                <Icon className="h-3.5 w-3.5 text-neutral-500 group-hover:text-indigo-600 dark:text-neutral-400 dark:group-hover:text-indigo-400" />
              </div>
              {a.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
