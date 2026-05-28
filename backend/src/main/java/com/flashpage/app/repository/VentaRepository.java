package com.flashpage.app.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.flashpage.app.model.Venta;
import com.flashpage.app.model.dto.VentaMapaProjection;
import com.flashpage.app.model.dto.dashboard.AsesorResumenProjection;
import com.flashpage.app.model.dto.dashboard.DebutProductoProjection;
import com.flashpage.app.model.dto.dashboard.OrigenPorDiaProjection;
import com.flashpage.app.model.dto.dashboard.SegmentoProjection;
import com.flashpage.app.model.dto.dashboard.StatsDebitoProjection;
import com.flashpage.app.model.dto.dashboard.SupervisorResumenProjection;
import com.flashpage.app.model.dto.dashboard.UsuarioFechaVentaProjection;
import com.flashpage.app.model.dto.dashboard.UsuarioVentaCountProjection;
import com.flashpage.app.model.dto.dashboard.VentasPorDiaProjection;

public interface VentaRepository extends JpaRepository<Venta, Long>, JpaSpecificationExecutor<Venta> {

        @Query("""
                            select v from Venta v
                            join fetch v.cliente c
                            left join fetch c.fotosDni
                            where v.id = :id
                            and v.estado not in (com.flashpage.app.model.EstadoVenta.CANCELADA, com.flashpage.app.model.EstadoVenta.RECHAZADA)
                        """)
        Optional<Venta> findDetalleById(@Param("id") Long id);

        // ═════════════════════════════════════════════════════════════════════
        // ASESOR — métricas personales
        // ═════════════════════════════════════════════════════════════════════

        @Query(value = "SELECT COUNT(*) FROM venta v WHERE v.usuario_id = :uid AND v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) = CURDATE()", nativeQuery = true)
        long countVentasHoyByUsuario(@Param("uid") Long usuarioId);

        @Query(value = "SELECT COUNT(*) FROM venta v WHERE v.usuario_id = :uid AND v.estado NOT IN ('CANCELADA','RECHAZADA') AND YEARWEEK(v.creado_en,1) = YEARWEEK(CURDATE(),1)", nativeQuery = true)
        long countVentasSemanaByUsuario(@Param("uid") Long usuarioId);

        @Query(value = "SELECT COUNT(*) FROM venta v WHERE v.usuario_id = :uid AND v.estado NOT IN ('CANCELADA','RECHAZADA') AND YEAR(v.creado_en) = YEAR(CURDATE()) AND MONTH(v.creado_en) = MONTH(CURDATE())", nativeQuery = true)
        long countVentasMesByUsuario(@Param("uid") Long usuarioId);

        @Query(value = "SELECT COUNT(*) FROM venta v WHERE v.usuario_id = :uid AND v.estado NOT IN ('CANCELADA','RECHAZADA') AND YEAR(v.creado_en) = :anio AND MONTH(v.creado_en) = :mes", nativeQuery = true)
        long countVentasByUsuarioAndPeriodo(@Param("uid") Long usuarioId, @Param("anio") int anio,
                        @Param("mes") int mes);

        @Query(value = """
                        SELECT COALESCE(MAX(cnt),0) FROM (
                            SELECT COUNT(*) AS cnt FROM venta v
                            WHERE v.usuario_id = :uid AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                              AND NOT (YEAR(v.creado_en) = YEAR(CURDATE()) AND MONTH(v.creado_en) = MONTH(CURDATE()))
                            GROUP BY YEAR(v.creado_en), MONTH(v.creado_en)
                        ) sub
                        """, nativeQuery = true)
        long findMejorMesPrevioByUsuario(@Param("uid") Long usuarioId);

        @Query(value = """
                        SELECT DATE(v.creado_en) AS fecha, COUNT(*) AS cantidad
                        FROM venta v
                        WHERE v.usuario_id = :uid AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                          AND DATE(v.creado_en) BETWEEN :desde AND :hasta
                        GROUP BY DATE(v.creado_en)
                        ORDER BY fecha ASC
                        """, nativeQuery = true)
        List<VentasPorDiaProjection> findVentasPorDiaByUsuarioRango(
                        @Param("uid") Long usuarioId,
                        @Param("desde") LocalDate desde,
                        @Param("hasta") LocalDate hasta);

