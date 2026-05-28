package com.flashpage.app.model;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class EstadoVentaContractTest {

    @ParameterizedTest
    @ValueSource(strings = {
            "CUMPLIDA",
            "CANCELADA",
            "RECHAZADA",
            "INICIADA",
            "PREVENTA",
            "TICKET",
            "PENDIENTE"
    })
    void estadosEnviadosPorN8nDeserializanAEstadoVenta(String valor) {
        assertDoesNotThrow(() -> EstadoVenta.valueOf(valor));
    }
}
