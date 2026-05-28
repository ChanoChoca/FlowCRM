package com.flashpage.app.model.dto;

public record CreateTicketRequest(
        String titulo,
        String descripcion,
        Long asignadoId) {}
