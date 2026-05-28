package com.flashpage.app.model.dto.dashboard;

import java.time.LocalDate;
import java.time.YearMonth;

public record DashboardFiltro(
        LocalDate desde,
        LocalDate hasta,
        Long centralId,
        Long productoId,
        Long promoId,
        String origen) {

    public static DashboardFiltro mesActual() {
        LocalDate hoy = LocalDate.now();
        return new DashboardFiltro(hoy.withDayOfMonth(1), hoy, null, null, null, null);
    }

    public static DashboardFiltro mesAnterior() {
        YearMonth ant = YearMonth.now().minusMonths(1);
        return new DashboardFiltro(
                ant.atDay(1), ant.atEndOfMonth(), null, null, null, null);
    }

    public static DashboardFiltro of(LocalDate desde, LocalDate hasta,
            Long centralId, Long productoId,
            Long promoId, String origen) {
        LocalDate hoy = LocalDate.now();
        return new DashboardFiltro(
                desde != null ? desde : hoy.withDayOfMonth(1),
                hasta != null ? hasta : hoy,
                centralId,
                productoId,
                promoId,
                origen);
    }

    public int diasRango() {
        if (desde == null || hasta == null)
            return 30;
        return (int) java.time.temporal.ChronoUnit.DAYS.between(desde, hasta) + 1;
    }
}