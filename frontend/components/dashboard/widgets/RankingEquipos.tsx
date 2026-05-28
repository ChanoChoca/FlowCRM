"use client";

import type { SupervisorResumen } from "@/types/dashboard";
import { AlertTriangle, Medal, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { fmtNumber, fmtPct, tendenciaColor } from "../utils";

const MEDAL_COLOR: Record<number, string> = {
  0: "text-yellow-500 dark:text-yellow-400",
  1: "text-neutral-400 dark:text-neutral-300",
  2: "text-amber-600 dark:text-amber-500",
};

export default function RankingEquipos({
  supervisores,
}: {
  supervisores: SupervisorResumen[];
}) {
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(
    () => [...supervisores].sort((a, b) => b.ventasMes - a.ventasMes),
    [supervisores],
  );

  const maxVentas = sorted[0]?.ventasMes ?? 1;
  const visible = showAll ? sorted : sorted.slice(0, 5);
  const totalVentas = supervisores.reduce((s, r) => s + r.ventasMes, 0);
  const enRiesgo = supervisores.filter((s) => s.equipoEnRiesgo).length;

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Medal className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            Ranking de equipos
          </h3>
        </div>
        {enRiesgo > 0 && (
          <span className="flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            {enRiesgo} en riesgo
          </span>
        )}
      </div>

      {supervisores.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-neutral-100 bg-neutral-50/60 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-800/40">
          <Stat label="Total del ámbito" value={fmtNumber(totalVentas)} />
          <div className="w-px self-stretch bg-neutral-200 dark:bg-neutral-700" />
          <Stat
            label="Promedio por equipo"
            value={
              supervisores.length > 0
                ? fmtNumber(Math.round(totalVentas / supervisores.length))
                : "0"
            }
            highlight
          />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-1">
        {visible.map((s, idx) => {
          const barPct =
            maxVentas > 0 ? Math.round((s.ventasMes / maxVentas) * 100) : 0;
          const tColor = tendenciaColor(s.tendenciaPctMes);
          const medalColor = MEDAL_COLOR[idx] ?? "";

          return (
            <div
              key={s.usuarioId}
              className={`rounded-xl px-3 py-2.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${
                s.equipoEnRiesgo
                  ? "border border-amber-200/60 bg-amber-50/40 dark:border-amber-800/40 dark:bg-amber-950/20"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-5 shrink-0 text-center text-xs font-bold ${
                    idx < 3 ? medalColor : "text-neutral-400 dark:text-neutral-500"
                  }`}
                >
                  {idx < 3 ? "●" : idx + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                      {s.nombre} {s.apellido}
                    </span>
                    {s.equipoEnRiesgo && (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-amber-400" />
                    )}
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        idx === 0
                          ? "bg-indigo-500"
                          : s.equipoEnRiesgo
                            ? "bg-amber-400"
                            : "bg-indigo-400/60 dark:bg-indigo-500/50"
                      }`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="tabular-nums text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                    {fmtNumber(s.ventasMes)}
                  </span>
                  {s.tendenciaPctMes !== null && (
                    <span className={`flex items-center gap-0.5 text-xs ${tColor}`}>
                      {s.tendenciaPctMes > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {fmtPct(s.tendenciaPctMes)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length > 5 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
        >
          {showAll ? "Ver menos" : `Ver ${sorted.length - 5} más`}
        </button>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
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
