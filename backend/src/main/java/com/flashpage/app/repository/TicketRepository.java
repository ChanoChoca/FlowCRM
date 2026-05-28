package com.flashpage.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.flashpage.app.model.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    /** Tickets donde el usuario es creador o asignado. */
    @Query("SELECT t FROM Ticket t WHERE t.creador.id = :userId OR t.asignado.id = :userId ORDER BY t.actualizadoEn DESC")
    List<Ticket> findByParticipante(Long userId);

    List<Ticket> findAllByOrderByActualizadoEnDesc();
}
