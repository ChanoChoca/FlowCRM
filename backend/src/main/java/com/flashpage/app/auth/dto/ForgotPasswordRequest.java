package com.flashpage.app.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "El DNI es obligatorio") String dni) {
}
