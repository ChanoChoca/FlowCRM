"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { VentaMapaPoint } from "@/app/actions/mapa";

const SalesMap = dynamic(() => import("@/components/SalesMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
      Cargando mapa…
    </div>
  ),
});

const ESTADO_COLOR: Record<string, string> = {
  CUMPLIDA: "#22c55e",
  PREVENTA: "#6366f1",
  PENDIENTE: "#eab308",
  INICIADA: "#06b6d4",
  TICKET: "#a855f7",
};

export default function MapaView({
  points,
  desde,
  hasta,
}: {
  points: VentaMapaPoint[];
  desde: string;
  hasta: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleFilter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams(searchParams.toString());
    const d = fd.get("desde") as string;
    const h = fd.get("hasta") as string;
    if (d) params.set("desde", d);
    else params.delete("desde");
    if (h) params.set("hasta", h);
    else params.delete("hasta");
    startTransition(() => router.push(`/crm/mapa?${params.toString()}`));
  }

  const estados = useMemo(
    () => Array.from(new Set(points.map((p) => p.estado))).sort(),
    [points],
  );
  const [estadosSeleccionados, setEstadosSeleccionados] = useState<Set<string> | null>(null);

  const activos = estadosSeleccionados ?? new Set(estados);
  const visibles = useMemo(
    () => points.filter((p) => activos.has(p.estado)),
    [points, activos],
  );

  function toggleEstado(estado: string) {
    setEstadosSeleccionados((prev) => {
      const base = new Set(prev ?? estados);
      if (base.has(estado)) base.delete(estado);
      else base.add(estado);
      return base;
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight dark:text-neutral-100">
            Mapa de ventas
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {visibles.length} de {points.length} venta{points.length !== 1 ? "s" : ""} con coordenadas
            {visibles.length !== points.length ? " (filtradas por estado)" : ""}.
          </p>
        </div>

        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500 dark:text-neutral-400">Desde</label>
            <input
              type="date"
              name="desde"
              defaultValue={desde}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500 dark:text-neutral-400">Hasta</label>
            <input
              type="date"
              name="hasta"
              defaultValue={hasta}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
          >
            {isPending ? "Filtrando…" : "Filtrar"}
          </button>
        </form>
      </div>

      {estados.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {estados.map((e) => {
            const activo = activos.has(e);
            return (
              <button
                key={e}
                type="button"
                onClick={() => toggleEstado(e)}
                aria-pressed={activo}
                className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                  activo
                    ? "border-neutral-300 bg-white text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                    : "border-neutral-200 bg-neutral-100 text-neutral-400 line-through dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500"
                }`}
              >
                <span
                  className="inline-block h-3 w-3 rounded-full border-2 border-white shadow"
                  style={{ background: activo ? (ESTADO_COLOR[e] ?? "#94a3b8") : "#cbd5e1" }}
                />
                {e}
              </button>
            );
          })}
          {estadosSeleccionados && (
            <button
              type="button"
              onClick={() => setEstadosSeleccionados(null)}
              className="ml-1 cursor-pointer rounded-full px-2 py-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Mostrar todos
            </button>
          )}
        </div>
      )}

      <div className="h-[600px] overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-700/50 dark:bg-neutral-900">
        {visibles.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            {points.length === 0
              ? "No hay ventas con coordenadas en el período seleccionado."
              : "Ningún estado seleccionado — activá al menos uno para ver el mapa."}
          </div>
        ) : (
          <SalesMap points={visibles} />
        )}
      </div>
    </div>
  );
}
