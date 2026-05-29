package com.flashpage.app.ticket.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.flashpage.app.ticket.model.EstadoTicket;
import com.flashpage.app.ticket.model.Ticket;

public record TicketResponse(
        Long id, String creadorNombre, String asignadoNombre,
        String titulo, String descripcion, EstadoTicket estado,
        List<TicketMensajeResponse> mensajes,
        LocalDateTime creadoEn, LocalDateTime actualizadoEn) {

    public static TicketResponse from(Ticket t) {
        return new TicketResponse(
                t.getId(),
                t.getCreador().getNombre() + " " + t.getCreador().getApellido(),
                t.getAsignado() != null ? t.getAsignado().getNombre() + " " + t.getAsignado().getApellido() : null,
                t.getTitulo(), t.getDescripcion(), t.getEstado(),
                t.getMensajes().stream().map(TicketMensajeResponse::from).toList(),
                t.getCreadoEn(), t.getActualizadoEn());
    }
}
