package com.flashpage.app.model.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.flashpage.app.model.Anuncio;
import com.flashpage.app.model.Rol;

public record AnuncioResponse(
        Long id,
        Long autorId,
        String autorNombre,
        String autorApellido,
        String titulo,
        String contenido,
        List<Rol> rolesDestino,
        int totalLecturas,
        boolean leidoPorMi,
        LocalDateTime creadoEn,
        LocalDateTime actualizadoEn) {

    public static AnuncioResponse from(Anuncio a, Long miId) {
        List<Rol> roles = new ArrayList<>(a.getRolesDestino());
        List<Long> lectores = new ArrayList<>(a.getLeidoPor());
        return new AnuncioResponse(
                a.getId(),
                a.getAutor().getId(),
                a.getAutor().getNombre(),
                a.getAutor().getApellido(),
                a.getTitulo(),
                a.getContenido(),
                roles,
                lectores.size(),
                lectores.contains(miId),
                a.getCreadoEn(),
                a.getActualizadoEn());
    }
}
