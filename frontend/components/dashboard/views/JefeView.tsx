"use client";

import type { DashboardJefeSupervisor } from "@/types/dashboard";
import { TrendingDown, TrendingUp } from "lucide-react";
import OrigenStackedChart from "../charts/OrigenStackedChart";
import VentasAreaChart from "../charts/VentasAreaChart";
import SupervisoresGrid from "../SupervisoresGrid";
import { fmtPct, tendenciaColor } from "../utils";
import AlertBanner from "../widgets/AlertBanner";
import KpiCardWidget from "../widgets/KpiCardWidget";
import QuickActions from "../widgets/QuickActions";
import RankingEquipos from "../widgets/RankingEquipos";

export default function JefeView({ data }: { data: DashboardJefeSupervisor }) {
  const tColor = tendenciaColor(data.tendenciaMesPct);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
              {data.saludo}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {data.fechaActual}
            </p>
          </div>
          {data.tendenciaMesPct !== null && (
            <div
              className={`flex items-center gap-1 rounded-lg bg-white/80 px-3 py-1.5 text-sm font-medium backdrop-blur-sm dark:bg-neutral-800/60 ${tColor}`}
            >
              {data.tendenciaMesPct > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {fmtPct(data.tendenciaMesPct)} este mes
            </div>
          )}
        </div>
        {data.alertas.length > 0 && (
          <div className="mt-3">
            <AlertBanner alertas={data.alertas} />
          </div>
        )}
      </div>

      <div className="stagger-children grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCardWidget data={data.ventasAmbitoHoy} />
        <KpiCardWidget data={data.ventasAmbitoSemana} />
        <KpiCardWidget data={data.ventasAmbitoMes} />
        <KpiCardWidget data={data.equiposEnRiesgo} />
        <KpiCardWidget data={data.promedioEquipos} />
      </div>

      <SupervisoresGrid supervisores={data.supervisoresResumen} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <VentasAreaChart
            data={data.evolucionUltimos56Dias}
            title="Evolución de ventas (56 días)"
          />
        </div>
        <div className="lg:col-span-2">
          <RankingEquipos supervisores={data.supervisoresResumen} />
        </div>
      </div>

      <OrigenStackedChart
        data={data.origenCrm14Dias}
        title="Origen: CRM vs PowerApp (14 días)"
      />

      <QuickActions acciones={data.accionesRapidas} />
    </div>
  );
}
