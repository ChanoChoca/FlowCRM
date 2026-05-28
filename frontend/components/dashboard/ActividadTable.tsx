"use client";

import { obtenerActividadUsuariosAction } from "@/app/actions/dashboard";
import type { ActividadUsuario } from "@/types/dashboard";
import { ArrowDown, ArrowUp, ArrowUpDown, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { fmtInstant, fmtNumber } from "./utils";

type SortBy = "apellido" | "ultimoLogin" | "activo" | "ventasMes";
type SortDir = "asc" | "desc";

type Props = {
  title?: string;
  pageSize?: number;
};

function SortIcon({ col, sortBy, sortDir }: { col: SortBy; sortBy: SortBy; sortDir: SortDir }) {
  if (col !== sortBy) return <ArrowUpDown className="inline-block ml-1 h-3 w-3 opacity-40" />;
  return sortDir === "asc"
    ? <ArrowUp className="inline-block ml-1 h-3 w-3" />
    : <ArrowDown className="inline-block ml-1 h-3 w-3" />;
}

export default function ActividadTable({ title, pageSize = 10 }: Props) {
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<SortBy>("ventasMes");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [data, setData] = useState<ActividadUsuario[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    obtenerActividadUsuariosAction(page, pageSize, sortBy, sortDir)
      .then((res) => {
        if (cancelled) return;
        setData(res.content);
        setTotalPages(Math.max(res.totalPages, 1));
        setTotalElements(res.totalElements);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error al cargar");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [page, pageSize, sortBy, sortDir]);

  function handleSort(col: SortBy) {
    if (col === sortBy) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir(col === "ventasMes" ? "desc" : "asc");
    }
    setPage(0);
  }

  const thClass =
    "pb-2 pr-4 font-medium text-left cursor-pointer select-none hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors";

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          {title ?? "Actividad de asesores"}
        </h3>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {fmtNumber(totalElements)} asesor(es)
        </span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <th className="pb-2 pr-4 font-medium text-left">Asesor</th>
              <th className="pb-2 pr-4 font-medium text-left">Franja</th>
              <th
                className={thClass}
                onClick={() => handleSort("ultimoLogin")}
              >
                Último login
                <SortIcon col="ultimoLogin" sortBy={sortBy} sortDir={sortDir} />
              </th>
              <th
                className={thClass}
                onClick={() => handleSort("activo")}
              >
                Estado
                <SortIcon col="activo" sortBy={sortBy} sortDir={sortDir} />
              </th>
              <th
                className="pb-2 font-medium text-right cursor-pointer select-none hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                onClick={() => handleSort("ventasMes")}
              >
                Ventas/mes
                <SortIcon col="ventasMes" sortBy={sortBy} sortDir={sortDir} />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((u) => (
              <tr
                key={u.usuarioId}
                className="border-b border-neutral-50 transition-colors last:border-0 hover:bg-neutral-50/50 dark:border-neutral-800/50 dark:hover:bg-neutral-800/30"
              >
                <td className="py-2.5 pr-4 font-medium text-neutral-700 dark:text-neutral-200">
                  {u.nombre} {u.apellido}
                </td>
                <td className="py-2.5 pr-4 text-neutral-500 dark:text-neutral-400">
                  {u.franjaActividad}
                </td>
                <td className="py-2.5 pr-4 text-neutral-500 dark:text-neutral-400">
                  {fmtInstant(u.ultimoLogin)}
                </td>
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-1.5">
                    <Circle
                      className={`h-2 w-2 ${
                        u.activo
                          ? "fill-emerald-500 text-emerald-500"
                          : "fill-neutral-300 text-neutral-300 dark:fill-neutral-600 dark:text-neutral-600"
                      }`}
                    />
                    <span
                      className={
                        u.activo
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-neutral-400 dark:text-neutral-500"
                      }
                    >
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 text-right font-semibold text-neutral-800 dark:text-neutral-100">
                  {fmtNumber(u.ventasMes)}
                </td>
              </tr>
            ))}

            {!loading && data.length === 0 && !error && (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500"
                >
                  No hay asesores para mostrar.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500"
                >
                  Cargando...
                </td>
              </tr>
            )}

            {error && (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-sm text-red-500 dark:text-red-400"
                >
                  {error}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3 dark:border-neutral-800/50">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Página {page + 1} de {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0 || loading}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page >= totalPages - 1 || loading}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
