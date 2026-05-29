package com.flashpage.app.dashboard.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.flashpage.app.dashboard.model.Desafio;
import com.flashpage.app.dashboard.model.DesafioEstado;

public interface DesafioRepository extends JpaRepository<Desafio, Long> {

    Optional<Desafio> findBySupervisorIdAndEstado(Long supervisorId, DesafioEstado estado);

    List<Desafio> findBySupervisorIdOrderByCreadoEnDesc(Long supervisorId);

    boolean existsBySupervisorIdAndEstado(Long supervisorId, DesafioEstado estado);

    List<Desafio> findByEstadoAndFechaVencimientoGreaterThanEqual(DesafioEstado estado, LocalDate fecha);

    @Query(value = """
            SELECT COUNT(v.id)
            FROM venta v
            INNER JOIN usuario u ON v.usuario_id = u.id
            WHERE u.supervisor_id = :supervisorId
            AND v.estado NOT IN ('CANCELADA','RECHAZADA')
            AND DATE(v.creado_en) BETWEEN :desde AND :hasta
            AND (:horario IS NULL OR v.contacto = :horario)
            AND (:productoId IS NULL OR v.producto_id = :productoId)
            """, nativeQuery = true)
    long countProgresoDesafio(@Param("supervisorId") Long supervisorId,
            @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta,
            @Param("horario") String horario, @Param("productoId") Long productoId);

    @Modifying
    @Query("""
            UPDATE Desafio d SET d.estado = com.flashpage.app.dashboard.model.DesafioEstado.VENCIDO
            WHERE d.estado = com.flashpage.app.dashboard.model.DesafioEstado.ACTIVO
            AND d.fechaVencimiento < :hoy
            """)
    int cerrarVencidos(@Param("hoy") LocalDate hoy);
}
