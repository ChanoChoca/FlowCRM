package com.flashpage.app.model.dto.dashboard;

public record TasaConversion(
        boolean modoReal,
        double tasaConversion,
        double tasaCalidad,
        long totalGestiones,
        long totalVendidas,
        long ventasMes,
        long metaGlobal,
        long ventasConDebitoAuto,
        long totalVentasPago,
        String metricaPrincipal) {
    public String estadoGauge() {
        if (tasaConversion >= 25)
            return "verde";
        if (tasaConversion >= 15)
            return "amarillo";
        return "rojo";
    }
}
