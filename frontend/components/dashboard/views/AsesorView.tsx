"use client";

import type { DashboardAsesor } from "@/types/dashboard";
import DonutChart from "../charts/DonutChart";
import Heatmap from "../charts/Heatmap";
import VentasAreaChart from "../charts/VentasAreaChart";
import AlertBanner from "../widgets/AlertBanner";
import BadgeGallery from "../widgets/BadgeGallery";
import CompSemanaWidget from "../widgets/CompSemana";
import ComparativaWidget from "../widgets/ComparativaWidget";
import DesafioCard from "../widgets/DesafioCard";
import KpiCardWidget from "../widgets/KpiCardWidget";
import MiTasaConversion from "../widgets/MiTasaConversion";
import ProgressMeta from "../widgets/ProgressMeta";
import QuickActions from "../widgets/QuickActions";
import RachaWidget from "../widgets/RachaWidget";
import RankingToggle from "../widgets/RankingToggle";

export default function AsesorView({ data }: { data: DashboardAsesor }) {
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

      <div className="stagger-children grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCardWidget data={data.ventasHoy} />
        <KpiCardWidget data={data.ventasSemana} />
        <KpiCardWidget data={data.ventasMes} />
        <KpiCardWidget data={data.porcentajeMeta} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <ProgressMeta data={data.metaProgress} />
          <RachaWidget data={data.racha} />
          <CompSemanaWidget data={data.comparativaSemana} />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-2">
          <QuickActions acciones={data.accionesRapidas} />
          <DesafioCard data={data.desafioActivo} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <VentasAreaChart
            data={data.ventasUltimos30Dias}
            title="Evolución de ventas (30 días)"
          />
        </div>
        <div className="lg:col-span-2">
          <Heatmap data={data.actividadHeatmap} title="Actividad" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ComparativaWidget data={data.comparativa} />
        </div>
        <div className="lg:col-span-2">
          <DonutChart
            data={data.distribucionTurno}
            title="Distribución AM/PM"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <BadgeGallery badges={data.badges} />
          <RankingToggle initial={data.rankingOpcional} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-4">
          <KpiCardWidget data={data.consistencia} />
          <MiTasaConversion />
        </div>
      </div>
    </div>
  );
}
