package com.flashpage.app.model.dto;

import com.flashpage.app.model.Cliente;
import com.flashpage.app.model.TipoDocumento;

public record ClienteDTO(
        Long id,
        String nombre,
        TipoDocumento tipoDocumento,
        String numeroDocumento,
        String telefono,
        String email,
        DomicilioDTO domicilio) {
    public static ClienteDTO from(Cliente c) {
        return new ClienteDTO(
                c.getId(),
                c.getNombre(),
                c.getTipoDocumento(),
                c.getNumeroDocumento(),
                c.getTelefono(),
                c.getEmail(),
                DomicilioDTO.from(c.getDomicilio()));
    }
}