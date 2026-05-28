package com.flashpage.app.model.dto;

import java.time.LocalDateTime;

import com.flashpage.app.model.TicketMensaje;

public record TicketMensajeResponse(
        Long id,
        Long autorId,
        String autorNombre,
        String autorApellido,
        String contenido,
        LocalDateTime creadoEn) {

    public static TicketMensajeResponse from(TicketMensaje m) {
        return new TicketMensajeResponse(
                m.getId(),
                m.getAutor().getId(),
                m.getAutor().getNombre(),
                m.getAutor().getApellido(),
                m.getContenido(),
                m.getCreadoEn());
    }
}
