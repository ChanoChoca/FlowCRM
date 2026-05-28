"use client";

import type { DashboardFiltro, DashboardGerente } from "@/types/dashboard";
import DonutChart from "../charts/DonutChart";
import GaugeChart from "../charts/GaugeChart";
import OrigenStackedChart from "../charts/OrigenStackedChart";
import TopBarChart from "../charts/TopBarChart";
import VentasAreaChart from "../charts/VentasAreaChart";
import Filtros from "../Filtros";
import AlertBanner from "../widgets/AlertBanner";
import KpiCardWidget from "../widgets/KpiCardWidget";
import QuickActions from "../widgets/QuickActions";
import StatsDebitoWidget from "../widgets/StatsDebitoWidget";

type Props = {
  data: DashboardGerente;
  onFilterChange: (filtro: Partial<DashboardFiltro>) => void;
  onFilterReset: () => void;
};

export default function GerenteView({
  data,
  onFilterChange,
  onFilterReset,
}: Props) {
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
        <div className="mt-3">
          <Filtros
            filtro={data.filtroActivo}
            onChange={onFilterChange}
            onReset={onFilterReset}
          />
        </div>
      </div>

      <div className="stagger-children grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCardWidget data={data.ventasHoy} />
        <KpiCardWidget data={data.ventasSemana} />
        <KpiCardWidget data={data.ventasMes} />
        <KpiCardWidget data={data.porcentajeDebitoAuto} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <GaugeChart data={data.tasaConversion} />
        </div>
        <div className="lg:col-span-2">
          <StatsDebitoWidget data={data.statsDebito} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TopBarChart data={data.ventasPorCentral} title="Ventas por central" />
        <DonutChart data={data.ventasPorProducto} title="Ventas por producto" />
        <DonutChart data={data.ventasPorPromo} title="Ventas por promo" />
        <DonutChart data={data.distribucionTurno} title="Distribución AM/PM" />
        <DonutChart
          data={data.distribucionMetodosPago}
          title="Métodos de pago"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <VentasAreaChart
          data={data.evolucionPeriodo}
          title="Evolución del periodo"
        />
        <OrigenStackedChart
          data={data.origenVentas}
          title="Origen: CRM vs PowerApp"
        />
      </div>

      <QuickActions acciones={data.accionesRapidas} />
    </div>
  );
}
