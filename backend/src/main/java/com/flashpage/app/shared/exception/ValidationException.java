package com.flashpage.app.shared.exception;

import java.util.List;

public class ValidationException extends RuntimeException {

    private final List<String> errores;

    public ValidationException(String mensaje) {
        super(mensaje);
        this.errores = List.of(mensaje);
    }

    public ValidationException(List<String> errores) {
        super("Errores de validación");
        this.errores = errores;
    }

    public List<String> getErrores() {
        return errores;
    }
}
