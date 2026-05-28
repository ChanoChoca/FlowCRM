// AUTO-GENERATED — do not edit manually.
// Source: backend/src/main/java/com/flashpage/app/model/**/*.java
// Regenerate: node scripts/sync-types.mjs --force

import { AuditoriaHorario, DesafioEstado, GestionEstado } from "./enums";

export type LocalDateString = string; // 'YYYY-MM-DD'

export type InstantString = string; // ISO-8601 UTC, e.g. '2026-01-01T00:00:00Z'

export interface DashboardBase {
  saludo: string;
  fechaActual: string;
  alertas: Alerta[];
}

export interface KpiCard {
  label: string;
  valor: number;
  tendenciaPct: number | null;
  estado: string;
  tooltip: string | null;
}

export interface Alerta {
  tipo: string;
  mensaje: string;
  severidad: string;
}

export interface MetaProgress {
  metaMensual: number;
  ventasMes: number;
  porcentaje: number;
  ventasRestantes: number;
  hitoActual: number;
  proximoHito: number;
  mensajeContextual: string;
  animarHito: boolean;
}

export interface Racha {
  diasConsecutivos: number;
  activa: boolean;
  proximoBadge: string | null;
}

export interface Badge {
  codigo: string;
  nombre: string;
  descripcion: string;
  desbloqueado: boolean;
  fechaDesbloqueo: string | null;
  condicion: string;
}

export interface Segmento {
  nombre: string;
  cantidad: number;
  porcentaje: number;
}

export interface VentasPorDia {
  fecha: LocalDateString;
  cantidad: number;
  cantidadAnterior: number;
}

export interface HeatmapDia {
  fecha: LocalDateString;
  cantidad: number;
  nivel: number;
}

export interface RankingOpcional {
  activo: boolean;
  posicion: number | null;
  totalAsesores: number | null;
  promedioEquipo: number | null;
  propiasMesActual: number;
}

export interface AsesorResumen {
  usuarioId: number | null;
  nombre: string;
  apellido: string;
  ventasMes: number;
  proporcionEnEquipo: number;
  conVentasHoy: boolean;
  enRacha: boolean;
}

export interface SupervisorResumen {
  usuarioId: number | null;
  nombre: string;
  apellido: string;
  ventasMes: number;
  ventasHoy: number;
  totalAsesores: number;
  proporcionEnJefe: number;
  equipoEnRiesgo: boolean;
  tendenciaPctMes: number | null;
}

export interface StatsDebito {
  totalVentas: number;
  conDebitoAuto: number;
  porcentajeDebito: number;
}

export interface AccionRapida {
  codigo: string;
  label: string;
  icono: string;
  ruta: string;
}

export interface ActividadUsuario {
  usuarioId: number | null;
  nombre: string;
  apellido: string;
  rol: string;
  franjaActividad: string;
  activo: boolean;
  ventasMes: number;
  ultimoLogin: string | null;
}

export interface StatsUsuarios {
  activos: number;
  inactivos: number;
  altasMes: number;
  bajasMes: number;
  incompletos: number;
  sinLoginUltimos30Dias: number;
}

export interface OrigenTendenciaDia {
  fecha: LocalDateString;
  ventasCrm: number;
  ventasPowerApp: number;
}

export interface CompSemana {
  ventasSemanaActual: number;
  mejorSemanaPrevia: number;
  ventasParaSuperarla: number;
  yaSuperada: boolean;
  mensajeContextual: string;
}

export interface DashboardFiltro {
  desde: LocalDateString | null;
  hasta: LocalDateString | null;
  centralId: number | null;
  productoId: number | null;
  promoId: number | null;
  origen: string | null;
}

export interface DesafioRequest {
  titulo: string;
  descripcion: string;
  metaVentas: number;
  turno: AuditoriaHorario;
  productoId: number | null;
  fechaInicio: string;
  fechaVencimiento: string;
}

export interface DesafioResponse {
  id: number | null;
  titulo: string;
  descripcion: string | null;
  metaVentas: number;
  turno: AuditoriaHorario | null;
  productoId: number | null;
  nombreProducto: string | null;
  fechaInicio: LocalDateString;
  fechaVencimiento: LocalDateString;
  estado: DesafioEstado;
  progreso: number;
  porcentaje: number;
  diasRestantes: number;
  completado: boolean;
  creadoEn: string | null;
}

export interface DesafioCardResponse {
  id: number | null;
  titulo: string;
  metaVentas: number;
  progreso: number;
  porcentaje: number;
  diasRestantes: number;
  completado: boolean;
  turno: string;
}

export interface GestionRequest {
  clienteId: number | null;
  prospectoNombre: string;
  prospectoTelefono: string;
  centralId: number | null;
  productoId: number | null;
  estado: GestionEstado;
  fechaGestion: string;
  observaciones: string;
  ventaId: number | null;
}

export interface GestionUpdateRequest {
  estado: GestionEstado;
  observaciones: string;
  ventaId: number | null;
}

export interface GestionResponse {
  id: number | null;
  asesorId: number | null;
  asesorNombre: string;
  clienteId: number | null;
  prospectoNombre: string;
  prospectoTelefono: string;
  centralId: number | null;
  centralNombre: string;
  productoId: number | null;
  productoNombre: string;
  origen: string;
  estado: GestionEstado;
  fechaGestion: string;
  observaciones: string;
  ventaId: number | null;
  creadoEn: string | null;
}

export interface ConversionAsesorResumen {
  asesorId: number | null;
  nombre: string;
  apellido: string;
  totalGestiones: number;
  totalVendidas: number;
  tasaConversion: number;
}

