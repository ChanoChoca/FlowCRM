package com.flashpage.app.model.dto.dashboard;

import java.time.LocalDate;

public interface VentasPorDiaProjection {
    LocalDate getFecha();

    Long getCantidad();
}