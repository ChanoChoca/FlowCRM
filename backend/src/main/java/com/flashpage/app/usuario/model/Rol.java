package com.flashpage.app.usuario.model;

public enum Rol {
    LIDER(8),
    GERENTE(7),
    ADMINISTRACION_RRHH_COBRANZA(6),
    JEFE_DE_SUPERVISOR(5),
    SUPERVISOR(4),
    ASESOR(3);

    public final int valor;

    Rol(int valor) {
        this.valor = valor;
    }
}
