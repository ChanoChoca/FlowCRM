"use client";

import { useState, useTransition } from "react";
import { BarChart3, Eye, EyeOff } from "lucide-react";
import type { RankingOpcional } from "@/types/dashboard";
import { toggleRankingAction } from "@/app/actions/dashboard";
import { fmtNumber } from "../utils";

export default function RankingToggle({
  initial,
}: {
  initial: RankingOpcional;
}) {
  const [ranking, setRanking] = useState(initial);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const result = await toggleRankingAction();
        setRanking(result);
      } catch {
        // silently fail
      }
    });
  };

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            Ranking del equipo
          </h3>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200/80 px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-all hover:scale-105 hover:bg-neutral-50 active:scale-95 disabled:opacity-50 dark:border-neutral-700/50 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
        >
          {ranking.activo ? (
            <>
              <EyeOff className="h-3.5 w-3.5" /> Ocultar
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" /> Ver posición
            </>
          )}
        </button>
      </div>

      {ranking.activo && ranking.posicion !== null && (
        <div className="mt-4 flex items-center gap-6">
          <div>
            <p className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
              #{ranking.posicion}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              de {ranking.totalAsesores} asesores
            </p>
          </div>
          <div className="h-10 w-px bg-neutral-200 dark:bg-neutral-700" />
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Promedio equipo
            </p>
            <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">
              {fmtNumber(ranking.promedioEquipo ?? 0)}
            </p>
          </div>
          <div className="h-10 w-px bg-neutral-200 dark:bg-neutral-700" />
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Tus ventas
            </p>
            <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">
              {fmtNumber(ranking.propiasMesActual)}
            </p>
          </div>
        </div>
      )}

      {!ranking.activo && (
        <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
          Activá el ranking para ver tu posición en el equipo.
        </p>
      )}
    </div>
  );
}
