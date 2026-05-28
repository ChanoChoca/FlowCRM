"use client";

import { getDashboardAction } from "@/app/actions/dashboard";
import type { DashboardSupervisor } from "@/types/dashboard";
import { useCallback, useTransition } from "react";
import DonutChart from "../charts/DonutChart";
import Heatmap from "../charts/Heatmap";
import Leaderboard from "../charts/Leaderboard";
import VentasAreaChart from "../charts/VentasAreaChart";
import AlertBanner from "../widgets/AlertBanner";
import DesafioCard from "../widgets/DesafioCard";
import ConversionEquipo from "../widgets/ConversionEquipo";
import DesafioHistorial from "../widgets/DesafioHistorial";
import TasaConversionEquipo from "../widgets/TasaConversionEquipo";
import KpiCardWidget from "../widgets/KpiCardWidget";
import ProgressMeta from "../widgets/ProgressMeta";
import QuickActions from "../widgets/QuickActions";

export default function SupervisorView({
  data,
  onDataRefresh,
}: {
  data: DashboardSupervisor;
  onDataRefresh: (next: DashboardSupervisor) => void;
}) {
  const [, startTransition] = useTransition();

  const handleRefresh = useCallback(() => {
    startTransition(async () => {
      try {
        const next = await getDashboardAction();
        if (next.type === "SUPERVISOR") {
          onDataRefresh(next as DashboardSupervisor);
        }
      } catch {
        // silently fail — el dashboard seguirá mostrando los datos anteriores
      }
    });
  }, [onDataRefresh]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
          {data.saludo}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {data.fechaActual}
        </p>
        {data.alertas.length > 0 && (
          <div className="mt-3">
            <AlertBanner alertas={data.alertas} />
          </div>
        )}
      </div>

      <div className="stagger-children grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KpiCardWidget data={data.ventasEquipoHoy} />
        <KpiCardWidget data={data.ventasEquipoSemana} />
        <KpiCardWidget data={data.ventasEquipoMes} />
        <KpiCardWidget data={data.coberturaEquipo} />
        <KpiCardWidget data={data.porcentajeMetaGrupal} />
        <KpiCardWidget data={data.promedioPorAsesor} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ProgressMeta data={data.metaGrupalProgress} />
        </div>
        <div className="lg:col-span-2">
          <QuickActions acciones={data.accionesRapidas} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Leaderboard
            asesores={data.equipoLeaderboard}
            promedio={data.promedioEquipo}
            equipoCampeon={data.equipoCampeon}
          />
        </div>
        <div className="lg:col-span-2">
          <VentasAreaChart
            data={data.ventasEquipoUltimos30Dias}
            title="Ventas del equipo (30 días)"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Heatmap data={data.heatmap} title="Actividad del equipo" />
        <DonutChart
          data={data.distribucionTurnoEquipo}
          title="Distribución AM/PM"
        />
        <DesafioCard
          data={data.desafioActivo}
          isSupervisor
          onRefresh={handleRefresh}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ConversionEquipo asesores={data.equipoLeaderboard} />
        <DesafioHistorial />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TasaConversionEquipo />
      </div>
    </div>
  );
}
