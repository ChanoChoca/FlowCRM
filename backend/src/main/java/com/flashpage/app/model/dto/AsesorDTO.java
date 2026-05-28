package com.flashpage.app.model.dto;

import com.flashpage.app.model.Usuario;

public record AsesorDTO(
        Long id,
        String dni,
        String telefono,
        String nombre,
        String apellido) {
    public static AsesorDTO from(Usuario u) {
        return new AsesorDTO(
                u.getId(),
                u.getDni(),
                u.getTelefono(),
                u.getNombre(),
                u.getApellido());
    }
}