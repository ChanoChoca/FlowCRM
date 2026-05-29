package com.flashpage.app.dashboard.dto;

public record TasaConversion(
        boolean tieneGestiones,
        double tasaReal,
        double tasaCalidad,
        long totalGestiones,
        long totalVendidas,
        long ventasMes,
        long metaGlobal,
        long conDebitoAuto,
        long totalVentas,
        String modo) {
}
