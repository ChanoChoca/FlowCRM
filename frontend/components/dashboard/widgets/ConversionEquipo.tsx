"use client";

import type { AsesorResumen } from "@/types/dashboard";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { fmtNumber } from "../utils";

type SortKey = "nombre" | "ventasMes" | "proporcionEnEquipo";
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

function ProporcionBadge({ pct }: { pct: number }) {
  const color =
    pct >= 30
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
      : pct >= 15
        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
        : "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400";

  return (
    <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold tabular-nums ${color}`}>
      {pct.toFixed(1)}%
    </span>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
      <p
        className={`text-sm font-semibold tabular-nums ${
          highlight
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-neutral-800 dark:text-neutral-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function ConversionEquipo({ asesores }: { asesores: AsesorResumen[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("ventasMes");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    return [...asesores].sort((a, b) => {
      let diff = 0;
      if (sortKey === "nombre") {
        diff = `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`);
      } else {
        diff = (a[sortKey] as number) - (b[sortKey] as number);
      }
      return sortDir === "desc" ? -diff : diff;
    });
  }, [asesores, sortKey, sortDir]);

  const totalVentas = asesores.reduce((s, r) => s + r.ventasMes, 0);
  const conVentasHoy = asesores.filter((r) => r.conVentasHoy).length;
  const maxVentas = Math.max(...asesores.map((r) => r.ventasMes), 1);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Ventas por asesor
        </h3>
      </div>

      {asesores.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-neutral-100 bg-neutral-50/60 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-800/40">
          <Stat label="Total del equipo" value={fmtNumber(totalVentas)} />
          <div className="w-px self-stretch bg-neutral-200 dark:bg-neutral-700" />
          <Stat label="Asesores activos hoy" value={`${conVentasHoy} / ${asesores.length}`} />
          <div className="w-px self-stretch bg-neutral-200 dark:bg-neutral-700" />
          <Stat
            label="Promedio por asesor"
            value={asesores.length > 0 ? fmtNumber(Math.round(totalVentas / asesores.length)) : "0"}
            highlight
          />
        </div>
      )}

      <div className="mt-4">
        <div className="mb-1 grid grid-cols-[1fr_auto_auto] items-center gap-x-4 px-3 text-xs">
          <SortButton col="nombre" current={sortKey} dir={sortDir} onSort={handleSort}>
            Asesor
          </SortButton>
          <SortButton col="ventasMes" current={sortKey} dir={sortDir} onSort={handleSort}>
            Ventas mes
          </SortButton>
          <SortButton col="proporcionEnEquipo" current={sortKey} dir={sortDir} onSort={handleSort}>
            % equipo
          </SortButton>
        </div>

        <div className="flex flex-col gap-1">
          {asesores.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-neutral-400 dark:text-neutral-500">
              Sin asesores en el equipo.
            </p>
          ) : (
            sorted.map((r) => {
              const barPct =
                maxVentas > 0 ? Math.round((r.ventasMes / maxVentas) * 100) : 0;

              return (
                <div
                  key={r.usuarioId}
                  className="rounded-xl px-3 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                        {r.nombre} {r.apellido}
                      </span>
                      {r.enRacha && (
                        <span className="shrink-0 text-xs" title="En racha">
                          🔥
                        </span>
                      )}
                    </div>
                    <span className="tabular-nums text-xs text-neutral-500 dark:text-neutral-400">
                      {fmtNumber(r.ventasMes)}
                    </span>
                    <ProporcionBadge pct={r.proporcionEnEquipo} />
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
