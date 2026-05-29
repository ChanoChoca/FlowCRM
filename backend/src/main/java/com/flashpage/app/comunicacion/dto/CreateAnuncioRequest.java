package com.flashpage.app.comunicacion.dto;

import java.util.List;

import com.flashpage.app.usuario.model.Rol;

public record CreateAnuncioRequest(String titulo, String contenido, List<Rol> rolesDestino) {}
