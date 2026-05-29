package com.flashpage.app.venta.dto;

import java.time.LocalDateTime;

import com.flashpage.app.venta.model.EstadoVenta;

public record VentaResponse(
        Long id,
        String clienteNombre,
        String promo,
        String asesorNombre,
        String asesorApellido,
        String supervisorNombre,
        String supervisorApellido,
        EstadoVenta estado,
        LocalDateTime creadoEn) {
}
