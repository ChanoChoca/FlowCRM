package com.flashpage.app.dashboard.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.flashpage.app.dashboard.model.DesafioEstado;
import com.flashpage.app.venta.model.AuditoriaHorario;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class DesafioDTOs {

    private DesafioDTOs() {}

    public record DesafioRequest(
            @NotBlank @Size(max = 120) String titulo,
            @Size(max = 500) String descripcion,
            @NotNull @Min(1) @Max(500) Integer metaVentas,
            AuditoriaHorario horario,
            Long productoId,
            @NotNull LocalDate fechaInicio,
            @NotNull LocalDate fechaVencimiento) {}

    public record DesafioResponse(Long id, String titulo, String descripcion, int metaVentas,
            AuditoriaHorario horario, Long productoId, String nombreProducto,
            LocalDate fechaInicio, LocalDate fechaVencimiento, DesafioEstado estado,
            long progreso, double porcentaje, long diasRestantes, boolean completado,
            LocalDateTime creadoEn) {}

    public record DesafioCardResponse(Long id, String titulo, int metaVentas, long progreso,
            double porcentaje, long diasRestantes, boolean completado, String turno) {}
}
