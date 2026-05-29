"use client";

import { UsuarioFilters } from "@/app/actions/usuarios";
import { UsuarioSupervisorResponse } from "@/types/dtos";

const ROL_OPTIONS = [
  { value: "LIDER", label: "Líder" },
  { value: "GERENTE", label: "Gerente" },
  { value: "ADMINISTRACION_RRHH_COBRANZA", label: "Admin/RRHH/Cobranza" },
  { value: "JEFE_DE_SUPERVISOR", label: "Jefe de Supervisor" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "ASESOR", label: "Asesor" },
];

const selectCls =
  "rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

interface Props {
  filters: UsuarioFilters;
  supervisores: UsuarioSupervisorResponse[];
  hasFilters: boolean;
  onDebounced: (patch: Partial<UsuarioFilters>) => void;
  onImmediate: (patch: Partial<UsuarioFilters>) => void;
  onClear: () => void;
}

export default function UsuarioFiltersPanel({
  filters,
  supervisores,
  hasFilters,
  onDebounced,
  onImmediate,
  onClear,
}: Props) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          placeholder="Buscar (nombre, apellido, DNI, teléfono)"
          defaultValue={filters.q ?? ""}
          onChange={(e) => onDebounced({ q: e.target.value })}
          className={selectCls + " placeholder-neutral-400 dark:placeholder-neutral-500"}
        />

        <select
          defaultValue={filters.rol ?? ""}
          onChange={(e) => onImmediate({ rol: e.target.value })}
          className={selectCls}
        >
          <option value="">Todos los roles</option>
          {ROL_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <select
          defaultValue={filters.activo ?? ""}
          onChange={(e) => onImmediate({ activo: e.target.value })}
          className={selectCls}
        >
          <option value="">Todos</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>

        <select
          defaultValue={filters.supervisorId ?? ""}
          onChange={(e) => onImmediate({ supervisorId: e.target.value })}
          className={selectCls}
        >
          <option value="">Todos los supervisores</option>
          {supervisores.map((s) => (
            <option key={s.id} value={String(s.id)}>
              {s.apellido}, {s.nombre}
            </option>
          ))}
        </select>
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
