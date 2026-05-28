package com.flashpage.app.model.dto;

import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
                @NotBlank(message = "El DNI es obligatorio") String dni) {
}
