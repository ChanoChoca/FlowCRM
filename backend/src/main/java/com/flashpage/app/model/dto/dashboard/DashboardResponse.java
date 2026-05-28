package com.flashpage.app.model.dto.dashboard;

import java.util.List;

import com.flashpage.app.model.dto.dashboard.DashboardDTOs.AccionRapida;
import com.flashpage.app.model.dto.dashboard.DashboardDTOs.Alerta;
import com.flashpage.app.model.dto.dashboard.DashboardDTOs.AsesorResumen;
import com.flashpage.app.model.dto.dashboard.DashboardDTOs.Badge;
import com.flashpage.app.model.dto.dashboard.DashboardDTOs.CompSemana;
import com.flashpage.app.model.dto.dashboard.DashboardDTOs.ComparativaAsesor;
import com.flashpage.app.model.dto.dashboard.DashboardDTOs.HeatmapDia;
import com.flashpage.app.model.dto.dashboard.DashboardDTOs.KpiCard;
import com.flashpage.app.model.dto.dashboard.DashboardDTOs.MetaProgress;
import com.flashpage.app.model.dto.dashboard.DashboardDTOs.OrigenTendenciaDia;
import com.flashpage.app.model.dto.dashboard.DashboardDTOs.Racha;
import com.flashpage.app.model.dto.dashboard.DashboardDTOs.RankingOpcional;
import com.flashpage.app.model.dto.dashboard.DashboardDTOs.Segmento;
import com.flashpage.app.model.dto.dashboard.DashboardDTOs.StatsDebito;
import com.flashpage.app.model.dto.dashboard.DashboardDTOs.StatsUsuarios;
import com.flashpage.app.model.dto.dashboard.DashboardDTOs.SupervisorResumen;
import com.flashpage.app.model.dto.dashboard.DashboardDTOs.VentasPorDia;
import com.flashpage.app.model.dto.dashboard.DesafioDTOs.DesafioCardResponse;
import com.flashpage.app.model.dto.dashboard.DesafioDTOs.DesafioResponse;

public final class DashboardResponse {

        private DashboardResponse() {
        }

        public record DashboardAsesor(
                        String saludo,
                        String fechaActual,
                        List<Alerta> alertas,

                        KpiCard ventasHoy,
                        KpiCard ventasSemana,
                        KpiCard ventasMes,
                        KpiCard porcentajeMeta,
                        KpiCard consistencia,

                        MetaProgress metaProgress,
                        CompSemana comparativaSemana,
                        Racha racha,
                        List<Badge> badges,

                        List<AccionRapida> accionesRapidas,

                        List<VentasPorDia> ventasUltimos30Dias,
                        List<Segmento> distribucionTurno,
                        List<HeatmapDia> actividadHeatmap,
                        RankingOpcional rankingOpcional,
                        DesafioCardResponse desafioActivo,
                        ComparativaAsesor comparativa) implements Dashboard {
        }

        public record DashboardSupervisor(
                        String saludo,
                        String fechaActual,
                        List<Alerta> alertas,

                        KpiCard ventasEquipoHoy,
                        KpiCard ventasEquipoSemana,
                        KpiCard ventasEquipoMes,
                        KpiCard coberturaEquipo,
                        KpiCard porcentajeMetaGrupal,
                        KpiCard promedioPorAsesor,

                        MetaProgress metaGrupalProgress,

                        List<AsesorResumen> equipoLeaderboard,
                        double promedioEquipo,

                        boolean equipoCampeon,

                        List<VentasPorDia> ventasEquipoUltimos30Dias,

                        List<Segmento> distribucionTurnoEquipo,
                        List<HeatmapDia> heatmap,
                        DesafioResponse desafioActivo,
                        List<AccionRapida> accionesRapidas) implements Dashboard {
        }

        public record DashboardJefeSupervisor(
                        String saludo,
                        String fechaActual,
                        List<Alerta> alertas,

                        KpiCard ventasAmbitoHoy,
                        KpiCard ventasAmbitoSemana,
                        KpiCard ventasAmbitoMes,
                        KpiCard equiposEnRiesgo,
                        KpiCard promedioEquipos,

                        Double tendenciaMesPct,

                        List<SupervisorResumen> supervisoresResumen,

                        List<VentasPorDia> evolucionUltimos56Dias,

                        List<OrigenTendenciaDia> origenCrm14Dias,

                        List<AccionRapida> accionesRapidas) implements Dashboard {
        }

        public record DashboardGerente(
                        String saludo,
                        String fechaActual,
                        List<Alerta> alertas,

                        DashboardFiltro filtroActivo,

                        KpiCard ventasHoy,
                        KpiCard ventasSemana,
                        KpiCard ventasMes,
                        KpiCard porcentajeDebitoAuto,

                        TasaConversion tasaConversion,

                        List<Segmento> ventasPorCentral,
                        List<Segmento> ventasPorProducto,
                        List<Segmento> ventasPorPromo,
                        List<Segmento> distribucionTurno,
                        List<Segmento> distribucionMetodosPago,

                        List<OrigenTendenciaDia> origenVentas,

                        List<VentasPorDia> evolucionPeriodo,
                        StatsDebito statsDebito,

                        List<AccionRapida> accionesRapidas) implements Dashboard {
        }

        public record DashboardLider(
                        String saludo,
                        String fechaActual,
                        List<Alerta> alertas,

                        DashboardFiltro filtroActivo,

                        KpiCard ventasHoy,
                        KpiCard ventasSemana,
                        KpiCard ventasMes,
                        KpiCard porcentajeDebitoAuto,

                        TasaConversion tasaConversion,

                        List<Segmento> ventasPorCentral,
                        List<Segmento> ventasPorProducto,
                        List<Segmento> ventasPorPromo,
                        List<Segmento> distribucionTurno,

                        List<OrigenTendenciaDia> origenVentas14Dias,

                        List<Segmento> ventasPorProvincia,

                        List<VentasPorDia> evolucionUltimos90Dias,
                        StatsDebito statsDebito,

                        long usuariosActivosConLoginUltimos7Dias,
                        long usuariosSinLoginUltimos30Dias,

                        List<AccionRapida> accionesRapidas) implements Dashboard {
        }

        public record DashboardAdmin(
                        String saludo,
                        String fechaActual,
                        List<Alerta> alertas,

                        KpiCard ventasSinObservaciones,
                        KpiCard usuariosActivos,
                        KpiCard usuariosInactivos,
                        KpiCard usuariosIncompletos,
                        KpiCard altasMes,
                        KpiCard bajasMes,

                        StatsUsuarios statsUsuarios,

                        List<Segmento> distribucionMetodosPago,
                        StatsDebito statsDebito,

                        List<VentasPorDia> ventasDiariasEsteMes,

                        List<AccionRapida> accionesRapidas) implements Dashboard {
        }
}