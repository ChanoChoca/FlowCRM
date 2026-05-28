"use client";

import type { TasaConversion } from "@/types/dashboard";
import { useCountUpDecimal } from "../hooks";

// Angles in degrees: 0=right, 90=bottom, 180=left, 270=top (standard SVG coords)
// startAngle < endAngle draws clockwise. For the gauge top-semicircle use 180→360.
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const toRad = (a: number) => (a * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export default function GaugeChart({ data }: { data: TasaConversion }) {
  // ── La tasa ya viene calculada (real o proxy) desde el backend ──
  const mainPct = data.tasaConversion;

  const animated = useCountUpDecimal(mainPct, 1);

  // En modo real el gauge va de 0–100 (% de conversión, cap 100).
  // En modo proxy igual: alcance de meta 0–100.
  const clampedPct = Math.min(mainPct, 100);

  const cx = 100;
  const cy = 83;
  const r = 70;
  const startAngle = 180;
  const endAngle = 360;
  // Cap at 99.99% visually: when start===end SVG collapses the arc to a straight line
  const visualPct = Math.min(clampedPct, 99.99);
  const valueAngle = startAngle + (visualPct / 100) * (endAngle - startAngle);

  // Umbrales alineados con estadoGauge() del record Java (25 / 15)
  const gaugeColor =
    mainPct >= 25 ? "#22c55e" : mainPct >= 15 ? "#eab308" : "#ef4444";

  const label =
    data.metricaPrincipal === "conversion_real"
      ? "Conversión real"
      : "Alcance de meta";

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
        Tasa de conversión
      </h3>

      <div className="mt-2 flex flex-col items-center">
        {/* viewBox: 200 wide, cy=83 r=70 → top at y=13, stroke half=7 → top edge y=6, bottom at y=83+7=90 */}
        <svg viewBox="0 0 200 92" className="w-full max-w-55">
          {/* Background arc: 180°→360° (left→top→right, clockwise) */}
          <path
            d={describeArc(cx, cy, r, startAngle, endAngle)}
            fill="none"
            stroke="#f0f0f0"
            strokeWidth={14}
            strokeLinecap="round"
          />
          {/* Zone hints: 180° span → rojo 0-15% (27°), amarillo 15-25% (18°), verde 25-100% (135°) */}
          <path
            d={describeArc(cx, cy, r, 180, 207)}
            fill="none"
            stroke="#fef2f2"
            strokeWidth={14}
            strokeLinecap="round"
          />
          <path
            d={describeArc(cx, cy, r, 207, 225)}
            fill="none"
            stroke="#fefce8"
            strokeWidth={14}
          />
          <path
            d={describeArc(cx, cy, r, 225, 360)}
            fill="none"
            stroke="#f0fdf4"
            strokeWidth={14}
            strokeLinecap="round"
          />
          {/* Value arc */}
          {clampedPct > 0 && (
            <path
              d={describeArc(cx, cy, r, startAngle, valueAngle)}
              fill="none"
              stroke={gaugeColor}
              strokeWidth={14}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          )}
          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            className="fill-neutral-900 dark:fill-neutral-100"
            style={{ fontSize: 28, fontWeight: 700 }}
          >
            {animated.toFixed(1)}%
          </text>
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            className="fill-neutral-500 dark:fill-neutral-400"
            style={{ fontSize: 11 }}
          >
            {label}
          </text>
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-neutral-50 p-2.5 text-center dark:bg-neutral-800/60">
          <p className="text-neutral-500 dark:text-neutral-400">
            {data.modoReal ? "Conversión" : "Alcance meta"}
          </p>
          <p className="font-semibold text-neutral-800 dark:text-neutral-100">
            {data.tasaConversion.toFixed(1)}%
          </p>
          {data.modoReal && (
            <p className="mt-0.5 text-neutral-400 dark:text-neutral-500">
              {data.totalVendidas}/{data.totalGestiones}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-neutral-50 p-2.5 text-center dark:bg-neutral-800/60">
          <p className="text-neutral-500 dark:text-neutral-400">Calidad pago</p>
          <p className="font-semibold text-neutral-800 dark:text-neutral-100">
            {data.tasaCalidad.toFixed(1)}%
          </p>
        </div>
      </div>

      {!data.modoReal && (
        <p className="mt-3 text-center text-[10px] text-neutral-400 dark:text-neutral-500">
          Módulo de gestiones no activado · mostrando alcance de meta
        </p>
      )}
    </div>
  );
}
