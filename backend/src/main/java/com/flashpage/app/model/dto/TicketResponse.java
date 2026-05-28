package com.flashpage.app.model.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.flashpage.app.model.EstadoTicket;
import com.flashpage.app.model.Ticket;

public record TicketResponse(
        Long id,
        Long creadorId,
        String creadorNombre,
        String creadorApellido,
        Long asignadoId,
        String asignadoNombre,
        String asignadoApellido,
        String titulo,
        String descripcion,
        EstadoTicket estado,
        List<TicketMensajeResponse> mensajes,
        LocalDateTime creadoEn,
        LocalDateTime actualizadoEn) {

    public static TicketResponse from(Ticket t) {
        return new TicketResponse(
                t.getId(),
                t.getCreador().getId(),
                t.getCreador().getNombre(),
                t.getCreador().getApellido(),
                t.getAsignado() != null ? t.getAsignado().getId() : null,
                t.getAsignado() != null ? t.getAsignado().getNombre() : null,
                t.getAsignado() != null ? t.getAsignado().getApellido() : null,
                t.getTitulo(),
                t.getDescripcion(),
                t.getEstado(),
                t.getMensajes().stream().map(TicketMensajeResponse::from).toList(),
                t.getCreadoEn(),
                t.getActualizadoEn());
    }
}
