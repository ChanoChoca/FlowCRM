package com.flashpage.app.ticket.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.flashpage.app.ticket.model.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findAllByOrderByActualizadoEnDesc();

    @Query("SELECT t FROM Ticket t WHERE t.creador.id = :userId OR t.asignado.id = :userId ORDER BY t.actualizadoEn DESC")
    List<Ticket> findByParticipante(@Param("userId") Long userId);
}
