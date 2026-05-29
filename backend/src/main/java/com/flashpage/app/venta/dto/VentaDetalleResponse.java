package com.flashpage.app.venta.dto;

import java.time.LocalDateTime;

import com.flashpage.app.usuario.dto.AsesorDTO;
import com.flashpage.app.venta.model.Ani;
import com.flashpage.app.venta.model.AuditoriaHorario;
import com.flashpage.app.venta.model.EstadoVenta;
import com.flashpage.app.venta.model.Origen;
import com.flashpage.app.venta.model.Venta;

public record VentaDetalleResponse(
        Long id,
        AsesorDTO asesor,
        ClienteDTO cliente,
        String productoNombre,
        String promoNombre,
        String centralNombre,
        Ani ani,
        Integer decos,
        AuditoriaHorario contacto,
        PagoDTO pago,
        String observaciones,
        Origen origen,
        EstadoVenta estado,
        LocalDateTime creadoEn,
        LocalDateTime actualizadoEn) {

    public static VentaDetalleResponse from(Venta v) {
        return new VentaDetalleResponse(
                v.getId(),
                AsesorDTO.from(v.getAsesor()),
                ClienteDTO.from(v.getCliente()),
                v.getProducto().getNombre(),
                v.getPromo().getNombre(),
                v.getCentral().getNombre(),
                v.getAni(),
                v.getDecos(),
                v.getContacto(),
                PagoDTO.from(v.getPago()),
                v.getObservaciones(),
                v.getOrigen(),
                v.getEstado(),
                v.getCreadoEn(),
                v.getActualizadoEn());
    }
}
