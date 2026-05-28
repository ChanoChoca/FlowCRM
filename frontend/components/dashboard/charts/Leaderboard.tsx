"use client";

import type { AsesorResumen } from "@/types/dashboard";
import { CheckCircle, Flame } from "lucide-react";
import { fmtNumber } from "../utils";

type Props = {
  asesores: AsesorResumen[];
  promedio: number;
  equipoCampeon?: boolean;
};

export default function Leaderboard({
  asesores,
  promedio,
  equipoCampeon,
}: Props) {
  const maxVentas = Math.max(...asesores.map((a) => a.ventasMes), 1);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Equipo
        </h3>
        {equipoCampeon && (
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            <span>🏆</span> Equipo campeón
          </span>
        )}
      </div>

      <div className="mt-3 mb-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="h-px flex-1 border-t border-dashed border-neutral-300 dark:border-neutral-700" />
        <span>Promedio: {fmtNumber(promedio)}</span>
        <div className="h-px flex-1 border-t border-dashed border-neutral-300 dark:border-neutral-700" />
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {asesores.map((a) => {
          const pct = maxVentas > 0 ? (a.ventasMes / maxVentas) * 100 : 0;
          const isAboveAvg = a.ventasMes >= promedio;

          return (
            <div
              key={a.usuarioId}
              className="group rounded-lg p-1.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-700 dark:text-neutral-200">
                    {a.nombre} {a.apellido}
                  </span>
                  {a.enRacha && (
                    <Flame className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />
                  )}
                  {a.conVentasHoy && (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                  )}
                </div>
                <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                  {fmtNumber(a.ventasMes)}
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isAboveAvg
                      ? "bg-indigo-500"
                      : "bg-indigo-300 dark:bg-indigo-700"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
