package com.flashpage.app.model.dto;

import com.flashpage.app.model.Pago;
import com.flashpage.app.model.TipoTarjeta;

public record PagoDTO(
        Long id,
        Boolean debitoAutomatico,
        TipoTarjeta tipoTarjeta,
        String banco,
        String numeroTarjeta,
        String titular) {
    public static PagoDTO from(Pago p) {
        return new PagoDTO(
                p.getId(),
                p.getDebitoAutomatico(),
                p.getTipoTarjeta(),
                p.getBanco(),
                p.getNumeroTarjeta(),
                p.getTitular());
    }
}