export interface ConversionPropiaResumen {
  totalGestiones: number;
  totalVendidas: number;
  tasaConversion: number;
}

export interface TasaConversion {
  modoReal: boolean;
  tasaConversion: number;
  tasaCalidad: number;
  totalGestiones: number;
  totalVendidas: number;
  ventasMes: number;
  metaGlobal: number;
  ventasConDebitoAuto: number;
  totalVentasPago: number;
  metricaPrincipal: string;
}

export interface ComparativaAsesor {
  ventasMesActual: number;
  metaMesActual: number;
  porcentajeMeta: number;
  ventasMesAnterior: number;
  tendenciaMesAnterior: number | null;
  ventasMismoMesAnioAnterior: number;
  tendenciaAnual: number | null;
  posicionEquipo: number | null;
  totalEquipo: number | null;
  promedioEquipo: number;
  forecastCierreMes: number;
  forecastPorcentajeMeta: number;
  diasRestantesMes: number;
  promedioVentasDiarias: number;
  mensajeForecast: string;
}

export interface DashboardAsesor extends DashboardBase {
  type: "ASESOR";
  ventasHoy: KpiCard;
  ventasSemana: KpiCard;
  ventasMes: KpiCard;
  porcentajeMeta: KpiCard;
  consistencia: KpiCard;
  metaProgress: MetaProgress;
  comparativaSemana: CompSemana;
  racha: Racha;
  badges: Badge[];
  accionesRapidas: AccionRapida[];
  ventasUltimos30Dias: VentasPorDia[];
  distribucionTurno: Segmento[];
  actividadHeatmap: HeatmapDia[];
  rankingOpcional: RankingOpcional;
  desafioActivo: DesafioCardResponse | null;
  comparativa: ComparativaAsesor;
}

export interface DashboardSupervisor extends DashboardBase {
  type: "SUPERVISOR";
  ventasEquipoHoy: KpiCard;
  ventasEquipoSemana: KpiCard;
  ventasEquipoMes: KpiCard;
  coberturaEquipo: KpiCard;
  porcentajeMetaGrupal: KpiCard;
  promedioPorAsesor: KpiCard;
  metaGrupalProgress: MetaProgress;
  equipoLeaderboard: AsesorResumen[];
  promedioEquipo: number;
  equipoCampeon: boolean;
  ventasEquipoUltimos30Dias: VentasPorDia[];
  distribucionTurnoEquipo: Segmento[];
  heatmap: HeatmapDia[];
  desafioActivo: DesafioResponse | null;
  accionesRapidas: AccionRapida[];
}

export interface DashboardJefeSupervisor extends DashboardBase {
  type: "JEFE_DE_SUPERVISOR";
  ventasAmbitoHoy: KpiCard;
  ventasAmbitoSemana: KpiCard;
  ventasAmbitoMes: KpiCard;
  equiposEnRiesgo: KpiCard;
  promedioEquipos: KpiCard;
  tendenciaMesPct: number | null;
  supervisoresResumen: SupervisorResumen[];
  evolucionUltimos56Dias: VentasPorDia[];
  origenCrm14Dias: OrigenTendenciaDia[];
  accionesRapidas: AccionRapida[];
}

export interface DashboardGerente extends DashboardBase {
  type: "GERENTE";
  filtroActivo: DashboardFiltro;
  ventasHoy: KpiCard;
  ventasSemana: KpiCard;
  ventasMes: KpiCard;
  porcentajeDebitoAuto: KpiCard;
  tasaConversion: TasaConversion;
  ventasPorCentral: Segmento[];
  ventasPorProducto: Segmento[];
  ventasPorPromo: Segmento[];
  distribucionTurno: Segmento[];
  distribucionMetodosPago: Segmento[];
  origenVentas: OrigenTendenciaDia[];
  evolucionPeriodo: VentasPorDia[];
  statsDebito: StatsDebito;
  accionesRapidas: AccionRapida[];
}

export interface DashboardLider extends DashboardBase {
  type: "LIDER";
  filtroActivo: DashboardFiltro;
  ventasHoy: KpiCard;
  ventasSemana: KpiCard;
  ventasMes: KpiCard;
  porcentajeDebitoAuto: KpiCard;
  tasaConversion: TasaConversion;
  ventasPorCentral: Segmento[];
  ventasPorProducto: Segmento[];
  ventasPorPromo: Segmento[];
  distribucionTurno: Segmento[];
  origenVentas14Dias: OrigenTendenciaDia[];
  ventasPorProvincia: Segmento[];
  evolucionUltimos90Dias: VentasPorDia[];
  statsDebito: StatsDebito;
  usuariosActivosConLoginUltimos7Dias: number;
  usuariosSinLoginUltimos30Dias: number;
  accionesRapidas: AccionRapida[];
}

export interface DashboardAdmin extends DashboardBase {
  type: "ADMINISTRACION_RRHH_COBRANZA";
  ventasSinObservaciones: KpiCard;
  usuariosActivos: KpiCard;
  usuariosInactivos: KpiCard;
  usuariosIncompletos: KpiCard;
  altasMes: KpiCard;
  bajasMes: KpiCard;
  statsUsuarios: StatsUsuarios;
  distribucionMetodosPago: Segmento[];
  statsDebito: StatsDebito;
  ventasDiariasEsteMes: VentasPorDia[];
  accionesRapidas: AccionRapida[];
}

export type Dashboard =
  | DashboardAsesor
  | DashboardSupervisor
  | DashboardJefeSupervisor
  | DashboardGerente
  | DashboardLider
  | DashboardAdmin;
