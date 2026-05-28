package com.flashpage.app.exception;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(int status, String mensaje, List<String> errores, Instant timestamp) {

    public static ErrorResponse of(int status, String mensaje) {
        return new ErrorResponse(status, mensaje, null, Instant.now());
    }

    public static ErrorResponse of(int status, String mensaje, List<String> errores) {
        return new ErrorResponse(status, mensaje, errores, Instant.now());
    }
}
