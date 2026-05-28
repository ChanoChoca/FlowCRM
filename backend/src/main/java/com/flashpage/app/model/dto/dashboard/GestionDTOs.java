package com.flashpage.app.model.dto.dashboard;

public final class GestionDTOs {

        private GestionDTOs() {
        }

        public record ConversionAsesorResumen(
                        Long asesorId,
                        String nombre,
                        String apellido,
                        long totalGestiones,
                        long totalVendidas,
                        double tasaConversion) {
        }

        public record ConversionPropiaResumen(
                        long totalGestiones,
                        long totalVendidas,
                        double tasaConversion) {
        }
}
