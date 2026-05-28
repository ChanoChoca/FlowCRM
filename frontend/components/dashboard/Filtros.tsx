"use client";

import { Filter, RotateCcw } from "lucide-react";
import type { DashboardFiltro } from "@/types/dashboard";

type Props = {
  filtro: DashboardFiltro;
  onChange: (filtro: Partial<DashboardFiltro>) => void;
  onReset: () => void;
};

export default function Filtros({ filtro, onChange, onReset }: Props) {
  const hasActiveFilter = Object.values(filtro).some((v) => v !== null);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-4 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            Filtros
          </h3>
        </div>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Limpiar
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div>
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Desde
          </label>
          <input
            type="date"
            value={filtro.desde ?? ""}
            onChange={(e) => onChange({ desde: e.target.value || null })}
            className="mt-1 w-full rounded-lg border border-neutral-200/80 bg-white px-2.5 py-1.5 text-sm text-neutral-700 outline-none transition-colors focus:border-indigo-400 dark:border-neutral-700/50 dark:bg-neutral-800/60 dark:text-neutral-200 dark:focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Hasta
          </label>
          <input
            type="date"
            value={filtro.hasta ?? ""}
            onChange={(e) => onChange({ hasta: e.target.value || null })}
            className="mt-1 w-full rounded-lg border border-neutral-200/80 bg-white px-2.5 py-1.5 text-sm text-neutral-700 outline-none transition-colors focus:border-indigo-400 dark:border-neutral-700/50 dark:bg-neutral-800/60 dark:text-neutral-200 dark:focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Central
          </label>
          <input
            type="number"
            placeholder="ID"
            value={filtro.centralId ?? ""}
            onChange={(e) =>
              onChange({
                centralId: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="mt-1 w-full rounded-lg border border-neutral-200/80 bg-white px-2.5 py-1.5 text-sm text-neutral-700 outline-none transition-colors focus:border-indigo-400 dark:border-neutral-700/50 dark:bg-neutral-800/60 dark:text-neutral-200 dark:placeholder:text-neutral-500 dark:focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Producto
          </label>
          <input
            type="number"
            placeholder="ID"
            value={filtro.productoId ?? ""}
            onChange={(e) =>
              onChange({
                productoId: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="mt-1 w-full rounded-lg border border-neutral-200/80 bg-white px-2.5 py-1.5 text-sm text-neutral-700 outline-none transition-colors focus:border-indigo-400 dark:border-neutral-700/50 dark:bg-neutral-800/60 dark:text-neutral-200 dark:placeholder:text-neutral-500 dark:focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Promo
          </label>
          <input
            type="number"
            placeholder="ID"
            value={filtro.promoId ?? ""}
            onChange={(e) =>
              onChange({
                promoId: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="mt-1 w-full rounded-lg border border-neutral-200/80 bg-white px-2.5 py-1.5 text-sm text-neutral-700 outline-none transition-colors focus:border-indigo-400 dark:border-neutral-700/50 dark:bg-neutral-800/60 dark:text-neutral-200 dark:placeholder:text-neutral-500 dark:focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Origen
          </label>
          <select
            value={filtro.origen ?? ""}
            onChange={(e) => onChange({ origen: e.target.value || null })}
            className="mt-1 w-full rounded-lg border border-neutral-200/80 bg-white px-2.5 py-1.5 text-sm text-neutral-700 outline-none transition-colors focus:border-indigo-400 dark:border-neutral-700/50 dark:bg-neutral-800/60 dark:text-neutral-200 dark:focus:border-indigo-500"
          >
            <option value="">Todos</option>
            <option value="CRM">CRM</option>
            <option value="POWER_APP">PowerApp</option>
          </select>
        </div>
      </div>
    </div>
  );
}
