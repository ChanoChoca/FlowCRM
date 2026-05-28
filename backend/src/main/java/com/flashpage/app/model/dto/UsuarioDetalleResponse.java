package com.flashpage.app.model.dto;

import java.time.LocalDateTime;

import com.flashpage.app.model.Rol;

public record UsuarioDetalleResponse(
                String dni,
                String password,
                Rol rol,
                Long supervisorId,
                String telefono,
                String nombre,
                String apellido,
                String plazaUsername,
                String plazaPassword,
                LocalDateTime ultimoLogin,
                LocalDateTime creadoEn,
                LocalDateTime actualizadoEn,
                String email,
                Boolean googleVinculado) {
}
