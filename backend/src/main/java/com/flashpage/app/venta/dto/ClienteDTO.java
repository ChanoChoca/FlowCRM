package com.flashpage.app.venta.dto;

import com.flashpage.app.catalogo.model.Provincia;
import com.flashpage.app.venta.model.Cliente;
import com.flashpage.app.venta.model.Domicilio;
import com.flashpage.app.venta.model.TipoDocumento;

public record ClienteDTO(
        Long id,
        String nombre,
        TipoDocumento tipoDocumento,
        String numeroDocumento,
        String telefono,
        String email,
        DomicilioDTO domicilio) {

    public static ClienteDTO from(Cliente c) {
        return new ClienteDTO(c.getId(), c.getNombre(), c.getTipoDocumento(),
                c.getNumeroDocumento(), c.getTelefono(), c.getEmail(),
                DomicilioDTO.from(c.getDomicilio()));
    }

    public record DomicilioDTO(
            Long id, String calle, String numero, String piso, String depto,
            String entreCalles1, String entreCalles2, String entreCalles3,
            String localidad, String codigoPostal, ProvinciaDTO provincia, String observaciones) {

        public record ProvinciaDTO(Long id, String nombre) {
            public static ProvinciaDTO from(Provincia p) {
                return p == null ? null : new ProvinciaDTO(p.getId(), p.getNombre());
            }
        }

        public static DomicilioDTO from(Domicilio d) {
            if (d == null) return null;
            return new DomicilioDTO(d.getId(), d.getCalle(), d.getNumero(), d.getPiso(), d.getDepto(),
                    d.getEntreCalles1(), d.getEntreCalles2(), d.getEntreCalles3(),
                    d.getLocalidad(), d.getCodigoPostal(),
                    ProvinciaDTO.from(d.getProvincia()), d.getObservaciones());
        }
    }
}
