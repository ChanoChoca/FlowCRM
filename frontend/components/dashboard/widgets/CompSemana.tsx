"use client";

import { Trophy, ArrowRight } from "lucide-react";
import type { CompSemana } from "@/types/dashboard";
import { useCountUp } from "../hooks";
import { fmtNumber } from "../utils";

export default function CompSemanaWidget({ data }: { data: CompSemana }) {
  const actual = useCountUp(data.ventasSemanaActual);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="flex items-center gap-2">
        <Trophy
          className={`h-5 w-5 ${data.yaSuperada ? "text-amber-500 dark:text-amber-400" : "text-neutral-400 dark:text-neutral-500"}`}
        />
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Tu semana</h3>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{fmtNumber(actual)}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Esta semana</p>
        </div>
        <ArrowRight className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
        <div className="text-center">
          <p className="text-2xl font-bold text-neutral-400 dark:text-neutral-500">
            {fmtNumber(data.mejorSemanaPrevia)}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Tu mejor semana</p>
        </div>
      </div>

      {data.yaSuperada ? (
        <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          {data.mensajeContextual}
        </div>
      ) : (
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          {data.mensajeContextual}
        </p>
      )}
    </div>
  );
}