        @Query(value = """
                        SELECT DISTINCT DATE(v.creado_en) AS fecha
                        FROM venta v
                        WHERE v.usuario_id = :uid AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                          AND v.creado_en >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
                        ORDER BY fecha DESC
                        """, nativeQuery = true)
        List<LocalDate> findFechasConVentasByUsuario(@Param("uid") Long usuarioId);

        @Query(value = """
                        SELECT v.contacto AS nombre, COUNT(*) AS cantidad,
                               ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS porcentaje
                        FROM venta v
                        WHERE v.usuario_id = :uid AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                          AND YEAR(v.creado_en) = YEAR(CURDATE())
                          AND MONTH(v.creado_en) = MONTH(CURDATE())
                        GROUP BY v.contacto
                        """, nativeQuery = true)
        List<SegmentoProjection> findDistribucionTurnoByUsuario(@Param("uid") Long usuarioId);

        @Query(value = """
                        SELECT DISTINCT DATE(v.creado_en) AS fecha
                        FROM venta v
                        WHERE v.usuario_id = :uid AND v.estado NOT IN ('CANCELADA','RECHAZADA') AND v.contacto = 'AM'
                          AND v.creado_en >= DATE_SUB(CURDATE(), INTERVAL 10 DAY)
                        ORDER BY fecha DESC
                        """, nativeQuery = true)
        List<LocalDate> findFechasVentasAMByUsuario(@Param("uid") Long usuarioId);

        @Query(value = """
                        SELECT DISTINCT v.producto_id AS productoId, p.nombre AS nombreProducto
                        FROM venta v
                        INNER JOIN producto p ON v.producto_id = p.id
                        WHERE v.usuario_id = :uid AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                          AND YEAR(v.creado_en) = YEAR(CURDATE())
                          AND MONTH(v.creado_en) = MONTH(CURDATE())
                          AND v.producto_id NOT IN (
                              SELECT DISTINCT v2.producto_id FROM venta v2
                              WHERE v2.usuario_id = :uid AND v2.estado NOT IN ('CANCELADA','RECHAZADA')
                                AND (YEAR(v2.creado_en) < YEAR(CURDATE())
                                     OR (YEAR(v2.creado_en) = YEAR(CURDATE())
                                         AND MONTH(v2.creado_en) < MONTH(CURDATE())))
                          )
                        """, nativeQuery = true)
        List<DebutProductoProjection> findProductosDebutByUsuario(@Param("uid") Long usuarioId);

        @Query(value = """
                        SELECT COUNT(*) FROM venta v
                        WHERE v.usuario_id = :uid AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                          AND DATE(v.creado_en) BETWEEN :desde AND :hasta
                        """, nativeQuery = true)
        long countVentasByUsuarioEnRango(@Param("uid") Long usuarioId,
                        @Param("desde") LocalDate desde,
                        @Param("hasta") LocalDate hasta);

        // ═════════════════════════════════════════════════════════════════════
        // SUPERVISOR — métricas del equipo
        // ═════════════════════════════════════════════════════════════════════

        @Query(value = """
                        SELECT COUNT(*) FROM venta v
                        INNER JOIN usuario u ON v.usuario_id = u.id
                        WHERE u.supervisor_id = :supId AND v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) = CURDATE()
                        """, nativeQuery = true)
        long countVentasEquipoHoy(@Param("supId") Long supervisorId);

        @Query(value = """
                        SELECT COUNT(*) FROM venta v INNER JOIN usuario u ON v.usuario_id = u.id
                        WHERE u.supervisor_id = :supId AND v.estado NOT IN ('CANCELADA','RECHAZADA') AND YEARWEEK(v.creado_en,1) = YEARWEEK(CURDATE(),1)
                        """, nativeQuery = true)
        long countVentasEquipoSemana(@Param("supId") Long supervisorId);

        @Query(value = """
                        SELECT COUNT(*) FROM venta v INNER JOIN usuario u ON v.usuario_id = u.id
                        WHERE u.supervisor_id = :supId AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                          AND YEAR(v.creado_en) = YEAR(CURDATE()) AND MONTH(v.creado_en) = MONTH(CURDATE())
                        """, nativeQuery = true)
        long countVentasEquipoMes(@Param("supId") Long supervisorId);

        @Query(value = """
                        SELECT COUNT(DISTINCT v.usuario_id) FROM venta v INNER JOIN usuario u ON v.usuario_id = u.id
                        WHERE u.supervisor_id = :supId AND v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) = CURDATE()
                        """, nativeQuery = true)
        long countAsesoresConVentasHoy(@Param("supId") Long supervisorId);

