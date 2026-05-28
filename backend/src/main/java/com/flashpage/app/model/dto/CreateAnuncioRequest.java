package com.flashpage.app.model.dto;

import java.util.List;

import com.flashpage.app.model.Rol;

public record CreateAnuncioRequest(
        String titulo,
        String contenido,
        List<Rol> rolesDestino) {}
