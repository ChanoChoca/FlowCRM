package com.flashpage.app.model.dto;

import com.flashpage.app.model.EstadoVenta;

import java.time.LocalDateTime;

public record VentaResponse (
    Long id,
    String clienteNombre,
    String promo,
    String asesorNombre,
    String asesorApellido,
    String supervisorNombre,
    String supervisorApellido,
    EstadoVenta estado,
    LocalDateTime creadoEn
) {}
