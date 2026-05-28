package com.flashpage.app.model.dto;

import com.flashpage.app.model.Origen;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LeadWebhookRequest(
        @NotBlank String nombreCompleto,
        @NotBlank String telefono,
        String servicioDeseado,
        @NotNull Origen origen) {
}
