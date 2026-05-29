package com.flashpage.app.dashboard.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flashpage.app.dashboard.dto.AsesorResumenProjection;
import com.flashpage.app.dashboard.dto.Dashboard;
import com.flashpage.app.dashboard.dto.DashboardDTOs;
import com.flashpage.app.dashboard.dto.DashboardDTOs.AccionRapida;
import com.flashpage.app.dashboard.dto.DashboardDTOs.ActividadUsuario;
import com.flashpage.app.dashboard.dto.DashboardDTOs.Alerta;
import com.flashpage.app.dashboard.dto.DashboardDTOs.AsesorResumen;
import com.flashpage.app.dashboard.dto.DashboardDTOs.Badge;
import com.flashpage.app.dashboard.dto.DashboardDTOs.CompSemana;
import com.flashpage.app.dashboard.dto.DashboardDTOs.ComparativaAsesor;
import com.flashpage.app.dashboard.dto.DashboardDTOs.HeatmapDia;
import com.flashpage.app.dashboard.dto.DashboardDTOs.KpiCard;
import com.flashpage.app.dashboard.dto.DashboardDTOs.MetaProgress;
import com.flashpage.app.dashboard.dto.DashboardDTOs.OrigenTendenciaDia;
import com.flashpage.app.dashboard.dto.DashboardDTOs.Racha;
import com.flashpage.app.dashboard.dto.DashboardDTOs.RankingOpcional;
import com.flashpage.app.dashboard.dto.DashboardDTOs.Segmento;
import com.flashpage.app.dashboard.dto.DashboardDTOs.StatsDebito;
import com.flashpage.app.dashboard.dto.DashboardDTOs.StatsUsuarios;
import com.flashpage.app.dashboard.dto.DashboardDTOs.SupervisorResumen;
import com.flashpage.app.dashboard.dto.DashboardDTOs.VentasPorDia;
import com.flashpage.app.dashboard.dto.DashboardFiltro;
import com.flashpage.app.dashboard.dto.DashboardResponse.DashboardAdmin;
import com.flashpage.app.dashboard.dto.DashboardResponse.DashboardAsesor;
import com.flashpage.app.dashboard.dto.DashboardResponse.DashboardGerente;
import com.flashpage.app.dashboard.dto.DashboardResponse.DashboardJefeSupervisor;
import com.flashpage.app.dashboard.dto.DashboardResponse.DashboardLider;
import com.flashpage.app.dashboard.dto.DashboardResponse.DashboardSupervisor;
import com.flashpage.app.dashboard.dto.DebutProductoProjection;
import com.flashpage.app.dashboard.dto.DesafioDTOs.DesafioCardResponse;
import com.flashpage.app.dashboard.dto.DesafioDTOs.DesafioResponse;
import com.flashpage.app.dashboard.dto.OrigenPorDiaProjection;
import com.flashpage.app.dashboard.dto.SegmentoProjection;
import com.flashpage.app.dashboard.dto.StatsDebitoProjection;
import com.flashpage.app.dashboard.dto.SupervisorResumenProjection;
import com.flashpage.app.dashboard.dto.TasaConversion;
import com.flashpage.app.dashboard.dto.TasaConversionProjection;
import com.flashpage.app.dashboard.dto.UsuarioFechaVentaProjection;
import com.flashpage.app.dashboard.dto.UsuarioVentaCountProjection;
import com.flashpage.app.dashboard.dto.VentasPorDiaProjection;
import com.flashpage.app.dashboard.model.MetaMensual;
import com.flashpage.app.dashboard.repository.GestionRepository;
import com.flashpage.app.dashboard.repository.MetaMensualRepository;
import com.flashpage.app.shared.exception.ValidationException;
import com.flashpage.app.usuario.model.Usuario;
import com.flashpage.app.usuario.repository.UsuarioRepository;
import com.flashpage.app.venta.repository.VentaRepository;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);
    private static final int META_DEFAULT = 30;
    private static final DateTimeFormatter FECHA_FORMATO = DateTimeFormatter.ofPattern("EEEE d 'de' MMMM", Locale.of("es", "AR"));

    private final VentaRepository ventaRepo;
    private final UsuarioRepository usuarioRepo;
    private final MetaMensualRepository metaRepo;
    private final DesafioService desafioService;
    private final GestionRepository gestionRepo;

    public DashboardService(VentaRepository ventaRepo, UsuarioRepository usuarioRepo,
            MetaMensualRepository metaRepo, DesafioService desafioService, GestionRepository gestionRepo) {
        this.ventaRepo = ventaRepo;
        this.usuarioRepo = usuarioRepo;
        this.metaRepo = metaRepo;
        this.desafioService = desafioService;
        this.gestionRepo = gestionRepo;
    }

    public Dashboard buildDashboard(Usuario usuario) {
        return buildDashboard(usuario, DashboardFiltro.mesActual());
    }

    public Dashboard buildDashboard(Usuario usuario, DashboardFiltro filtro) {
        return switch (usuario.getRol()) {
            case ASESOR -> buildAsesor(usuario);
            case SUPERVISOR -> buildSupervisor(usuario);
            case JEFE_DE_SUPERVISOR -> buildJefeSupervisor(usuario);
            case GERENTE -> buildGerente(usuario, filtro);
            case LIDER -> buildLider(usuario, filtro);
            case ADMINISTRACION_RRHH_COBRANZA -> buildAdmin(usuario);
            default -> throw new ValidationException("Rol sin dashboard: " + usuario.getRol());
        };
    }

    public Page<ActividadUsuario> getActividadUsuarios(Usuario usuario, int page, int size,
            String sortBy, String sortDir) {
        boolean desc = "desc".equalsIgnoreCase(sortDir);
        Page<Usuario> usuariosPage = switch (sortBy) {
            case "ventasMes" -> {
                Pageable p = PageRequest.of(page, size);
                yield desc ? usuarioRepo.findAsesoresActivosOrderByVentasMesDesc(p)
                        : usuarioRepo.findAsesoresActivosOrderByVentasMesAsc(p);
            }
            default -> {
                Sort.Direction dir = desc ? Sort.Direction.DESC : Sort.Direction.ASC;
                String col = switch (sortBy) {
                    case "ultimoLogin" -> "ultimoLogin";
                    case "activo" -> "activo";
                    default -> "apellido";
                };
                yield usuarioRepo.findAsesoresActivos(PageRequest.of(page, size,
                        Sort.by(dir, col).and(Sort.by(Sort.Direction.ASC, "apellido"))));
            }
        };

        List<Usuario> contenido = usuariosPage.getContent();
        if (contenido.isEmpty()) return new PageImpl<>(List.of(), PageRequest.of(page, size), usuariosPage.getTotalElements());

        List<Long> ids = contenido.stream().map(Usuario::getId).collect(Collectors.toList());
        Map<Long, Long> ventasMesMap = toMap(ventaRepo.findVentasMesBatch(ids));
        List<ActividadUsuario> items = contenido.stream()
                .map(u -> new ActividadUsuario(u.getId(), u.getNombre(), u.getApellido(), u.getRol().name(),
                        clasificarActividad(u.getUltimoLogin()), u.isActivo(),
                        ventasMesMap.getOrDefault(u.getId(), 0L), u.getUltimoLogin()))
                .collect(Collectors.toList());
        return new PageImpl<>(items, PageRequest.of(page, size), usuariosPage.getTotalElements());
    }

    // ─── ASESOR ──────────────────────────────────────────────────────────────

    private DashboardAsesor buildAsesor(Usuario asesor) {
        LocalDate hoy = LocalDate.now();
        YearMonth ym = YearMonth.now();

        long ventasHoy = ventaRepo.countVentasHoyByUsuario(asesor.getId());
        long ventasSemana = ventaRepo.countVentasSemanaByUsuario(asesor.getId());
        long ventasMes = ventaRepo.countVentasMesByUsuario(asesor.getId());
        long mejorMesPrev = ventaRepo.findMejorMesPrevioByUsuario(asesor.getId());
        YearMonth ymAnt = ym.minusMonths(1);
        long ventasMesAnt = ventaRepo.countVentasByUsuarioAndPeriodo(asesor.getId(), ymAnt.getYear(), ymAnt.getMonthValue());
        int meta = obtenerMeta(asesor.getId(), ym.getYear(), ym.getMonthValue());
        double pct = meta > 0 ? (ventasMes * 100.0 / meta) : 0;

        List<VentasPorDiaProjection> ventasMesRaw = ventaRepo.findVentasPorDiaByUsuarioRango(asesor.getId(), hoy.withDayOfMonth(1), hoy);
        KpiCard tasaCierre = buildTasaCierreAsesor(asesor.getId(), hoy, ventasMesRaw);
        long mejorSemanaPrev = ventaRepo.findMejorSemanaPreviaByUsuario(asesor.getId());
        CompSemana compSemana = CompSemana.calcular(ventasSemana, mejorSemanaPrev);
        Racha racha = calcularRacha(asesor.getId());
        List<Badge> badges = calcularBadgesAsesor(asesor, ventasHoy, ventasMes, racha);

        List<VentasPorDia> grafico = buildVentasPorDiaRango(asesor.getId(),
                hoy.minusDays(30), hoy, hoy.minusDays(60), hoy.minusDays(31),
                (uid, d, h) -> ventaRepo.findVentasPorDiaByUsuarioRango(uid, d, h));

        List<HeatmapDia> heatmap = buildHeatmap(ventasMesRaw);
        List<Segmento> turno = toSegmentos(ventaRepo.findDistribucionTurnoByUsuario(asesor.getId()));

        boolean rankingActivo = Boolean.TRUE.equals(usuarioRepo.findRankingPreferenceByUsuarioId(asesor.getId()));
        RankingOpcional ranking = rankingActivo ? calcularRankingOpcional(asesor)
                : new RankingOpcional(false, null, null, null, ventasMes);

        DesafioCardResponse desafio = asesor.getSupervisor() != null
                ? desafioService.getDesafioActivoCard(asesor.getSupervisor().getId()) : null;

        List<Alerta> alertas = buildAlertasAsesor(ventasHoy, hoy, pct, meta, ventasMes);
        ComparativaAsesor comparativa = buildComparativaAsesor(asesor, hoy, ym, ventasMes, meta);

        return new DashboardAsesor("¡Hola, " + asesor.getNombre() + "!", hoy.format(FECHA_FORMATO), alertas,
                kpi("Ventas hoy", ventasHoy, null, estadoNeutro(), null),
                kpi("Esta semana", ventasSemana, null, estadoNeutro(), null),
                kpi("Este mes", ventasMes, tendencia(ventasMes, ventasMesAnt), estadoPorcentaje(pct),
                        ventasMesAnt > 0 ? "Mes anterior: " + ventasMesAnt + " ventas" : null),
                kpi("Meta", (long) pct, null, estadoPorcentaje(pct),
                        (meta - ventasMes) > 0 ? (meta - ventasMes) + " ventas para cumplir tu meta" : "¡Meta cumplida!"),
                tasaCierre, buildMetaProgress(meta, ventasMes, mejorMesPrev), compSemana, racha, badges,
                List.of(new AccionRapida("NUEVA_VENTA", "Registrar venta", "plus", "/crm/ventas?nueva=true"),
                        new AccionRapida("MIS_VENTAS_MES", "Mis ventas del mes", "list", "/crm/ventas?desde=" + hoy.withDayOfMonth(1) + "&hasta=" + hoy),
                        new AccionRapida("MIS_VENTAS_CUMPLIDAS", "Mis ventas cumplidas", "credit-card", "/crm/ventas?estado=CUMPLIDA"),
                        new AccionRapida("VER_ANUNCIOS", "Comunicados", "megaphone", "/crm/anuncios")),
                grafico, turno, heatmap, ranking, desafio, comparativa);
    }

    private ComparativaAsesor buildComparativaAsesor(Usuario asesor, LocalDate hoy, YearMonth ym, long ventasMes, int meta) {
        YearMonth ymAnt = ym.minusMonths(1);
        long ventasMesAnt = ventaRepo.countVentasByUsuarioAndPeriodo(asesor.getId(), ymAnt.getYear(), ymAnt.getMonthValue());
        Double tendMesAnt = tendencia(ventasMes, ventasMesAnt);
        YearMonth ymAnioAnt = ym.minusYears(1);
        long ventasMismoMesAnioAnt = ventaRepo.countVentasByUsuarioAndPeriodo(asesor.getId(), ymAnioAnt.getYear(), ymAnioAnt.getMonthValue());
        Double tendAnual = tendencia(ventasMes, ventasMismoMesAnioAnt);

        Integer posicion = null; Integer totalEquipo = null; double promedioEquipo = 0;
        if (asesor.getSupervisor() != null) {
            List<AsesorResumenProjection> equipo = ventaRepo.findResumenEquipoBySuper(asesor.getSupervisor().getId());
            totalEquipo = equipo.size();
            promedioEquipo = equipo.stream().mapToLong(AsesorResumenProjection::getVentasMes).average().orElse(0);
            posicion = 1 + (int) equipo.stream()
                    .filter(a -> !a.getUsuarioId().equals(asesor.getId()) && a.getVentasMes() > ventasMes).count();
        }

        LocalDate hace14 = hoy.minusDays(13);
        long ventasUlt14 = ventaRepo.countVentasByUsuarioEnRango(asesor.getId(), hace14, hoy);
        double promDiario = ventasUlt14 / 14.0;
        int diasRestantes = ym.lengthOfMonth() - hoy.getDayOfMonth();
        long forecast = ventasMes + Math.round(promDiario * diasRestantes);
        double forecastPct = meta > 0 ? Math.min(forecast * 100.0 / meta, 150.0) : 0;

        String mensajeForecast;
        if (meta <= 0) { mensajeForecast = "Sin meta configurada para este mes."; }
        else if (forecastPct >= 100) { mensajeForecast = "Vas en camino de cumplir tu meta. ¡Seguí así!"; }
        else { mensajeForecast = "Al ritmo actual, cerrarías el mes con " + forecast + " ventas (" + (int) forecastPct + "% de la meta)."; }

        return new ComparativaAsesor(ventasMes, meta, meta > 0 ? ventasMes * 100.0 / meta : 0,
                ventasMesAnt, tendMesAnt, ventasMismoMesAnioAnt, tendAnual,
                posicion, totalEquipo, promedioEquipo, forecast, forecastPct, diasRestantes, promDiario, mensajeForecast);
    }

    // ─── SUPERVISOR ──────────────────────────────────────────────────────────

    private DashboardSupervisor buildSupervisor(Usuario supervisor) {
        LocalDate hoy = LocalDate.now();
        YearMonth ym = YearMonth.now();
        long equHoy = ventaRepo.countVentasEquipoHoy(supervisor.getId());
        long equSemana = ventaRepo.countVentasEquipoSemana(supervisor.getId());
        long equMes = ventaRepo.countVentasEquipoMes(supervisor.getId());
        long mejorPrev = ventaRepo.findMejorMesPrevioEquipo(supervisor.getId());
        long cobertura = ventaRepo.countAsesoresConVentasHoy(supervisor.getId());
        long totalAs = usuarioRepo.countAsesorActivosBySuper(supervisor.getId());
        int metaGrupal = obtenerMetaGrupal(supervisor.getId(), ym.getYear(), ym.getMonthValue());
        double pctGrupal = metaGrupal > 0 ? (equMes * 100.0 / metaGrupal) : 0;

        Map<Long, Long> ventasHoyMap = toMap(ventaRepo.findVentasHoyByEquipoBatch(supervisor.getId()));
        Map<Long, List<LocalDate>> fechasMap = toFechasMap(ventaRepo.findFechasVentasEquipoBatch(supervisor.getId()));
        List<AsesorResumenProjection> equipoRaw = ventaRepo.findResumenEquipoBySuper(supervisor.getId());
        List<AsesorResumen> leaderboard = buildLeaderboard(equipoRaw, ventasHoyMap, fechasMap);
        double promedio = leaderboard.stream().mapToLong(AsesorResumen::ventasMes).average().orElse(0);

        List<VentasPorDia> grafico = buildVentasPorDiaEquipoRango(supervisor.getId(), hoy.minusDays(30), hoy, hoy.minusDays(60), hoy.minusDays(31));
        List<Segmento> turno = toSegmentos(ventaRepo.findDistribucionTurnoEquipo(supervisor.getId()));
        List<HeatmapDia> heatmap = buildHeatmap(ventaRepo.findVentasPorDiaByEquipoRango(supervisor.getId(), hoy.withDayOfMonth(1), hoy));
        boolean equipoCampeon = mejorPrev > 0 && equMes >= mejorPrev;
        DesafioResponse desafio = desafioService.getDesafioActivo(supervisor.getId());
        List<Alerta> alertas = buildAlertasSupervisor(totalAs, cobertura, pctGrupal, equipoCampeon);

        return new DashboardSupervisor("Hola, " + supervisor.getNombre(), hoy.format(FECHA_FORMATO), alertas,
                kpi("Equipo hoy", equHoy, null, estadoNeutro(), null),
                kpi("Esta semana", equSemana, null, estadoNeutro(), null),
                kpi("Este mes", equMes, tendencia(equMes, mejorPrev), estadoPorcentaje(pctGrupal), "Mejor mes previo: " + mejorPrev),
                kpi("Cobertura", cobertura, null, cobertura >= totalAs * 0.8 ? "verde" : "amarillo", cobertura + " de " + totalAs + " asesores con ventas hoy"),
                kpi("Meta grupal", (long) pctGrupal, null, estadoPorcentaje(pctGrupal), null),
                kpi("Prom/asesor", Math.round(promedio), null, estadoNeutro(), null),
                buildMetaProgress(metaGrupal, equMes, mejorPrev),
                leaderboard, promedio, equipoCampeon, grafico, turno, heatmap, desafio,
                List.of(new AccionRapida("VER_VENTAS_EQUIPO_MES", "Ventas del equipo (mes)", "bar-chart", "/crm/ventas?desde=" + hoy.withDayOfMonth(1) + "&hasta=" + hoy),
                        new AccionRapida("VER_EQUIPO", "Ver mi equipo", "users", "/crm/usuarios?rol=ASESOR&activo=true"),
                        new AccionRapida("VER_MAPA_EQUIPO", "Mapa de ventas", "map", "/crm/mapa"),
                        new AccionRapida("NUEVO_DESAFIO", "Crear desafío", "target", "/crm?desafio=nuevo"),
                        new AccionRapida("EXPORTAR_EQUIPO", "Exportar ventas del equipo", "download", "/crm/ventas?desde=" + hoy.withDayOfMonth(1) + "&hasta=" + hoy + "&export=true")));
    }

    // ─── JEFE DE SUPERVISOR ───────────────────────────────────────────────────

    private DashboardJefeSupervisor buildJefeSupervisor(Usuario jefe) {
        LocalDate hoy = LocalDate.now();
        YearMonth ym = YearMonth.now();
        YearMonth ymAnt = ym.minusMonths(1);

        long totHoy = ventaRepo.countVentasHoyByJefe(jefe.getId());
        long totSemana = ventaRepo.countVentasSemanaByJefe(jefe.getId());
        long totMes = ventaRepo.countVentasMesByJefe(jefe.getId());
        long totMesAnt = ventaRepo.countVentasByJefeAndPeriodo(jefe.getId(), ymAnt.getYear(), ymAnt.getMonthValue());
        Double tendenciaMes = tendencia(totMes, totMesAnt);

        List<SupervisorResumenProjection> supRaw = ventaRepo.findResumenSupervisoresByJefe(jefe.getId());
        long maxVentas = supRaw.stream().mapToLong(SupervisorResumenProjection::getVentasMes).max().orElse(1);
        double totalJefe = supRaw.stream().mapToLong(SupervisorResumenProjection::getVentasMes).sum();
        double promedio = supRaw.isEmpty() ? 0 : totalJefe / supRaw.size();
        long enRiesgo = supRaw.stream().filter(s -> promedio > 0 && s.getVentasMes() < promedio * 0.7).count();

        List<SupervisorResumen> supervisores = supRaw.stream().map(s -> {
            long mesAntSup = ventaRepo.countVentasByJefeAndPeriodo(s.getUsuarioId(), ymAnt.getYear(), ymAnt.getMonthValue());
            return new SupervisorResumen(s.getUsuarioId(), s.getNombre(), s.getApellido(),
                    s.getVentasMes(), s.getVentasHoy(), s.getTotalAsesores(),
                    maxVentas > 0 ? s.getVentasMes() * 1.0 / maxVentas : 0,
                    promedio > 0 && s.getVentasMes() < promedio * 0.7, tendencia(s.getVentasMes(), mesAntSup));
        }).collect(Collectors.toList());

        List<VentasPorDia> evolucion = buildVentasPorDia(
                ventaRepo.findVentasPorDiaByJefeRango(jefe.getId(), hoy.minusDays(56), hoy),
                ventaRepo.findVentasPorDiaByJefeRango(jefe.getId(), hoy.minusDays(112), hoy.minusDays(57)), 56);

        List<OrigenTendenciaDia> origenCrm = buildOrigenTendencia(ventaRepo.findOrigenVentasByJefe14DiasV2(jefe.getId()));
        List<Alerta> alertas = new ArrayList<>();
        if (enRiesgo > 0) alertas.add(new Alerta("META_EN_RIESGO", enRiesgo + " equipo(s) por debajo del 70% del promedio.", "warning"));

        return new DashboardJefeSupervisor("Hola, " + jefe.getNombre(), hoy.format(FECHA_FORMATO), alertas,
                kpi("Total hoy", totHoy, null, estadoNeutro(), null),
                kpi("Esta semana", totSemana, null, estadoNeutro(), null),
                kpi("Total mes", totMes, tendenciaMes, estadoNeutro(), "Mes anterior: " + totMesAnt),
                kpi("Equipos en riesgo", enRiesgo, null, enRiesgo > 0 ? "amarillo" : "verde", "< 70% del promedio"),
                kpi("Prom. por equipo", Math.round(promedio), null, estadoNeutro(), null),
                tendenciaMes, supervisores, evolucion, origenCrm,
                List.of(new AccionRapida("VER_SUPERVISORES", "Ver supervisores", "users", "/crm/usuarios?rol=SUPERVISOR&activo=true"),
                        new AccionRapida("VER_VENTAS_GLOBAL", "Ventas de mis equipos", "list", "/crm/ventas?desde=" + hoy.withDayOfMonth(1) + "&hasta=" + hoy),
                        new AccionRapida("VER_MAPA", "Mapa de ventas", "map", "/crm/mapa"),
                        new AccionRapida("EXPORTAR_JEFE", "Exportar reporte", "download", "/crm/ventas?desde=" + hoy.withDayOfMonth(1) + "&hasta=" + hoy + "&export=true")));
    }

    // ─── GERENTE ──────────────────────────────────────────────────────────────

    private DashboardGerente buildGerente(Usuario gerente, DashboardFiltro filtro) {
        LocalDate hoy = LocalDate.now();
        YearMonth ymAnt = YearMonth.now().minusMonths(1);
        long vHoy = resolverVentasHoyFiltradas(filtro);
        long vSemana = resolverVentasSemanaFiltradas(filtro);
        long vMes = ventaRepo.countVentasFiltradas(filtro.desde(), filtro.hasta(), filtro.centralId(), filtro.productoId(), filtro.promoId(), filtro.origen());
        long vMesAnt = ventaRepo.countVentasTotalesByPeriodo(ymAnt.getYear(), ymAnt.getMonthValue());
        StatsDebito statsDebito = toStatsDebito(ventaRepo.findStatsDebitoFiltrado(filtro.desde(), filtro.hasta(), filtro.centralId(), filtro.productoId(), filtro.promoId()));
        long metaGlobal = calcularMetaGlobal();
        TasaConversion tasaConversion = buildTasaConversion(filtro, vMes, metaGlobal, statsDebito);

        int diasRango = filtro.diasRango();
        List<VentasPorDia> evolucion = buildVentasPorDia(
                ventaRepo.findVentasPorDiaFiltrado(filtro.desde(), filtro.hasta(), filtro.centralId(), filtro.productoId(), filtro.promoId(), filtro.origen()),
                ventaRepo.findVentasPorDiaFiltrado(filtro.desde().minusDays(diasRango), filtro.hasta().minusDays(diasRango), filtro.centralId(), filtro.productoId(), filtro.promoId(), filtro.origen()), diasRango);

        List<OrigenTendenciaDia> origen14 = buildOrigenTendencia(ventaRepo.findOrigenVentasGlobal14Dias(filtro.centralId(), filtro.productoId()));

        return new DashboardGerente("Hola, " + gerente.getNombre(), hoy.format(FECHA_FORMATO), List.of(), filtro,
                kpi("Ventas hoy", vHoy, null, estadoNeutro(), null),
                kpi("Esta semana", vSemana, null, estadoNeutro(), null),
                kpi("Período", vMes, tendencia(vMes, vMesAnt), estadoNeutro(), "Período anterior: " + vMesAnt),
                kpi("Débito auto %", Math.round(statsDebito.porcentajeDebito()), null, statsDebito.porcentajeDebito() >= 60 ? "verde" : "amarillo", statsDebito.conDebitoAuto() + " de " + statsDebito.totalVentas()),
                tasaConversion,
                toSegmentos(ventaRepo.findVentasPorCentralFiltrado(filtro.desde(), filtro.hasta(), filtro.productoId(), filtro.promoId(), filtro.origen())),
                toSegmentos(ventaRepo.findVentasPorProductoFiltrado(filtro.desde(), filtro.hasta(), filtro.centralId(), filtro.promoId(), filtro.origen())),
                toSegmentos(ventaRepo.findVentasPorPromoFiltrado(filtro.desde(), filtro.hasta(), filtro.centralId(), filtro.productoId(), filtro.origen())),
                toSegmentos(ventaRepo.findDistribucionTurnoFiltrado(filtro.desde(), filtro.hasta(), filtro.centralId(), filtro.productoId(), filtro.promoId())),
                toSegmentos(ventaRepo.findDistribucionMetodosPagoFiltrado(filtro.desde(), filtro.hasta(), filtro.centralId(), filtro.productoId(), filtro.promoId(), filtro.origen())),
                origen14, evolucion, statsDebito,
                List.of(new AccionRapida("VER_VENTAS_PERIODO", "Ventas del período", "list", "/crm/ventas?desde=" + filtro.desde() + "&hasta=" + filtro.hasta()),
                        new AccionRapida("VER_USUARIOS", "Ver usuarios", "users", "/crm/usuarios?activo=true"),
                        new AccionRapida("VER_MAPA", "Mapa de ventas", "map", "/crm/mapa"),
                        new AccionRapida("EXPORTAR_GLOBAL", "Exportar reporte", "download", "/crm/ventas?desde=" + filtro.desde() + "&hasta=" + filtro.hasta() + "&export=true")));
    }

    // ─── LIDER ────────────────────────────────────────────────────────────────

    private DashboardLider buildLider(Usuario lider, DashboardFiltro filtro) {
        LocalDate hoy = LocalDate.now();
        YearMonth ymAnt = YearMonth.now().minusMonths(1);
        long vHoy = resolverVentasHoyFiltradas(filtro);
        long vSemana = resolverVentasSemanaFiltradas(filtro);
        long vMes = ventaRepo.countVentasFiltradas(filtro.desde(), filtro.hasta(), filtro.centralId(), filtro.productoId(), filtro.promoId(), filtro.origen());
        long vMesAnt = ventaRepo.countVentasTotalesByPeriodo(ymAnt.getYear(), ymAnt.getMonthValue());
        StatsDebito statsDebito = toStatsDebito(ventaRepo.findStatsDebitoFiltrado(filtro.desde(), filtro.hasta(), filtro.centralId(), filtro.productoId(), filtro.promoId()));
        long metaGlobal = calcularMetaGlobal();
        TasaConversion tasaConversion = buildTasaConversion(filtro, vMes, metaGlobal, statsDebito);
        long activos7 = usuarioRepo.countActivosEnUltimosDias(7);
        long sinLogin30 = usuarioRepo.countSinLoginEnDias(30);

        List<VentasPorDia> evolucion90 = buildVentasPorDia(
                ventaRepo.findVentasPorDiaFiltrado(hoy.minusDays(90), hoy, filtro.centralId(), filtro.productoId(), filtro.promoId(), filtro.origen()),
                ventaRepo.findVentasPorDiaFiltrado(hoy.minusDays(180), hoy.minusDays(91), filtro.centralId(), filtro.productoId(), filtro.promoId(), filtro.origen()), 90);

        List<OrigenTendenciaDia> origen14 = buildOrigenTendencia(ventaRepo.findOrigenVentasGlobal14Dias(filtro.centralId(), filtro.productoId()));

        return new DashboardLider("Hola, " + lider.getNombre(), hoy.format(FECHA_FORMATO), List.of(), filtro,
                kpi("Ventas hoy", vHoy, null, estadoNeutro(), null),
                kpi("Esta semana", vSemana, null, estadoNeutro(), null),
                kpi("Este mes", vMes, tendencia(vMes, vMesAnt), estadoNeutro(), "Mes anterior: " + vMesAnt),
                kpi("Débito auto %", Math.round(statsDebito.porcentajeDebito()), null, statsDebito.porcentajeDebito() >= 60 ? "verde" : "amarillo", null),
                tasaConversion,
                toSegmentos(ventaRepo.findVentasPorCentralFiltrado(filtro.desde(), filtro.hasta(), filtro.productoId(), filtro.promoId(), filtro.origen())),
                toSegmentos(ventaRepo.findVentasPorProductoFiltrado(filtro.desde(), filtro.hasta(), filtro.centralId(), filtro.promoId(), filtro.origen())),
                toSegmentos(ventaRepo.findVentasPorPromoFiltrado(filtro.desde(), filtro.hasta(), filtro.centralId(), filtro.productoId(), filtro.origen())),
                toSegmentos(ventaRepo.findDistribucionTurnoFiltrado(filtro.desde(), filtro.hasta(), filtro.centralId(), filtro.productoId(), filtro.promoId())),
                origen14,
                toSegmentos(ventaRepo.findVentasPorProvinciaFiltrado(filtro.desde(), filtro.hasta(), filtro.centralId(), filtro.productoId(), filtro.promoId(), filtro.origen())),
                evolucion90, statsDebito, activos7, sinLogin30,
                List.of(new AccionRapida("VER_VENTAS_PERIODO", "Ventas del período", "list", "/crm/ventas?desde=" + filtro.desde() + "&hasta=" + filtro.hasta()),
                        new AccionRapida("VER_USUARIOS", "Gestión de usuarios", "users", "/crm/usuarios?activo=true"),
                        new AccionRapida("VER_MAPA", "Mapa de ventas", "map", "/crm/mapa"),
                        new AccionRapida("EXPORTAR_EJECUTIVO", "Reporte ejecutivo", "download", "/crm/ventas?desde=" + filtro.desde() + "&hasta=" + filtro.hasta() + "&export=true")));
    }

    // ─── ADMIN ────────────────────────────────────────────────────────────────

    private DashboardAdmin buildAdmin(Usuario admin) {
        LocalDate hoy = LocalDate.now();
        long ventasSinObs = ventaRepo.countVentasSinObservaciones();
        long usuariosActivos = usuarioRepo.countByActivoTrue();
        long usuariosInactivos = usuarioRepo.countByActivoFalse();
        long altasMes = usuarioRepo.countAltasEsteMes();
        long bajasMes = usuarioRepo.countBajasEsteMes();
        long incompletos = usuarioRepo.countUsuariosIncompletos();
        long sinLogin30 = usuarioRepo.countSinLoginEnDias(30);

        StatsUsuarios statsUsuarios = new StatsUsuarios(usuariosActivos, usuariosInactivos, altasMes, bajasMes, incompletos, sinLogin30);
        StatsDebito statsDebito = toStatsDebito(ventaRepo.findStatsDebitoFiltrado(hoy.withDayOfMonth(1), hoy, null, null, null));
        List<VentasPorDia> ventasDiarias = buildVentasPorDia(ventaRepo.findVentasPorDiaMesActual(), Collections.emptyList(), 0);

        List<Alerta> alertas = new ArrayList<>();
        if (ventasSinObs > 0) alertas.add(new Alerta("PENDIENTE_REVISION", ventasSinObs + " venta(s) sin observaciones (últimos 7 días).", "info"));
        if (incompletos > 0) alertas.add(new Alerta("USUARIOS_INCOMPLETOS", incompletos + " usuario(s) con datos obligatorios faltantes.", "warning"));

        return new DashboardAdmin("Hola, " + admin.getNombre(), hoy.format(FECHA_FORMATO), alertas,
                kpi("Sin observaciones", ventasSinObs, null, ventasSinObs > 0 ? "amarillo" : "verde", null),
                kpi("Usuarios activos", usuariosActivos, null, "azul", null),
                kpi("Usuarios inactivos", usuariosInactivos, null, "gris", null),
                kpi("Usuarios incompl.", incompletos, null, incompletos > 0 ? "amarillo" : "verde", "Sin dni, teléfono, nombre o apellido"),
                kpi("Altas este mes", altasMes, null, "azul", null),
                kpi("Bajas este mes", bajasMes, null, "gris", null),
                statsUsuarios,
                toSegmentos(ventaRepo.findDistribucionMetodosPago()),
                statsDebito, ventasDiarias,
                List.of(new AccionRapida("NUEVO_USUARIO", "Nuevo usuario", "user-plus", "/crm/usuarios?nuevo=true"),
                        new AccionRapida("USUARIOS_INACTIVOS", "Usuarios inactivos", "users", "/crm/usuarios?activo=false"),
                        new AccionRapida("VER_VENTAS_MES", "Ventas del mes", "list", "/crm/ventas?desde=" + hoy.withDayOfMonth(1) + "&hasta=" + hoy),
                        new AccionRapida("VER_MAPA", "Mapa de ventas", "map", "/crm/mapa"),
                        new AccionRapida("EXPORTAR_ADMIN", "Exportar", "download", "/crm/ventas?desde=" + hoy.withDayOfMonth(1) + "&hasta=" + hoy + "&export=true")));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public DashboardDTOs.KpiCard buildTasaCierreAsesor(Long asesorId, LocalDate hoy, List<VentasPorDiaProjection> ventasPorDiaMes) {
        LocalDate inicioMes = hoy.withDayOfMonth(1);
        TasaConversionProjection p = gestionRepo.findTasaConversionByAsesor(asesorId, inicioMes, hoy);
        long totalGestiones = p != null && p.getTotalGestiones() != null ? p.getTotalGestiones() : 0L;

        if (totalGestiones > 0) {
            long totalVendidas = p.getTotalVendidas() != null ? p.getTotalVendidas() : 0L;
            double tasa = p.getTasaConversion() != null ? p.getTasaConversion() : 0.0;
            return new KpiCard("Tasa de cierre", Math.round(tasa), null, tasa >= 25 ? "verde" : tasa >= 15 ? "amarillo" : "azul", totalVendidas + " ventas sobre " + totalGestiones + " gestiones.");
        }

        long diasHabiles = inicioMes.datesUntil(hoy.plusDays(1)).filter(d -> d.getDayOfWeek().getValue() < 6).count();
        if (diasHabiles == 0) return new KpiCard("Consistencia", 0L, null, "azul", "Primer día del mes");

        long diasConVenta = ventasPorDiaMes == null ? 0L : ventasPorDiaMes.stream().filter(v -> v.getCantidad() != null && v.getCantidad() > 0).map(VentasPorDiaProjection::getFecha).distinct().count();
        double consistencia = Math.min(diasConVenta * 100.0 / diasHabiles, 100.0);
        return new KpiCard("Consistencia", Math.round(consistencia), null, consistencia >= 80 ? "verde" : consistencia >= 50 ? "amarillo" : "azul", diasConVenta + " días con ventas sobre " + diasHabiles + " días hábiles.");
    }

    @Transactional
    public RankingOpcional toggleRankingOptional(Usuario usuario) {
        boolean nuevo = !Boolean.TRUE.equals(usuarioRepo.findRankingPreferenceByUsuarioId(usuario.getId()));
        usuarioRepo.updateRankingPreference(usuario.getId(), nuevo);
        if (!nuevo) return new RankingOpcional(false, null, null, null, ventaRepo.countVentasMesByUsuario(usuario.getId()));
        return calcularRankingOpcional(usuario);
    }

    private long resolverVentasHoyFiltradas(DashboardFiltro filtro) {
        return tieneFiltroSegmento(filtro) ? ventaRepo.countVentasHoyFiltradas(filtro.centralId(), filtro.productoId(), filtro.promoId(), filtro.origen()) : ventaRepo.countVentasTotalesHoy();
    }

    private long resolverVentasSemanaFiltradas(DashboardFiltro filtro) {
        return tieneFiltroSegmento(filtro) ? ventaRepo.countVentasSemananaFiltradas(filtro.centralId(), filtro.productoId(), filtro.promoId(), filtro.origen()) : ventaRepo.countVentasTotalesSemana();
    }

    private boolean tieneFiltroSegmento(DashboardFiltro filtro) {
        return filtro.centralId() != null || filtro.productoId() != null || filtro.promoId() != null || filtro.origen() != null;
    }

    private long calcularMetaGlobal() {
        YearMonth ym = YearMonth.now();
        long suma = metaRepo.sumCantidadByAnioAndMes(ym.getYear(), ym.getMonthValue());
        if (suma > 0) return suma;
        long totalAsesores = usuarioRepo.countAsesoresActivos();
        return totalAsesores > 0 ? totalAsesores * META_DEFAULT : META_DEFAULT;
    }

    public TasaConversion buildTasaConversion(DashboardFiltro filtro, long ventasMes, long metaGlobal, StatsDebito statsDebito) {
        double tasaCalidad = statsDebito.porcentajeDebito();
        boolean hayGestiones = gestionRepo.countGestiones() > 0;

        if (hayGestiones) {
            TasaConversionProjection p = gestionRepo.findTasaConversionGlobal(filtro.desde(), filtro.hasta(), filtro.centralId(), filtro.productoId(), filtro.origen());
            long totalGestiones = p != null && p.getTotalGestiones() != null ? p.getTotalGestiones() : 0L;
            long totalVendidas = p != null && p.getTotalVendidas() != null ? p.getTotalVendidas() : 0L;
            double tasaReal = p != null && p.getTasaConversion() != null ? p.getTasaConversion() : 0.0;
            return new TasaConversion(true, tasaReal, tasaCalidad, totalGestiones, totalVendidas, ventasMes, metaGlobal, statsDebito.conDebitoAuto(), statsDebito.totalVentas(), "conversion_real");
        }

        double tasaAlcance = metaGlobal > 0 ? Math.min(ventasMes * 100.0 / metaGlobal, 100.0) : 0.0;
        return new TasaConversion(false, tasaAlcance, tasaCalidad, 0L, 0L, ventasMes, metaGlobal, statsDebito.conDebitoAuto(), statsDebito.totalVentas(), "alcance_meta");
    }

    private Racha calcularRacha(Long usuarioId) {
        return calcularRachaDesde(ventaRepo.findFechasConVentasByUsuario(usuarioId));
    }

    private Racha calcularRachaDesde(List<LocalDate> fechas) {
        if (fechas == null || fechas.isEmpty()) return new Racha(0, false, "Registrá tu primera venta para iniciar una racha");
        fechas = fechas.stream().distinct().sorted(Comparator.reverseOrder()).toList();
        int dias = 0;
        LocalDate cursor = LocalDate.now();
        for (LocalDate f : fechas) {
            if (f.equals(cursor)) { dias++; cursor = cursor.minusDays(1); }
            else if (f.isBefore(cursor)) break;
        }
        String proximo = dias == 4 ? "¡Un día más para la Semana perfecta!" : dias < 5 ? "Mantenela " + (5 - dias) + " día(s) más" : null;
        return new Racha(dias, dias > 0, proximo);
    }

    private Map<Long, Racha> calcularRachasBatch(Map<Long, List<LocalDate>> fechasMap) {
        Map<Long, Racha> result = new HashMap<>();
        for (Map.Entry<Long, List<LocalDate>> e : fechasMap.entrySet()) result.put(e.getKey(), calcularRachaDesde(e.getValue()));
        return result;
    }

    private List<Badge> calcularBadgesAsesor(Usuario asesor, long ventasHoy, long ventasMes, Racha racha) {
        List<Badge> badges = new ArrayList<>();
        badges.add(new Badge("PRIMERA_VENTA_DIA", "Primer gol", "Primera venta del día registrada", ventasHoy >= 1, ventasHoy >= 1 ? LocalDateTime.now() : null, "Registrá tu primera venta del día"));
        badges.add(new Badge("SEMANA_PERFECTA", "Semana perfecta", "5 días seguidos con al menos una venta", racha.diasConsecutivos() >= 5, racha.diasConsecutivos() >= 5 ? LocalDateTime.now() : null, "Registrá ventas " + Math.max(0, 5 - racha.diasConsecutivos()) + " día(s) más"));

        int rachaAM = calcularRachaAM(asesor.getId());
        badges.add(new Badge("MADRUGADOR", "Madrugador", "5 días consecutivos con venta en turno AM", rachaAM >= 5, rachaAM >= 5 ? LocalDateTime.now() : null, "Registrá ventas AM por " + Math.max(0, 5 - rachaAM) + " día(s) más"));

        List<DebutProductoProjection> debuts = ventaRepo.findProductosDebutByUsuario(asesor.getId());
        boolean tieneDebut = !debuts.isEmpty();
        String nombresDebut = tieneDebut ? debuts.stream().map(DebutProductoProjection::getNombreProducto).collect(Collectors.joining(", ")) : null;
        badges.add(new Badge("DEBUT_PRODUCTO", "Debut de producto", tieneDebut ? "Primera venta de: " + nombresDebut : "Primera venta de un nuevo producto este mes", tieneDebut, tieneDebut ? LocalDateTime.now() : null, "Vendé un producto que nunca habías vendido antes"));

        boolean equipoCampeon = false;
        if (asesor.getSupervisor() != null) {
            long equMes = ventaRepo.countVentasEquipoMes(asesor.getSupervisor().getId());
            long mejorPrevio = ventaRepo.findMejorMesPrevioEquipo(asesor.getSupervisor().getId());
            equipoCampeon = mejorPrevio > 0 && equMes >= mejorPrevio;
        }
        badges.add(new Badge("EQUIPO_CAMPEON", "Equipo campeón", "El equipo superó su mejor mes histórico", equipoCampeon, equipoCampeon ? LocalDateTime.now() : null, "El equipo debe superar su récord mensual previo"));
        return badges;
    }

    private int calcularRachaAM(Long usuarioId) {
        List<LocalDate> fechas = ventaRepo.findFechasVentasAMByUsuario(usuarioId);
        if (fechas == null || fechas.isEmpty()) return 0;
        fechas = fechas.stream().distinct().sorted(Comparator.reverseOrder()).toList();
        int dias = 0;
        LocalDate cursor = LocalDate.now();
        for (LocalDate f : fechas) {
            if (f.equals(cursor)) { dias++; cursor = cursor.minusDays(1); }
            else break;
        }
        return dias;
    }

    private MetaProgress buildMetaProgress(int meta, long ventas, long mejorPrevio) {
        if (meta <= 0) meta = META_DEFAULT;
        double pct = Math.min(ventas * 100.0 / meta, 100);
        int restantes = (int) Math.max(0, meta - ventas);
        int hitoActual = pct >= 100 ? 100 : pct >= 75 ? 75 : pct >= 50 ? 50 : pct >= 25 ? 25 : 0;
        int proximoHito = pct >= 100 ? -1 : pct >= 75 ? 100 : pct >= 50 ? 75 : pct >= 25 ? 50 : 25;
        boolean animarHito = hitoActual > 0 && (ventas - (long) (meta * hitoActual / 100.0)) <= 3;
        String mensaje = pct >= 100 ? "¡Meta cumplida! 🎉" : mejorPrevio > 0 && ventas >= mejorPrevio ? "¡Estás superando tu mejor mes!" : restantes + " venta(s) para cumplir tu meta mensual.";
        return new MetaProgress(meta, ventas, pct, restantes, hitoActual, proximoHito, mensaje, animarHito);
    }

    private List<AsesorResumen> buildLeaderboard(List<AsesorResumenProjection> raw, Map<Long, Long> ventasHoyMap, Map<Long, List<LocalDate>> fechasMap) {
        if (raw == null || raw.isEmpty()) return List.of();
        long maxVentas = raw.stream().mapToLong(AsesorResumenProjection::getVentasMes).max().orElse(1);
        Map<Long, Racha> rachas = calcularRachasBatch(fechasMap);
        return raw.stream().map(a -> {
            Racha racha = rachas.getOrDefault(a.getUsuarioId(), new Racha(0, false, null));
            return new AsesorResumen(a.getUsuarioId(), a.getNombre(), a.getApellido(), a.getVentasMes(),
                    maxVentas > 0 ? a.getVentasMes() * 1.0 / maxVentas : 0,
                    ventasHoyMap.getOrDefault(a.getUsuarioId(), 0L) > 0,
                    racha.activa() && racha.diasConsecutivos() >= 3);
        }).collect(Collectors.toList());
    }

    private RankingOpcional calcularRankingOpcional(Usuario asesor) {
        if (asesor.getSupervisor() == null) return new RankingOpcional(true, null, null, null, ventaRepo.countVentasMesByUsuario(asesor.getId()));
        List<AsesorResumenProjection> equipo = ventaRepo.findResumenEquipoBySuper(asesor.getSupervisor().getId());
        long propias = ventaRepo.countVentasMesByUsuario(asesor.getId());
        double prom = equipo.stream().mapToLong(AsesorResumenProjection::getVentasMes).average().orElse(0);
        int posicion = 1 + (int) equipo.stream().filter(a -> !a.getUsuarioId().equals(asesor.getId()) && a.getVentasMes() > propias).count();
        return new RankingOpcional(true, posicion, equipo.size(), prom, propias);
    }

    @FunctionalInterface
    interface VentasPorDiaQuery { List<VentasPorDiaProjection> query(Long id, LocalDate desde, LocalDate hasta); }

    private List<VentasPorDia> buildVentasPorDiaRango(Long id, LocalDate desdeP, LocalDate hastaP, LocalDate desdeA, LocalDate hastaA, VentasPorDiaQuery fn) {
        return buildVentasPorDia(fn.query(id, desdeP, hastaP), fn.query(id, desdeA, hastaA), (int) ChronoUnit.DAYS.between(desdeP, hastaP) + 1);
    }

    private List<VentasPorDia> buildVentasPorDiaEquipoRango(Long supId, LocalDate desdeP, LocalDate hastaP, LocalDate desdeA, LocalDate hastaA) {
        return buildVentasPorDia(ventaRepo.findVentasPorDiaByEquipoRango(supId, desdeP, hastaP), ventaRepo.findVentasPorDiaByEquipoRango(supId, desdeA, hastaA), (int) ChronoUnit.DAYS.between(desdeP, hastaP) + 1);
    }

    private List<VentasPorDia> buildVentasPorDia(List<VentasPorDiaProjection> actual, List<VentasPorDiaProjection> anterior, int diasDesplazamiento) {
        Map<LocalDate, Long> anteriorMap = new HashMap<>();
        if (anterior != null) for (VentasPorDiaProjection p : anterior) anteriorMap.put(p.getFecha().plusDays(diasDesplazamiento), p.getCantidad());
        if (actual == null) return List.of();
        return actual.stream().map(p -> new VentasPorDia(p.getFecha(), p.getCantidad(), anteriorMap.getOrDefault(p.getFecha(), 0L))).collect(Collectors.toList());
    }

    private List<HeatmapDia> buildHeatmap(List<VentasPorDiaProjection> datos) {
        if (datos == null || datos.isEmpty()) return List.of();
        long max = datos.stream().mapToLong(VentasPorDiaProjection::getCantidad).max().orElse(1);
        return datos.stream().map(p -> { long cant = p.getCantidad(); int nivel = cant == 0 ? 0 : cant <= max * 0.25 ? 1 : cant <= max * 0.50 ? 2 : cant <= max * 0.75 ? 3 : 4; return new HeatmapDia(p.getFecha(), cant, nivel); }).collect(Collectors.toList());
    }

    private List<OrigenTendenciaDia> buildOrigenTendencia(List<OrigenPorDiaProjection> raw) {
        if (raw == null || raw.isEmpty()) return List.of();
        Map<LocalDate, Map<String, Long>> porFecha = new LinkedHashMap<>();
        for (OrigenPorDiaProjection p : raw) porFecha.computeIfAbsent(p.getFecha(), k -> new HashMap<>()).put(p.getOrigen(), p.getCantidad());
        return porFecha.entrySet().stream().map(e -> new OrigenTendenciaDia(e.getKey(), e.getValue().getOrDefault("CRM", 0L), e.getValue().getOrDefault("POWER_APP", 0L))).collect(Collectors.toList());
    }

    private List<Segmento> toSegmentos(List<SegmentoProjection> src) {
        if (src == null) return List.of();
        return src.stream().map(p -> new Segmento(p.getNombre(), p.getCantidad() != null ? p.getCantidad() : 0L, p.getPorcentaje() != null ? p.getPorcentaje() : 0.0)).collect(Collectors.toList());
    }

    private StatsDebito toStatsDebito(StatsDebitoProjection row) {
        if (row == null || row.getTotal() == null) return new StatsDebito(0, 0, 0.0);
        long da = row.getDebitoAuto() != null ? row.getDebitoAuto() : 0L;
        long tot = row.getTotal();
        return new StatsDebito(tot, da, tot > 0 ? da * 100.0 / tot : 0.0);
    }

    private Map<Long, Long> toMap(List<UsuarioVentaCountProjection> list) {
        if (list == null) return Map.of();
        return list.stream().collect(Collectors.toMap(UsuarioVentaCountProjection::getUsuarioId, UsuarioVentaCountProjection::getCantidad, Long::sum));
    }

    private Map<Long, List<LocalDate>> toFechasMap(List<UsuarioFechaVentaProjection> list) {
        if (list == null) return Map.of();
        return list.stream().collect(Collectors.groupingBy(UsuarioFechaVentaProjection::getUsuarioId, Collectors.mapping(UsuarioFechaVentaProjection::getFecha, Collectors.toList())));
    }

    private KpiCard kpi(String label, long valor, Double tend, String estado, String tooltip) {
        return new KpiCard(label, valor, tend, estado, tooltip);
    }

    private Double tendencia(long actual, long anterior) {
        if (anterior == 0) return null;
        return Math.round((actual - anterior) * 100.0 / anterior * 10) / 10.0;
    }

    private String estadoPorcentaje(double pct) {
        return pct >= 90 ? "verde" : pct >= 70 ? "amarillo" : "azul";
    }

    private String estadoNeutro() { return "azul"; }

    private int obtenerMeta(Long usuarioId, int anio, int mes) {
        return metaRepo.findByUsuarioIdAndAnioAndMes(usuarioId, anio, mes).map(MetaMensual::getCantidad).orElse(META_DEFAULT);
    }

    private int obtenerMetaGrupal(Long supervisorId, int anio, int mes) {
        List<MetaMensual> metas = metaRepo.findByEquipoSupervisorAndPeriodo(supervisorId, anio, mes);
        if (metas.isEmpty()) { long n = usuarioRepo.countAsesorActivosBySuper(supervisorId); return (int) (n > 0 ? n : 5) * META_DEFAULT; }
        return metas.stream().mapToInt(MetaMensual::getCantidad).sum();
    }

    private String clasificarActividad(LocalDateTime ultimoLogin) {
        if (ultimoLogin == null) return "Sin actividad registrada";
        long dias = ChronoUnit.DAYS.between(ultimoLogin, LocalDateTime.now());
        return dias < 1 ? "Hoy" : dias < 7 ? "Esta semana" : dias < 30 ? "Este mes" : "Más de 30 días";
    }

    private List<Alerta> buildAlertasAsesor(long ventasHoy, LocalDate hoy, double pct, int meta, long ventasMes) {
        List<Alerta> alertas = new ArrayList<>();
        if (ventasHoy == 0 && hoy.getDayOfWeek() != DayOfWeek.SATURDAY && hoy.getDayOfWeek() != DayOfWeek.SUNDAY)
            alertas.add(new Alerta("SIN_ACTIVIDAD", "Todavía no registraste ventas hoy.", "info"));
        if (pct >= 70 && pct < 90)
            alertas.add(new Alerta("META_EN_RIESGO", "Estás al " + (int) pct + "% de tu meta. " + (meta - ventasMes) + " ventas más para llegar.", "warning"));
        return alertas;
    }

    private List<Alerta> buildAlertasSupervisor(long total, long cobertura, double pctGrupal, boolean campeon) {
        List<Alerta> alertas = new ArrayList<>();
        long sinVentas = total - cobertura;
        if (sinVentas > 0) alertas.add(new Alerta("SIN_ACTIVIDAD", sinVentas + " asesor(es) sin ventas hoy.", "warning"));
        if (pctGrupal < 70) alertas.add(new Alerta("META_EN_RIESGO", "El equipo está al " + (int) pctGrupal + "% de la meta grupal.", "warning"));
        if (campeon) alertas.add(new Alerta("EQUIPO_CAMPEON", "¡El equipo está superando su mejor mes histórico! 🏆", "info"));
        return alertas;
    }
}
