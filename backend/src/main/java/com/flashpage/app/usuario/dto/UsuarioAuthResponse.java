package com.flashpage.app.usuario.dto;

import java.time.LocalDateTime;

import com.flashpage.app.usuario.model.Rol;

public record UsuarioAuthResponse(
        Long id,
        String dni,
        String password,
        Rol rol,
        UsuarioSupervisorResponse supervisor,
        String telefono,
        String nombre,
        String apellido,
        String plazaUsername,
        String plazaPassword,
        Boolean activo,
        Boolean rankingOptActivo,
        LocalDateTime ultimoLogin,
        LocalDateTime creadoEn,
        LocalDateTime actualizadoEn,
        String email,
        Boolean googleVinculado) {
}
