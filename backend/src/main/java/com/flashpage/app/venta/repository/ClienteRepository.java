package com.flashpage.app.venta.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flashpage.app.venta.model.Cliente;
import com.flashpage.app.venta.model.TipoDocumento;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByTipoDocumentoAndNumeroDocumento(TipoDocumento tipoDocumento, String numeroDocumento);
}
