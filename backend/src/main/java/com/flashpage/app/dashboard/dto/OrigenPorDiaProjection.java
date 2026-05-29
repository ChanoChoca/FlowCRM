package com.flashpage.app.dashboard.dto;

import java.time.LocalDate;

public interface OrigenPorDiaProjection {
    LocalDate getFecha();
    String getOrigen();
    Long getCantidad();
}
