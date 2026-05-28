package com.flashpage.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.flashpage.app.model.Notificacion;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByDestinatario_IdOrderByCreadoEnDesc(Long destinatarioId);

    long countByDestinatario_IdAndLeidaFalse(Long destinatarioId);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leida = true WHERE n.destinatario.id = :destinatarioId AND n.leida = false")
    void marcarTodasLeidas(Long destinatarioId);
}
