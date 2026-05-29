package com.flashpage.app.venta.dto;

import com.flashpage.app.venta.model.Ani;
import com.flashpage.app.venta.model.AuditoriaHorario;
import com.flashpage.app.venta.model.Cliente;
import com.flashpage.app.venta.model.Origen;
import com.flashpage.app.venta.model.Pago;

public record VentaRequest(
        Long promoId,
        Long centralId,
        Ani ani,
        Integer decos,
        AuditoriaHorario contacto,
        Origen origen,
        String observaciones,
        Cliente cliente,
        Pago pago,
        Long asesorId,
        String fechaNacimiento,
        String miga) {
}