        @Query(value = """
                        SELECT COALESCE(MAX(cnt),0) FROM (
                            SELECT COUNT(*) AS cnt FROM venta v INNER JOIN usuario u ON v.usuario_id = u.id
                            WHERE u.supervisor_id = :supId AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                              AND NOT (YEAR(v.creado_en) = YEAR(CURDATE()) AND MONTH(v.creado_en) = MONTH(CURDATE()))
                            GROUP BY YEAR(v.creado_en), MONTH(v.creado_en)
                        ) sub
                        """, nativeQuery = true)
        long findMejorMesPrevioEquipo(@Param("supId") Long supervisorId);

        @Query(value = """
                        SELECT u.id AS usuarioId, u.nombre AS nombre, u.apellido AS apellido,
                               COUNT(v.id) AS ventasMes
                        FROM usuario u
                        LEFT JOIN venta v ON v.usuario_id = u.id
                            AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                            AND YEAR(v.creado_en) = YEAR(CURDATE())
                            AND MONTH(v.creado_en) = MONTH(CURDATE())
                        WHERE u.supervisor_id = :supId AND u.rol = 'ASESOR' AND u.activo = true
                        GROUP BY u.id, u.nombre, u.apellido
                        ORDER BY ventasMes DESC
                        """, nativeQuery = true)
        List<AsesorResumenProjection> findResumenEquipoBySuper(@Param("supId") Long supervisorId);

        @Query(value = """
                        SELECT u.id AS usuarioId, COUNT(v.id) AS cantidad
                        FROM usuario u
                        LEFT JOIN venta v ON v.usuario_id = u.id AND v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) = CURDATE()
                        WHERE u.supervisor_id = :supId AND u.rol = 'ASESOR' AND u.activo = true
                        GROUP BY u.id
                        """, nativeQuery = true)
        List<UsuarioVentaCountProjection> findVentasHoyByEquipoBatch(@Param("supId") Long supervisorId);

        @Query(value = """
                        SELECT DISTINCT v.usuario_id AS usuarioId, DATE(v.creado_en) AS fecha
                        FROM venta v
                        INNER JOIN usuario u ON v.usuario_id = u.id
                        WHERE u.supervisor_id = :supId AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                          AND v.creado_en >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
                        ORDER BY v.usuario_id, fecha DESC
                        """, nativeQuery = true)
        List<UsuarioFechaVentaProjection> findFechasVentasEquipoBatch(@Param("supId") Long supervisorId);

        @Query(value = """
                        SELECT v.contacto AS nombre, COUNT(*) AS cantidad,
                               ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS porcentaje
                        FROM venta v INNER JOIN usuario u ON v.usuario_id = u.id
                        WHERE u.supervisor_id = :supId AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                          AND YEAR(v.creado_en) = YEAR(CURDATE())
                          AND MONTH(v.creado_en) = MONTH(CURDATE())
                        GROUP BY v.contacto
                        """, nativeQuery = true)
        List<SegmentoProjection> findDistribucionTurnoEquipo(@Param("supId") Long supervisorId);

        @Query(value = """
                        SELECT DATE(v.creado_en) AS fecha, COUNT(*) AS cantidad
                        FROM venta v INNER JOIN usuario u ON v.usuario_id = u.id
                        WHERE u.supervisor_id = :supId AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                          AND DATE(v.creado_en) BETWEEN :desde AND :hasta
                        GROUP BY DATE(v.creado_en)
                        ORDER BY fecha ASC
                        """, nativeQuery = true)
        List<VentasPorDiaProjection> findVentasPorDiaByEquipoRango(
                        @Param("supId") Long supervisorId,
                        @Param("desde") LocalDate desde,
                        @Param("hasta") LocalDate hasta);

        // ═════════════════════════════════════════════════════════════════════
        // JEFE DE SUPERVISOR
        // ═════════════════════════════════════════════════════════════════════

        @Query(value = """
                        SELECT COUNT(*) FROM venta v
                        INNER JOIN usuario asesor ON v.usuario_id = asesor.id
                        INNER JOIN usuario sup ON asesor.supervisor_id = sup.id
                        WHERE sup.supervisor_id = :jefeId AND v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) = CURDATE()
                        """, nativeQuery = true)
        long countVentasHoyByJefe(@Param("jefeId") Long jefeId);

