package com.flashpage.app.dashboard.dto;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import com.flashpage.app.dashboard.model.Desafio;

public record ProgresoDesafio(long progreso, double porcentaje, long diasRestantes, boolean completado) {

    public static ProgresoDesafio calcular(Desafio d, long progreso) {
        double pct = d.getMetaVentas() > 0
                ? Math.min(progreso * 100.0 / d.getMetaVentas(), 100.0) : 0.0;
        long dias = Math.max(0, ChronoUnit.DAYS.between(LocalDate.now(), d.getFechaVencimiento()));
        return new ProgresoDesafio(progreso, pct, dias, progreso >= d.getMetaVentas());
    }
}
