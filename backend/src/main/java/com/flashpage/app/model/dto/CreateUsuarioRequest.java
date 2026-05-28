package com.flashpage.app.model.dto;

import com.flashpage.app.model.Rol;

public record CreateUsuarioRequest(String dni, String password, Rol rol, Long supervisorId,
                String telefono, String nombre, String apellido,
                String plazaUsername, String plazaPassword) {
}