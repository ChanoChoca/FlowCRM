package com.flashpage.app.comunicacion.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.flashpage.app.comunicacion.model.Anuncio;
import com.flashpage.app.usuario.model.Rol;

public interface AnuncioRepository extends JpaRepository<Anuncio, Long> {

    @Query("SELECT a FROM Anuncio a WHERE a.rolesDestino IS EMPTY OR :rol MEMBER OF a.rolesDestino ORDER BY a.creadoEn DESC")
    List<Anuncio> findVisiblesParaRol(@Param("rol") Rol rol);
}
