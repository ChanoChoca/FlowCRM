"use client";

import { getConversionPropiaAction } from "@/app/actions/gestiones";
import type { ConversionPropiaResumen } from "@/types/dashboard";
import { Percent } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

function TasaBadge({ pct }: { pct: number }) {
  const color =
    pct >= 50
      ? "text-emerald-600 dark:text-emerald-400"
      : pct >= 25
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-500 dark:text-red-400";
  return <span className={`text-3xl font-bold tabular-nums ${color}`}>{pct.toFixed(1)}%</span>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-neutral-800 dark:text-neutral-100">
        {value}
      </p>
    </div>
  );
}

export default function MiTasaConversion() {
  const [data, setData] = useState<ConversionPropiaResumen | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getConversionPropiaAction();
      setData(result);
      setLoaded(true);
    });
  }, []);

  if (!loaded && isPending) {
    return (
      <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-neutral-400" />
          <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
            Mi tasa de conversión
          </span>
        </div>
        <div className="mt-4 h-20 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
      </div>
    );
  }

  if (!loaded) return null;

  const noData = !data || data.totalGestiones === 0;

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="flex items-center gap-2">
        <Percent className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Mi tasa de conversión
        </h3>
        <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">este mes</span>
      </div>

      {noData ? (
        <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
          Sin gestiones registradas este mes.
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-col items-center gap-1">
            <TasaBadge pct={data.tasaConversion} />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">de conversión</p>
          </div>

          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                data.tasaConversion >= 50
                  ? "bg-emerald-500"
                  : data.tasaConversion >= 25
                    ? "bg-amber-400"
                    : "bg-red-400"
              }`}
              style={{ width: `${Math.min(data.tasaConversion, 100)}%` }}
            />
          </div>

          <div className="mt-4 flex justify-around">
            <Stat label="Gestiones" value={String(data.totalGestiones)} />
            <div className="w-px self-stretch bg-neutral-200 dark:bg-neutral-700" />
            <Stat label="Vendidas" value={String(data.totalVendidas)} />
            <div className="w-px self-stretch bg-neutral-200 dark:bg-neutral-700" />
            <Stat
              label="Sin cerrar"
              value={String(data.totalGestiones - data.totalVendidas)}
            />
          </div>
        </>
      )}
    </div>
  );
}
