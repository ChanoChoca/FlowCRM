package com.flashpage.app.venta.dto;

public record VentaMapaResponse(
        Long id,
        String clienteNombre,
        String asesorNombre,
        String productoNombre,
        String centralNombre,
        String estado,
        double lat,
        double lng,
        String localidad,
        String provincia) {
}
