package com.flashpage.app.model.dto.dashboard;

import java.time.LocalDate;

public interface UsuarioFechaVentaProjection {
    Long getUsuarioId();

    LocalDate getFecha();
}