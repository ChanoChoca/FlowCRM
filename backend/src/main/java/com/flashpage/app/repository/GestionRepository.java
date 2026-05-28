package com.flashpage.app.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.flashpage.app.model.dashboard.Gestion;
import com.flashpage.app.model.dto.dashboard.TasaConversionEquipoProjection;
import com.flashpage.app.model.dto.dashboard.TasaConversionProjection;

public interface GestionRepository extends JpaRepository<Gestion, Long> {

        @Query(value = """
                        SELECT
                            COUNT(*)                                          AS totalGestiones,
                            SUM(CASE WHEN g.estado = 'VENDIDO' THEN 1 ELSE 0 END) AS totalVendidas,
                            ROUND(
                                SUM(CASE WHEN g.estado = 'VENDIDO' THEN 1 ELSE 0 END)
                                * 100.0 / NULLIF(COUNT(*), 0),
                            2)                                               AS tasaConversion
                        FROM gestion g
                        WHERE g.asesor_id = :asesorId
                          AND g.fecha_gestion BETWEEN :desde AND :hasta
                        """, nativeQuery = true)
        TasaConversionProjection findTasaConversionByAsesor(
                        @Param("asesorId") Long asesorId,
                        @Param("desde") LocalDate desde,
                        @Param("hasta") LocalDate hasta);

        @Query(value = """
                        SELECT g.asesor_id                                   AS usuarioId,
                               COUNT(g.id)                                   AS totalGestiones,
                               SUM(CASE WHEN g.estado = 'VENDIDO' THEN 1 ELSE 0 END) AS totalVendidas,
                               ROUND(
                                   SUM(CASE WHEN g.estado = 'VENDIDO' THEN 1 ELSE 0 END)
                                   * 100.0 / NULLIF(COUNT(g.id), 0), 2)     AS tasaConversion
                        FROM gestion g
                        JOIN usuario u ON g.asesor_id = u.id
                        WHERE u.supervisor_id = :supervisorId
                          AND g.fecha_gestion BETWEEN :desde AND :hasta
                          AND u.activo = true
                        GROUP BY g.asesor_id
                        """, nativeQuery = true)
        List<TasaConversionEquipoProjection> findTasaConversionByEquipo(
                        @Param("supervisorId") Long supervisorId,
                        @Param("desde") LocalDate desde,
                        @Param("hasta") LocalDate hasta);

        @Query(value = """
                        SELECT
                            COUNT(*)                                          AS totalGestiones,
                            SUM(CASE WHEN g.estado = 'VENDIDO' THEN 1 ELSE 0 END) AS totalVendidas,
                            ROUND(
                                SUM(CASE WHEN g.estado = 'VENDIDO' THEN 1 ELSE 0 END)
                                * 100.0 / NULLIF(COUNT(*), 0),
                            2)                                               AS tasaConversion
                        FROM gestion g
                        WHERE g.fecha_gestion BETWEEN :desde AND :hasta
                          AND (:centralId  IS NULL OR g.central_id  = :centralId)
                          AND (:productoId IS NULL OR g.producto_id = :productoId)
                          AND (:origen     IS NULL OR g.origen      = :origen)
                        """, nativeQuery = true)
        TasaConversionProjection findTasaConversionGlobal(
                        @Param("desde") LocalDate desde,
                        @Param("hasta") LocalDate hasta,
                        @Param("centralId") Long centralId,
                        @Param("productoId") Long productoId,
                        @Param("origen") String origen);

        @Query(value = "SELECT COUNT(*) FROM gestion", nativeQuery = true)
        long countGestiones();

        java.util.Optional<Gestion> findByVentaId(Long ventaId);
}