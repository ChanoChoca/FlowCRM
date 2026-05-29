package com.flashpage.app.dashboard.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class DashboardDTOs {

    private DashboardDTOs() {}

    public record KpiCard(String label, long valor, Double tendenciaPct, String estado, String tooltip) {}

    public record Alerta(String tipo, String mensaje, String severidad) {}

    public record MetaProgress(int metaMensual, long ventasMes, double porcentaje, int ventasRestantes,
            int hitoActual, int proximoHito, String mensajeContextual, boolean animarHito) {}

    public record Racha(int diasConsecutivos, boolean activa, String proximoBadge) {}

    public record Badge(String codigo, String nombre, String descripcion, boolean desbloqueado,
            LocalDateTime fechaDesbloqueo, String condicion) {}

    public record Segmento(String nombre, long cantidad, double porcentaje) {}

    public record VentasPorDia(LocalDate fecha, long cantidad, long cantidadAnterior) {}

    public record HeatmapDia(LocalDate fecha, long cantidad, int nivel) {}

    public record RankingOpcional(boolean activo, Integer posicion, Integer totalAsesores,
            Double promedioEquipo, long propiasMesActual) {}

    public record AsesorResumen(Long usuarioId, String nombre, String apellido, long ventasMes,
            double proporcionEnEquipo, boolean conVentasHoy, boolean enRacha) {}

    public record SupervisorResumen(Long usuarioId, String nombre, String apellido, long ventasMes,
            long ventasHoy, long totalAsesores, double proporcionEnJefe, boolean equipoEnRiesgo,
            Double tendenciaPctMes) {}

    public record StatsDebito(long totalVentas, long conDebitoAuto, double porcentajeDebito) {}

    public record AccionRapida(String codigo, String label, String icono, String ruta) {}

    public record ActividadUsuario(Long usuarioId, String nombre, String apellido, String rol,
            String franjaActividad, boolean activo, long ventasMes, LocalDateTime ultimoLogin) {}

    public record StatsUsuarios(long activos, long inactivos, long altasMes, long bajasMes,
            long incompletos, long sinLoginUltimos30Dias) {}

    public record OrigenTendenciaDia(LocalDate fecha, long ventasCrm, long ventasPowerApp) {}

    public record CompSemana(long ventasSemanaActual, long mejorSemanaPrevia, long ventasParaSuperarla,
            boolean yaSuperada, String mensajeContextual) {
        public static CompSemana calcular(long actual, long mejorPrevio) {
            boolean superada = actual >= mejorPrevio && mejorPrevio > 0;
            long faltan = Math.max(0, mejorPrevio - actual);
            String mensaje;
            if (mejorPrevio == 0) {
                mensaje = "¡Esta es tu primera semana con ventas!";
            } else if (superada) {
                mensaje = "¡Superaste tu mejor semana histórica!";
            } else {
                mensaje = "Tu mejor semana fue " + mejorPrevio + " — estás a " + faltan + " venta(s) de superarla.";
            }
            return new CompSemana(actual, mejorPrevio, faltan, superada, mensaje);
        }
    }

    public record ComparativaAsesor(long ventasMesActual, int metaMesActual, double porcentajeMeta,
            long ventasMesAnterior, Double tendenciaMesAnterior, long ventasMismoMesAnioAnterior,
            Double tendenciaAnual, Integer posicionEquipo, Integer totalEquipo, double promedioEquipo,
            long forecastCierreMes, double forecastPorcentajeMeta, int diasRestantesMes,
            double promedioVentasDiarias, String mensajeForecast) {}
}
