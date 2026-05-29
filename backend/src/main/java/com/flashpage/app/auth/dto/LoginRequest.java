package com.flashpage.app.auth.dto;

public record LoginRequest(
        String dni,
        String password) {
}
