package com.flashpage.app.comunicacion.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.flashpage.app.comunicacion.model.Anuncio;
import com.flashpage.app.usuario.model.Rol;

public record AnuncioResponse(Long id, String autorNombre, String titulo, String contenido,
        List<Rol> rolesDestino, boolean leido, LocalDateTime creadoEn) {

    public static AnuncioResponse from(Anuncio a, Long usuarioId) {
        return new AnuncioResponse(a.getId(),
                a.getAutor().getNombre() + " " + a.getAutor().getApellido(),
                a.getTitulo(), a.getContenido(), a.getRolesDestino(),
                a.getLeidoPor().contains(usuarioId), a.getCreadoEn());
    }
}
