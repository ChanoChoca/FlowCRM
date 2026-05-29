package com.flashpage.app.comunicacion.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.flashpage.app.comunicacion.model.Notificacion;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByDestinatario_IdOrderByCreadoEnDesc(Long userId);

    long countByDestinatario_IdAndLeidaFalse(Long userId);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leida = true WHERE n.destinatario.id = :userId")
    void marcarTodasLeidas(@Param("userId") Long userId);
}
