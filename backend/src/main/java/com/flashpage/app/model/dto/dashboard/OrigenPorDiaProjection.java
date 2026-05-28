package com.flashpage.app.model.dto.dashboard;

import java.time.LocalDate;

public interface OrigenPorDiaProjection {
    LocalDate getFecha();

    String getOrigen();

    Long getCantidad();
}