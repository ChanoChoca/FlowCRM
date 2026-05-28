"use client";

import { Users, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import type { SupervisorResumen } from "@/types/dashboard";
import { fmtNumber, tendenciaColor, fmtPct } from "./utils";

type Props = {
  supervisores: SupervisorResumen[];
};

export default function SupervisoresGrid({ supervisores }: Props) {
  const maxVentas = Math.max(...supervisores.map((s) => s.ventasMes), 1);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Supervisores</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {supervisores.map((s) => {
          const pct = (s.ventasMes / maxVentas) * 100;
          const tColor = tendenciaColor(s.tendenciaPctMes);

          return (
            <div
              key={s.usuarioId}
              className={`rounded-xl border p-4 transition-all hover:shadow-md ${
                s.equipoEnRiesgo
                  ? "border-amber-200/80 bg-amber-50/80 dark:border-amber-800/50 dark:bg-amber-950/40"
                  : "border-neutral-200/80 bg-white/60 dark:border-neutral-700/50 dark:bg-neutral-800/40"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-neutral-800 dark:text-neutral-100">
                    {s.nombre} {s.apellido}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <Users className="h-3.5 w-3.5" />
                    {s.totalAsesores} asesores
                  </div>
                </div>
                {s.equipoEnRiesgo && (
                  <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                )}
              </div>

              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                    {fmtNumber(s.ventasMes)}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">ventas/mes</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                    {fmtNumber(s.ventasHoy)}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">hoy</p>
                </div>
              </div>

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {s.tendenciaPctMes !== null && (
                <div className={`mt-2 flex items-center gap-1 text-xs ${tColor}`}>
                  {s.tendenciaPctMes > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {fmtPct(s.tendenciaPctMes)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
