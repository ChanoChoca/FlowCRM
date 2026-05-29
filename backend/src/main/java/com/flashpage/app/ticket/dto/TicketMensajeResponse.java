package com.flashpage.app.ticket.dto;

import java.time.LocalDateTime;

import com.flashpage.app.ticket.model.TicketMensaje;

public record TicketMensajeResponse(Long id, String autorNombre, String contenido, LocalDateTime creadoEn) {
    public static TicketMensajeResponse from(TicketMensaje m) {
        return new TicketMensajeResponse(m.getId(),
                m.getAutor().getNombre() + " " + m.getAutor().getApellido(),
                m.getContenido(), m.getCreadoEn());
    }
}
