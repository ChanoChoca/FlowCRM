package com.flashpage.app.comunicacion.dto;

import java.time.LocalDateTime;

import com.flashpage.app.comunicacion.model.Notificacion;
import com.flashpage.app.comunicacion.model.TipoNotificacion;

public record NotificacionResponse(Long id, TipoNotificacion tipo, String titulo, String mensaje,
        Long referenciaId, boolean leida, LocalDateTime creadoEn) {

    public static NotificacionResponse from(Notificacion n) {
        return new NotificacionResponse(n.getId(), n.getTipo(), n.getTitulo(), n.getMensaje(),
                n.getReferenciaId(), n.isLeida(), n.getCreadoEn());
    }
}
