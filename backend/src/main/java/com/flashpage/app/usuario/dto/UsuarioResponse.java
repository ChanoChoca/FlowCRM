package com.flashpage.app.usuario.dto;

import java.time.LocalDateTime;

import com.flashpage.app.usuario.model.Rol;

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
