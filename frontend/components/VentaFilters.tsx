"use client";

import { VentaFilters as Filters } from "@/app/actions/ventas";
import { enumToOptions } from "@/lib/option";
import { AsesorOption, UsuarioSupervisorResponse } from "@/types/dtos";
import { EstadoVenta, Origen, Rol } from "@/types/enums";

export default function VentaFilters({
  filters,
  onDebounced,
  onImmediate,
  onClear,
  hasFilters,
  supervisores,
  asesores,
  userRole,
  scopeLocked,
}: {
  filters: Filters;
  onDebounced: (patch: Partial<Filters>) => void;
  onImmediate: (patch: Partial<Filters>) => void;
  onClear: () => void;
  hasFilters: boolean;
  supervisores: UsuarioSupervisorResponse[];
  asesores: AsesorOption[];
  userRole?: Rol;
  scopeLocked?: boolean;
}) {
  const showSupervisor = !scopeLocked && userRole != null && userRole !== Rol.ASESOR;
  const showAsesor = !scopeLocked && userRole != null && userRole !== Rol.ASESOR;

  const filteredAsesores = filters.supervisorId
    ? asesores.filter((a) => String(a.supervisorId) === filters.supervisorId)
    : asesores;

  function handleSupervisorChange(supervisorId: string) {
    const patch: Partial<Filters> = { supervisorId: supervisorId || undefined };
    if (supervisorId && filters.asesorId) {
      const currentAsesor = asesores.find(
        (a) => String(a.id) === filters.asesorId,
      );
      if (currentAsesor && String(currentAsesor.supervisorId) !== supervisorId) {
        patch.asesorId = undefined;
      }
    }
    onImmediate(patch);
  }

  function handleAsesorChange(asesorId: string) {
    onImmediate({ asesorId: asesorId || undefined });
  }

  const selectClass =
    "rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          placeholder="Cliente..."
          defaultValue={filters.cliente ?? ""}
          onChange={(e) => onDebounced({ cliente: e.target.value })}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
        />
        {showSupervisor && (
          <select
            defaultValue={filters.supervisorId ?? ""}
            onChange={(e) => handleSupervisorChange(e.target.value)}
            className={selectClass}
          >
            <option value="">Todos los supervisores</option>
            {supervisores.map((s) => (
              <option key={s.id} value={s.id ?? ""}>
                {s.nombre} {s.apellido}
              </option>
            ))}
          </select>
        )}
        {showAsesor && (
          <select
            defaultValue={filters.asesorId ?? ""}
            onChange={(e) => handleAsesorChange(e.target.value)}
            className={selectClass}
          >
            <option value="">Todos los asesores</option>
            {filteredAsesores.map((a) => (
              <option key={a.id} value={String(a.id)}>
                {a.nombre} {a.apellido}
              </option>
            ))}
          </select>
        )}
        <select
          defaultValue={filters.origen ?? ""}
          onChange={(e) => onImmediate({ origen: e.target.value })}
          className={selectClass}
        >
          <option value="">Todos los origenes</option>
          {enumToOptions(Origen).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          defaultValue={filters.estado ?? ""}
          onChange={(e) => onImmediate({ estado: e.target.value })}
          className={selectClass}
        >
          <option value="">Todos los estados</option>
          {Object.values(EstadoVenta).map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Desde
          </label>
          <input
            type="date"
            defaultValue={filters.desde ?? ""}
            onChange={(e) => onImmediate({ desde: e.target.value })}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Hasta
          </label>
          <input
            type="date"
            defaultValue={filters.hasta ?? ""}
            onChange={(e) => onImmediate({ hasta: e.target.value })}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