        @Query(value = """
                        SELECT COUNT(*) FROM venta v
                        INNER JOIN usuario asesor ON v.usuario_id = asesor.id
                        INNER JOIN usuario sup ON asesor.supervisor_id = sup.id
                        WHERE sup.supervisor_id = :jefeId AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                          AND YEARWEEK(v.creado_en,1) = YEARWEEK(CURDATE(),1)
                        """, nativeQuery = true)
        long countVentasSemanaByJefe(@Param("jefeId") Long jefeId);

        @Query(value = """
                        SELECT COUNT(*) FROM venta v
                        INNER JOIN usuario asesor ON v.usuario_id = asesor.id
                        INNER JOIN usuario sup ON asesor.supervisor_id = sup.id
                        WHERE sup.supervisor_id = :jefeId AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                          AND YEAR(v.creado_en) = YEAR(CURDATE()) AND MONTH(v.creado_en) = MONTH(CURDATE())
                        """, nativeQuery = true)
        long countVentasMesByJefe(@Param("jefeId") Long jefeId);

        @Query(value = """
                        SELECT COUNT(*) FROM venta v
                        INNER JOIN usuario asesor ON v.usuario_id = asesor.id
                        INNER JOIN usuario sup ON asesor.supervisor_id = sup.id
                        WHERE sup.supervisor_id = :jefeId AND v.estado NOT IN ('CANCELADA','RECHAZADA') AND YEAR(v.creado_en) = :anio AND MONTH(v.creado_en) = :mes
                        """, nativeQuery = true)
        long countVentasByJefeAndPeriodo(@Param("jefeId") Long jefeId, @Param("anio") int anio, @Param("mes") int mes);

        @Query(value = """
                        SELECT
                            sup.id AS usuarioId,
                            sup.nombre AS nombre,
                            sup.apellido AS apellido,
                            COALESCE(SUM(CASE WHEN v.estado NOT IN ('CANCELADA','RECHAZADA') AND YEAR(v.creado_en) = YEAR(CURDATE()) AND MONTH(v.creado_en) = MONTH(CURDATE()) THEN 1 ELSE 0 END), 0) AS ventasMes,
                            COALESCE(SUM(CASE WHEN v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) = CURDATE() THEN 1 ELSE 0 END), 0) AS ventasHoy,
                            COUNT(DISTINCT asesor.id) AS totalAsesores
                        FROM usuario sup
                        INNER JOIN usuario asesor ON asesor.supervisor_id = sup.id AND asesor.rol = 'ASESOR' AND asesor.activo = true
                        LEFT JOIN venta v ON v.usuario_id = asesor.id
                        WHERE sup.supervisor_id = :jefeId AND sup.rol = 'SUPERVISOR' AND sup.activo = true
                        GROUP BY sup.id, sup.nombre, sup.apellido
                        ORDER BY ventasMes DESC
                        """, nativeQuery = true)
        List<SupervisorResumenProjection> findResumenSupervisoresByJefe(@Param("jefeId") Long jefeId);

        @Query(value = """
                        SELECT DATE(v.creado_en) AS fecha, COUNT(*) AS cantidad
                        FROM venta v
                        INNER JOIN usuario asesor ON v.usuario_id = asesor.id
                        INNER JOIN usuario sup ON asesor.supervisor_id = sup.id
                        WHERE sup.supervisor_id = :jefeId AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                          AND DATE(v.creado_en) BETWEEN :desde AND :hasta
                        GROUP BY DATE(v.creado_en)
                        ORDER BY fecha ASC
                        """, nativeQuery = true)
        List<VentasPorDiaProjection> findVentasPorDiaByJefeRango(
                        @Param("jefeId") Long jefeId,
                        @Param("desde") LocalDate desde,
                        @Param("hasta") LocalDate hasta);

        @Query(value = """
                        SELECT DATE(v.creado_en) AS fecha, v.origen AS nombre,
                               COUNT(*) AS cantidad,
                               ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY DATE(v.creado_en)), 2) AS porcentaje
                        FROM venta v
                        INNER JOIN usuario asesor ON v.usuario_id = asesor.id
                        INNER JOIN usuario sup ON asesor.supervisor_id = sup.id
                        WHERE sup.supervisor_id = :jefeId AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                          AND v.creado_en >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
                        GROUP BY DATE(v.creado_en), v.origen
                        ORDER BY fecha ASC
                        """, nativeQuery = true)
        List<SegmentoProjection> findOrigenVentasByJefe14Dias(@Param("jefeId") Long jefeId);

