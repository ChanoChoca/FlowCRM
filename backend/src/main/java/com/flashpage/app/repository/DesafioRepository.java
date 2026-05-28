package com.flashpage.app.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.flashpage.app.model.dashboard.Desafio;
import com.flashpage.app.model.dashboard.DesafioEstado;

public interface DesafioRepository extends JpaRepository<Desafio, Long> {

  Optional<Desafio> findBySupervisorIdAndEstado(Long supervisorId, DesafioEstado estado);

  List<Desafio> findBySupervisorIdOrderByCreadoEnDesc(Long supervisorId);

  @Query(value = """
      SELECT COUNT(*) FROM venta v
      INNER JOIN usuario u ON v.usuario_id = u.id
      WHERE u.supervisor_id = :supId
        AND DATE(v.creado_en) BETWEEN :desde AND :hasta
        AND (:turno     IS NULL OR v.contacto    = :turno)
        AND (:productoId IS NULL OR v.producto_id = :productoId)
      """, nativeQuery = true)
  long countProgresoDesafio(
      @Param("supId") Long supervisorId,
      @Param("desde") LocalDate desde,
      @Param("hasta") LocalDate hasta,
      @Param("turno") String turno,
      @Param("productoId") Long productoId);

  @Modifying
  @Query("UPDATE Desafio d SET d.estado = DesafioEstado.VENCIDO, d.actualizadoEn = CURRENT_TIMESTAMP " +
      "WHERE d.estado = DesafioEstado.ACTIVO AND d.fechaVencimiento < :hoy")
  int cerrarVencidos(@Param("hoy") LocalDate hoy);

  boolean existsBySupervisorIdAndEstado(Long supervisorId, DesafioEstado estado);

  List<Desafio> findByEstadoAndFechaVencimientoGreaterThanEqual(
      DesafioEstado estado, LocalDate fecha);
}