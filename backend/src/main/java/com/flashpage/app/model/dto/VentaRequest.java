package com.flashpage.app.model.dto;

import com.flashpage.app.model.Ani;
import com.flashpage.app.model.AuditoriaHorario;
import com.flashpage.app.model.Cliente;
import com.flashpage.app.model.Origen;
import com.flashpage.app.model.Pago;

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
