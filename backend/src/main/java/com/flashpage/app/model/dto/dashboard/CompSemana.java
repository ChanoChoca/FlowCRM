package com.flashpage.app.model.dto.dashboard;

public record CompSemana(
        long ventasSemanaActual,
        long mejorSemanaPrevia,
        long ventasParaSuperarla,
        boolean yaSuperada,
        String mensajeContextual
) {
    public static CompSemana calcular(long actual, long mejorPrevio) {
        boolean superada = actual >= mejorPrevio && mejorPrevio > 0;
        long faltan = Math.max(0, mejorPrevio - actual);
        String mensaje;
        if (mejorPrevio == 0)  mensaje = "¡Esta es tu primera semana con ventas!";
        else if (superada)     mensaje = "¡Superaste tu mejor semana histórica!";
        else                   mensaje = "Tu mejor semana fue " + mejorPrevio
                                       + " — estás a " + faltan + " venta(s) de superarla.";
        return new CompSemana(actual, mejorPrevio, faltan, superada, mensaje);
    }
}