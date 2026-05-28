package com.flashpage.app.model.dto;

import java.time.LocalDateTime;

import com.flashpage.app.model.Rol;

public record UsuarioResponse(
        Long id,
        String dni,
        String nombre,
        String apellido,
        String telefono,
        Rol rol,
        UsuarioSupervisorResponse supervisor,
        boolean activo,
        boolean rankingOptActivo,
        LocalDateTime ultimoLogin,
        LocalDateTime creadoEn) {
}