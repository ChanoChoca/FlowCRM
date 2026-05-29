package com.flashpage.app.dashboard.dto;

public interface SupervisorResumenProjection {
    Long getUsuarioId();
    String getNombre();
    String getApellido();
    Long getVentasMes();
    Long getVentasHoy();
    Long getTotalAsesores();
}