        // ═════════════════════════════════════════════════════════════════════
        // GERENTE / LIDER — queries con filtro dinámico (FIX 2)
        // Todos los filtros son opcionales: NULL = sin restricción.
        // ═════════════════════════════════════════════════════════════════════

        @Query(value = """
                        SELECT COUNT(*) FROM venta v WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) = CURDATE()
                        """, nativeQuery = true)
        long countVentasTotalesHoy();

        @Query(value = """
                        SELECT COUNT(*) FROM venta v WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND YEARWEEK(v.creado_en,1) = YEARWEEK(CURDATE(),1)
                        """, nativeQuery = true)
        long countVentasTotalesSemana();

        @Query(value = """
                        SELECT COUNT(*) FROM venta v WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND YEAR(v.creado_en) = :anio AND MONTH(v.creado_en) = :mes
                        """, nativeQuery = true)
        long countVentasTotalesByPeriodo(@Param("anio") int anio, @Param("mes") int mes);

        @Query(value = """
                        SELECT COUNT(*) FROM venta v
                        WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) BETWEEN :desde AND :hasta
                          AND (:centralId  IS NULL OR v.central_id  = :centralId)
                          AND (:productoId IS NULL OR v.producto_id = :productoId)
                          AND (:promoId    IS NULL OR v.promo_id    = :promoId)
                          AND (:origen     IS NULL OR v.origen      = :origen)
                        """, nativeQuery = true)
        long countVentasFiltradas(
                        @Param("desde") LocalDate desde,
                        @Param("hasta") LocalDate hasta,
                        @Param("centralId") Long centralId,
                        @Param("productoId") Long productoId,
                        @Param("promoId") Long promoId,
                        @Param("origen") String origen);

        @Query(value = """
                        SELECT DATE(v.creado_en) AS fecha, COUNT(*) AS cantidad
                        FROM venta v
                        WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) BETWEEN :desde AND :hasta
                          AND (:centralId  IS NULL OR v.central_id  = :centralId)
                          AND (:productoId IS NULL OR v.producto_id = :productoId)
                          AND (:promoId    IS NULL OR v.promo_id    = :promoId)
                          AND (:origen     IS NULL OR v.origen      = :origen)
                        GROUP BY DATE(v.creado_en)
                        ORDER BY fecha ASC
                        """, nativeQuery = true)
        List<VentasPorDiaProjection> findVentasPorDiaFiltrado(
                        @Param("desde") LocalDate desde,
                        @Param("hasta") LocalDate hasta,
                        @Param("centralId") Long centralId,
                        @Param("productoId") Long productoId,
                        @Param("promoId") Long promoId,
                        @Param("origen") String origen);

        @Query(value = """
                        SELECT c.nombre AS nombre, COUNT(v.id) AS cantidad,
                               ROUND(COUNT(v.id)*100.0/SUM(COUNT(v.id)) OVER(),2) AS porcentaje
                        FROM venta v INNER JOIN central c ON v.central_id = c.id
                        WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) BETWEEN :desde AND :hasta
                          AND (:productoId IS NULL OR v.producto_id = :productoId)
                          AND (:promoId    IS NULL OR v.promo_id    = :promoId)
                          AND (:origen     IS NULL OR v.origen      = :origen)
                        GROUP BY c.id, c.nombre ORDER BY cantidad DESC
                        """, nativeQuery = true)
        List<SegmentoProjection> findVentasPorCentralFiltrado(
                        @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta,
                        @Param("productoId") Long productoId, @Param("promoId") Long promoId,
                        @Param("origen") String origen);

        @Query(value = """
                        SELECT p.nombre AS nombre, COUNT(v.id) AS cantidad,
                               ROUND(COUNT(v.id)*100.0/SUM(COUNT(v.id)) OVER(),2) AS porcentaje
                        FROM venta v INNER JOIN producto p ON v.producto_id = p.id
                        WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) BETWEEN :desde AND :hasta
                          AND (:centralId IS NULL OR v.central_id = :centralId)
                          AND (:promoId   IS NULL OR v.promo_id   = :promoId)
                          AND (:origen    IS NULL OR v.origen     = :origen)
                        GROUP BY p.id, p.nombre ORDER BY cantidad DESC
                        """, nativeQuery = true)
        List<SegmentoProjection> findVentasPorProductoFiltrado(
                        @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta,
                        @Param("centralId") Long centralId, @Param("promoId") Long promoId,
                        @Param("origen") String origen);

