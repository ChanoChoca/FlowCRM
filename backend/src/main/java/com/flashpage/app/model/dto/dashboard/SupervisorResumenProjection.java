package com.flashpage.app.model.dto.dashboard;

public interface SupervisorResumenProjection {
    Long getUsuarioId();

    String getNombre();

    String getApellido();

    Long getVentasMes();

    Long getVentasHoy();

    Long getTotalAsesores();
}