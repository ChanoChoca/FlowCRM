package com.flashpage.app.venta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CambioEstadoRequest(
        @NotNull Long id,
        @NotBlank String estado,
        String feedback) {
}