        @Query(value = """
                        SELECT pr.nombre AS nombre, COUNT(v.id) AS cantidad,
                               ROUND(COUNT(v.id)*100.0/SUM(COUNT(v.id)) OVER(),2) AS porcentaje
                        FROM venta v INNER JOIN promo pr ON v.promo_id = pr.id
                        WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) BETWEEN :desde AND :hasta
                          AND (:centralId  IS NULL OR v.central_id  = :centralId)
                          AND (:productoId IS NULL OR v.producto_id = :productoId)
                          AND (:origen     IS NULL OR v.origen      = :origen)
                        GROUP BY pr.id, pr.nombre ORDER BY cantidad DESC
                        """, nativeQuery = true)
        List<SegmentoProjection> findVentasPorPromoFiltrado(
                        @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta,
                        @Param("centralId") Long centralId, @Param("productoId") Long productoId,
                        @Param("origen") String origen);

        @Query(value = """
                        SELECT v.contacto AS nombre, COUNT(*) AS cantidad,
                               ROUND(COUNT(*)*100.0/SUM(COUNT(*)) OVER(),2) AS porcentaje
                        FROM venta v
                        WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) BETWEEN :desde AND :hasta
                          AND (:centralId  IS NULL OR v.central_id  = :centralId)
                          AND (:productoId IS NULL OR v.producto_id = :productoId)
                          AND (:promoId    IS NULL OR v.promo_id    = :promoId)
                        GROUP BY v.contacto
                        """, nativeQuery = true)
        List<SegmentoProjection> findDistribucionTurnoFiltrado(
                        @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta,
                        @Param("centralId") Long centralId,
                        @Param("productoId") Long productoId,
                        @Param("promoId") Long promoId);

        @Query(value = """
                        SELECT
                            CAST(COALESCE(SUM(CASE WHEN p.debito_automatico = TRUE THEN 1 ELSE 0 END), 0) AS SIGNED) AS debitoAuto,
                            CAST(COUNT(v.id) AS SIGNED) AS total
                        FROM venta v LEFT JOIN pago p ON v.pago_id = p.id
                        WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) BETWEEN :desde AND :hasta
                          AND (:centralId  IS NULL OR v.central_id  = :centralId)
                          AND (:productoId IS NULL OR v.producto_id = :productoId)
                          AND (:promoId    IS NULL OR v.promo_id    = :promoId)
                        """, nativeQuery = true)
        StatsDebitoProjection findStatsDebitoFiltrado(
                        @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta,
                        @Param("centralId") Long centralId,
                        @Param("productoId") Long productoId,
                        @Param("promoId") Long promoId);

        @Query(value = """
                        SELECT
                            CASE
                                WHEN p.debito_automatico = true THEN 'Débito Automático'
                                ELSE CONCAT('Tarjeta ', p.tipo_tarjeta)
                            END AS nombre,
                            COUNT(*) AS cantidad,
                            ROUND(COUNT(*)*100.0/SUM(COUNT(*)) OVER(),2) AS porcentaje
                        FROM venta v INNER JOIN pago p ON v.pago_id = p.id
                        WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) BETWEEN :desde AND :hasta
                          AND (:centralId  IS NULL OR v.central_id  = :centralId)
                          AND (:productoId IS NULL OR v.producto_id = :productoId)
                          AND (:promoId    IS NULL OR v.promo_id    = :promoId)
                          AND (:origen     IS NULL OR v.origen      = :origen)
                        GROUP BY nombre ORDER BY cantidad DESC
                        """, nativeQuery = true)
        List<SegmentoProjection> findDistribucionMetodosPagoFiltrado(
                        @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta,
                        @Param("centralId") Long centralId,
                        @Param("productoId") Long productoId,
                        @Param("promoId") Long promoId,
                        @Param("origen") String origen);

        // ═════════════════════════════════════════════════════════════════════
        // ADMIN / COBRANZA
        // ═════════════════════════════════════════════════════════════════════

        @Query(value = """
                        SELECT COUNT(*) FROM venta v
                        WHERE v.estado NOT IN ('CANCELADA','RECHAZADA')
                          AND (v.observaciones IS NULL OR v.observaciones = '')
                          AND DATE(v.creado_en) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                        """, nativeQuery = true)
        long countVentasSinObservaciones();

