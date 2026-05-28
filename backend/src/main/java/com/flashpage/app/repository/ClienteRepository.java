package com.flashpage.app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flashpage.app.model.Cliente;
import com.flashpage.app.model.TipoDocumento;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByTipoDocumentoAndNumeroDocumento(TipoDocumento tipoDocumento, String numeroDocumento);
}
