package com.flashpage.app.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CambioEstadoRequest(
        @NotNull Long id,
        @NotBlank String estado,
        String feedback) {
}
