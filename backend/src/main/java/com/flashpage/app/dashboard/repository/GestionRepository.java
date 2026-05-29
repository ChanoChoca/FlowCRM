package com.flashpage.app.dashboard.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.flashpage.app.dashboard.dto.TasaConversionEquipoProjection;
import com.flashpage.app.dashboard.dto.TasaConversionProjection;
import com.flashpage.app.dashboard.model.Gestion;

public interface GestionRepository extends JpaRepository<Gestion, Long> {

    Optional<Gestion> findByVentaId(Long ventaId);

    @Query(value = "SELECT COUNT(*) FROM gestion", nativeQuery = true)
    long countGestiones();

    @Query(value = """
            SELECT COUNT(*) AS totalGestiones,
                   SUM(CASE WHEN g.estado = 'VENDIDO' THEN 1 ELSE 0 END) AS totalVendidas,
                   ROUND(SUM(CASE WHEN g.estado = 'VENDIDO' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS tasaConversion
            FROM gestion g
            WHERE g.asesor_id = :asesorId
            AND DATE(g.creado_en) BETWEEN :desde AND :hasta
            """, nativeQuery = true)
    TasaConversionProjection findTasaConversionByAsesor(@Param("asesorId") Long asesorId,
            @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query(value = """
            SELECT g.asesor_id AS usuarioId,
                   COUNT(*) AS totalGestiones,
                   SUM(CASE WHEN g.estado = 'VENDIDO' THEN 1 ELSE 0 END) AS totalVendidas,
                   ROUND(SUM(CASE WHEN g.estado = 'VENDIDO' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS tasaConversion
            FROM gestion g
            INNER JOIN usuario u ON g.asesor_id = u.id
            WHERE u.supervisor_id = :supervisorId
            AND DATE(g.creado_en) BETWEEN :desde AND :hasta
            GROUP BY g.asesor_id
            """, nativeQuery = true)
    List<TasaConversionEquipoProjection> findTasaConversionByEquipo(@Param("supervisorId") Long supervisorId,
            @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query(value = """
            SELECT COUNT(*) AS totalGestiones,
                   SUM(CASE WHEN g.estado = 'VENDIDO' THEN 1 ELSE 0 END) AS totalVendidas,
                   ROUND(SUM(CASE WHEN g.estado = 'VENDIDO' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS tasaConversion
            FROM gestion g
            LEFT JOIN venta v ON g.venta_id = v.id
            WHERE DATE(g.creado_en) BETWEEN :desde AND :hasta
            AND (:centralId IS NULL OR v.central_id = :centralId)
            AND (:productoId IS NULL OR v.producto_id = :productoId)
            AND (:origen IS NULL OR v.origen = :origen)
            """, nativeQuery = true)
    TasaConversionProjection findTasaConversionGlobal(@Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta, @Param("centralId") Long centralId,
            @Param("productoId") Long productoId, @Param("origen") String origen);
}
