"use client";

import { getConversionEquipoAction } from "@/app/actions/gestiones";
import type { ConversionAsesorResumen } from "@/types/dashboard";
import { ArrowUpDown, ChevronDown, ChevronUp, Percent } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

type SortKey = "nombre" | "totalGestiones" | "totalVendidas" | "tasaConversion";
type SortDir = "asc" | "desc";

function SortButton({
  col,
  current,
  dir,
  onSort,
  children,
}: {
  col: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  children: React.ReactNode;
}) {
  const active = col === current;
  return (
    <button
      type="button"
      onClick={() => onSort(col)}
      className={`flex items-center gap-0.5 text-xs font-medium transition-colors cursor-pointer ${
        active
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      }`}
    >
      {children}
      {active ? (
        dir === "desc" ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronUp className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );
}

function TasaBadge({ pct }: { pct: number }) {
  const color =
    pct >= 50
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
      : pct >= 25
        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
        : "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400";

  return (
    <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold tabular-nums ${color}`}>
      {pct.toFixed(1)}%
    </span>
  );
}

export default function TasaConversionEquipo() {
  const [data, setData] = useState<ConversionAsesorResumen[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [sortKey, setSortKey] = useState<SortKey>("tasaConversion");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    startTransition(async () => {
      const result = await getConversionEquipoAction();
      setData(result);
      setLoaded(true);
    });
  }, []);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      let diff = 0;
      if (sortKey === "nombre") {
        diff = `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`);
      } else {
        diff = (a[sortKey] as number) - (b[sortKey] as number);
      }
      return sortDir === "desc" ? -diff : diff;
    });
  }, [data, sortKey, sortDir]);

  const totalGestiones = data.reduce((s, r) => s + r.totalGestiones, 0);
  const totalVendidas = data.reduce((s, r) => s + r.totalVendidas, 0);
  const tasaGlobal = totalGestiones > 0 ? (totalVendidas / totalGestiones) * 100 : 0;

  if (!loaded && isPending) {
    return (
      <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-neutral-400" />
          <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
            Tasa de conversión
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!loaded) return null;

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="flex items-center gap-2">
        <Percent className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Tasa de conversión
        </h3>
      </div>

      {data.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-neutral-100 bg-neutral-50/60 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-800/40">
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Total gestiones</p>
            <p className="text-sm font-semibold tabular-nums text-neutral-800 dark:text-neutral-100">
              {totalGestiones}
            </p>
          </div>
          <div className="w-px self-stretch bg-neutral-200 dark:bg-neutral-700" />
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Vendidas</p>
            <p className="text-sm font-semibold tabular-nums text-neutral-800 dark:text-neutral-100">
              {totalVendidas}
            </p>
          </div>
          <div className="w-px self-stretch bg-neutral-200 dark:bg-neutral-700" />
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Tasa global</p>
            <p className="text-sm font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
              {tasaGlobal.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="mb-1 grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3 px-3 text-xs">
          <SortButton col="nombre" current={sortKey} dir={sortDir} onSort={handleSort}>
            Asesor
          </SortButton>
          <SortButton col="totalGestiones" current={sortKey} dir={sortDir} onSort={handleSort}>
            Gestiones
          </SortButton>
          <SortButton col="totalVendidas" current={sortKey} dir={sortDir} onSort={handleSort}>
            Vendidas
          </SortButton>
          <SortButton col="tasaConversion" current={sortKey} dir={sortDir} onSort={handleSort}>
            Tasa
          </SortButton>
        </div>

        <div className="flex flex-col gap-1">
          {data.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-neutral-400 dark:text-neutral-500">
              Sin datos de conversión disponibles.
            </p>
          ) : (
            sorted.map((r) => {
              const barPct = Math.min(r.tasaConversion, 100);
              return (
                <div
                  key={r.asesorId}
                  className="rounded-xl px-3 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-3">
                    <span className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                      {r.nombre} {r.apellido}
                    </span>
                    <span className="tabular-nums text-xs text-neutral-500 dark:text-neutral-400">
                      {r.totalGestiones}
                    </span>
                    <span className="tabular-nums text-xs text-neutral-500 dark:text-neutral-400">
                      {r.totalVendidas}
                    </span>
                    <TasaBadge pct={r.tasaConversion} />
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-indigo-400/60 transition-all duration-700 dark:bg-indigo-500/50"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