        @Query(value = """
                        SELECT
                            CASE
                                WHEN p.debito_automatico = true THEN 'Débito Automático'
                                ELSE CONCAT('Tarjeta ', p.tipo_tarjeta)
                            END AS nombre,
                            COUNT(*) AS cantidad,
                            ROUND(COUNT(*)*100.0/SUM(COUNT(*)) OVER(),2) AS porcentaje
                        FROM venta v INNER JOIN pago p ON v.pago_id = p.id
                        WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND YEAR(v.creado_en) = YEAR(CURDATE()) AND MONTH(v.creado_en) = MONTH(CURDATE())
                        GROUP BY nombre ORDER BY cantidad DESC
                        """, nativeQuery = true)
        List<SegmentoProjection> findDistribucionMetodosPago();

        @Query(value = """
                        SELECT DATE(v.creado_en) AS fecha, COUNT(*) AS cantidad
                        FROM venta v
                        WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND YEAR(v.creado_en) = YEAR(CURDATE()) AND MONTH(v.creado_en) = MONTH(CURDATE())
                        GROUP BY DATE(v.creado_en) ORDER BY fecha ASC
                        """, nativeQuery = true)
        List<VentasPorDiaProjection> findVentasPorDiaMesActual();

        @Query(value = """
                        SELECT v.usuario_id AS usuarioId, COUNT(*) AS cantidad
                        FROM venta v
                        WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND v.usuario_id IN :ids
                          AND YEAR(v.creado_en) = YEAR(CURDATE()) AND MONTH(v.creado_en) = MONTH(CURDATE())
                        GROUP BY v.usuario_id
                        """, nativeQuery = true)
        List<UsuarioVentaCountProjection> findVentasMesBatch(@Param("ids") List<Long> usuarioIds);

        // ═════════════════════════════════════════════════════════════════════
        // ORIGEN POR DÍA — con OrigenPorDiaProjection (reemplaza SegmentoProjection)
        // FIX: buildOrigenTendencia() puede ahora implementarse completo
        // ═════════════════════════════════════════════════════════════════════

        @Query(value = """
                        SELECT DATE(v.creado_en) AS fecha, v.origen AS origen, COUNT(*) AS cantidad
                        FROM venta v
                        INNER JOIN usuario asesor ON v.usuario_id = asesor.id
                        INNER JOIN usuario sup    ON asesor.supervisor_id = sup.id
                        WHERE sup.supervisor_id = :jefeId AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                          AND v.creado_en >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
                        GROUP BY DATE(v.creado_en), v.origen
                        ORDER BY fecha ASC, v.origen ASC
                        """, nativeQuery = true)
        List<OrigenPorDiaProjection> findOrigenVentasByJefe14DiasV2(@Param("jefeId") Long jefeId);

        @Query(value = """
                        SELECT DATE(v.creado_en) AS fecha, v.origen AS origen, COUNT(*) AS cantidad
                        FROM venta v
                        WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND v.creado_en >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
                          AND (:centralId  IS NULL OR v.central_id  = :centralId)
                          AND (:productoId IS NULL OR v.producto_id = :productoId)
                        GROUP BY DATE(v.creado_en), v.origen
                        ORDER BY fecha ASC, v.origen ASC
                        """, nativeQuery = true)
        List<OrigenPorDiaProjection> findOrigenVentasGlobal14Dias(
                        @Param("centralId") Long centralId,
                        @Param("productoId") Long productoId);

        // ═════════════════════════════════════════════════════════════════════
        // KPIs HOY / SEMANA FILTRADOS — FIX 3: coherencia total en GERENTE/LIDER
        // ═════════════════════════════════════════════════════════════════════

        @Query(value = """
                        SELECT COUNT(*) FROM venta v
                        WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) = CURDATE()
                          AND (:centralId  IS NULL OR v.central_id  = :centralId)
                          AND (:productoId IS NULL OR v.producto_id = :productoId)
                          AND (:promoId    IS NULL OR v.promo_id    = :promoId)
                          AND (:origen     IS NULL OR v.origen      = :origen)
                        """, nativeQuery = true)
        long countVentasHoyFiltradas(
                        @Param("centralId") Long centralId,
                        @Param("productoId") Long productoId,
                        @Param("promoId") Long promoId,
                        @Param("origen") String origen);

