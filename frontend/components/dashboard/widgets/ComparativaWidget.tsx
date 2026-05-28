"use client";

import {
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarDays,
  Users,
  Target,
  Zap,
} from "lucide-react";
import type { ComparativaAsesor } from "@/types/dashboard";
import { useCountUp } from "../hooks";
import { fmtNumber, fmtPct, tendenciaColor } from "../utils";

function TendenciaBadge({ pct }: { pct: number | null }) {
  if (pct === null)
    return <span className="text-xs text-neutral-400 dark:text-neutral-500">—</span>;
  const color = tendenciaColor(pct);
  const Icon = pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${color}`}>
      <Icon className="h-3 w-3" />
      {fmtPct(pct)}
    </span>
  );
}

function CompRow({
  label,
  valor,
  tendencia,
  sublabel,
}: {
  label: string;
  valor: number;
  tendencia: number | null;
  sublabel?: string;
}) {
  const animated = useCountUp(valor);
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
        {sublabel && (
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{sublabel}</p>
        )}
      </div>
      <div className="flex items-center gap-2 text-right">
        <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
          {fmtNumber(animated)}
        </span>
        <TendenciaBadge pct={tendencia} />
      </div>
    </div>
  );
}

export default function ComparativaWidget({ data }: { data: ComparativaAsesor }) {
  const forecastAnimated = useCountUp(data.forecastCierreMes);
  const promedioAnimated = useCountUp(Math.round(data.promedioEquipo));

  const forecastEnCamino = data.forecastPorcentajeMeta >= 100;
  const forecastColor = forecastEnCamino
    ? "text-emerald-700 dark:text-emerald-400"
    : data.forecastPorcentajeMeta >= 75
    ? "text-amber-700 dark:text-amber-400"
    : "text-red-600 dark:text-red-400";

  const forecastBg = forecastEnCamino
    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/50"
    : data.forecastPorcentajeMeta >= 75
    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/50"
    : "bg-red-50 dark:bg-red-950/40 border-red-200/80 dark:border-red-800/50";

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Comparativa & Proyección
        </h3>
      </div>

      {/* Comparativas mensuales */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-1.5 mb-1">
          <CalendarDays className="h-3.5 w-3.5 text-neutral-400" />
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Evolución mensual
          </p>
        </div>

        <CompRow
          label="Mes anterior"
          valor={data.ventasMesAnterior}
          tendencia={data.tendenciaMesAnterior}
          sublabel="vs este mes"
        />
        <CompRow
          label="Mismo mes, año pasado"
          valor={data.ventasMismoMesAnioAnterior}
          tendencia={data.tendenciaAnual}
          sublabel="variación interanual"
        />
      </div>

      <div className="border-t border-neutral-100 dark:border-neutral-800 my-3" />

      {/* Posición en equipo */}
      {data.posicionEquipo !== null && data.totalEquipo !== null && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="h-3.5 w-3.5 text-neutral-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              En el equipo
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                #{data.posicionEquipo}
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                de {data.totalEquipo}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Prom. equipo</p>
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {fmtNumber(promedioAnimated)} ventas
              </p>
            </div>
          </div>

          {/* Barra de posición */}
          <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-400 dark:bg-indigo-500 transition-all duration-700"
              style={{
                width: `${Math.max(5, ((data.totalEquipo - data.posicionEquipo + 1) / data.totalEquipo) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {data.posicionEquipo !== null && (
        <div className="border-t border-neutral-100 dark:border-neutral-800 my-3" />
      )}

      {/* Forecast */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Zap className="h-3.5 w-3.5 text-neutral-400" />
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Proyección de cierre
          </p>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Al ritmo actual ({data.promedioVentasDiarias.toFixed(1)}/día)
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              {data.diasRestantesMes} días restantes
            </p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${forecastColor}`}>
              {fmtNumber(forecastAnimated)}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {data.forecastPorcentajeMeta.toFixed(0)}% de la meta
            </p>
          </div>
        </div>

        {/* Barra de forecast */}
        <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              forecastEnCamino
                ? "bg-emerald-400 dark:bg-emerald-500"
                : data.forecastPorcentajeMeta >= 75
                ? "bg-amber-400 dark:bg-amber-500"
                : "bg-red-400 dark:bg-red-500"
            }`}
            style={{ width: `${Math.min(data.forecastPorcentajeMeta, 100)}%` }}
          />
        </div>

        <div className={`mt-3 rounded-xl border px-3 py-2.5 text-xs ${forecastBg}`}>
          <p className={`font-medium ${forecastColor}`}>{data.mensajeForecast}</p>
        </div>
      </div>
    </div>
  );
}
