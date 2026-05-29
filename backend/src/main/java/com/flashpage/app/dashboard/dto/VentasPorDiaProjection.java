package com.flashpage.app.dashboard.dto;

import java.time.LocalDate;

public interface VentasPorDiaProjection {
    LocalDate getFecha();
    Long getCantidad();
}