        @Query(value = """
                        SELECT COUNT(*) FROM venta v
                        WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND YEARWEEK(v.creado_en, 1) = YEARWEEK(CURDATE(), 1)
                          AND (:centralId  IS NULL OR v.central_id  = :centralId)
                          AND (:productoId IS NULL OR v.producto_id = :productoId)
                          AND (:promoId    IS NULL OR v.promo_id    = :promoId)
                          AND (:origen     IS NULL OR v.origen      = :origen)
                        """, nativeQuery = true)
        long countVentasSemananaFiltradas(
                        @Param("centralId") Long centralId,
                        @Param("productoId") Long productoId,
                        @Param("promoId") Long promoId,
                        @Param("origen") String origen);

        // ═════════════════════════════════════════════════════════════════════
        // MEJOR SEMANA DEL ASESOR — FIX 5: comparativa "tu mejor semana"
        // ═════════════════════════════════════════════════════════════════════

        @Query(value = """
                        SELECT COALESCE(MAX(cnt), 0) FROM (
                            SELECT COUNT(*) AS cnt FROM venta v
                            WHERE v.usuario_id = :uid AND v.estado NOT IN ('CANCELADA','RECHAZADA')
                              AND YEARWEEK(v.creado_en, 1) != YEARWEEK(CURDATE(), 1)
                            GROUP BY YEARWEEK(v.creado_en, 1)
                        ) sub
                        """, nativeQuery = true)
        long findMejorSemanaPreviaByUsuario(@Param("uid") Long usuarioId);

        @Query(value = """
                        SELECT prov.nombre AS nombre,
                               COUNT(v.id) AS cantidad,
                               ROUND(COUNT(v.id) * 100.0 / SUM(COUNT(v.id)) OVER (), 2) AS porcentaje
                        FROM venta v
                        JOIN cliente c   ON v.cliente_id   = c.id
                        JOIN domicilio d  ON c.domicilio_id = d.id
                        JOIN provincia prov ON d.provincia_id = prov.id
                        WHERE v.estado NOT IN ('CANCELADA','RECHAZADA') AND DATE(v.creado_en) BETWEEN :desde AND :hasta
                          AND (:centralId  IS NULL OR v.central_id   = :centralId)
                          AND (:productoId IS NULL OR v.producto_id  = :productoId)
                          AND (:promoId    IS NULL OR v.promo_id     = :promoId)
                          AND (:origen     IS NULL OR v.origen       = :origen)
                        GROUP BY prov.id, prov.nombre
                        ORDER BY cantidad DESC
                        """, nativeQuery = true)
        List<SegmentoProjection> findVentasPorProvinciaFiltrado(
                        @Param("desde") LocalDate desde,
                        @Param("hasta") LocalDate hasta,
                        @Param("centralId") Long centralId,
                        @Param("productoId") Long productoId,
                        @Param("promoId") Long promoId,
                        @Param("origen") String origen);

        // ═════════════════════════════════════════════════════════════════════
        // MAPA — ventas con coordenadas válidas
        // ═════════════════════════════════════════════════════════════════════

        @Query(value = """
                        SELECT v.id           AS id,
                               c.nombre       AS clienteNombre,
                               CONCAT(u.nombre, ' ', u.apellido) AS asesorNombre,
                               pr.nombre      AS productoNombre,
                               cen.nombre     AS centralNombre,
                               v.estado       AS estado,
                               d.coordenadas  AS coordenadas,
                               d.localidad    AS localidad,
                               prov.nombre    AS provincia
                        FROM venta v
                        JOIN cliente c         ON v.cliente_id   = c.id
                        JOIN domicilio d        ON c.domicilio_id  = d.id
                        LEFT JOIN provincia prov ON d.provincia_id  = prov.id
                        JOIN producto pr        ON v.producto_id   = pr.id
                        JOIN central cen        ON v.central_id    = cen.id
                        JOIN usuario u          ON v.usuario_id    = u.id
                          AND d.coordenadas IS NOT NULL
                          AND d.coordenadas != ''
                          AND (:desde IS NULL OR DATE(v.creado_en) >= :desde)
                          AND (:hasta IS NULL OR DATE(v.creado_en) <= :hasta)
                        ORDER BY v.creado_en DESC
                        """, nativeQuery = true)
        List<VentaMapaProjection> findVentasConCoordenadas(
                        @Param("desde") LocalDate desde,
                        @Param("hasta") LocalDate hasta);
}
