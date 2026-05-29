package com.flashpage.app.dashboard.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.flashpage.app.dashboard.model.MetaMensual;

public interface MetaMensualRepository extends JpaRepository<MetaMensual, Long> {

    Optional<MetaMensual> findByUsuarioIdAndAnioAndMes(Long usuarioId, int anio, int mes);

    @Query("SELECT m FROM MetaMensual m WHERE m.usuario.supervisor.id = :supervisorId AND m.anio = :anio AND m.mes = :mes")
    List<MetaMensual> findByEquipoSupervisorAndPeriodo(@Param("supervisorId") Long supervisorId,
            @Param("anio") int anio, @Param("mes") int mes);

    @Query(value = "SELECT COALESCE(SUM(m.cantidad), 0) FROM meta_mensual m WHERE m.anio = :anio AND m.mes = :mes", nativeQuery = true)
    long sumCantidadByAnioAndMes(@Param("anio") int anio, @Param("mes") int mes);

    @Query(value = """
            SELECT COALESCE(SUM(m.cantidad), 0)
            FROM meta_mensual m
            INNER JOIN usuario u ON m.usuario_id = u.id
            WHERE u.supervisor_id = :supervisorId
            AND m.anio = :anio AND m.mes = :mes
            """, nativeQuery = true)
    int sumMetaEquipo(@Param("supervisorId") Long supervisorId, @Param("anio") int anio, @Param("mes") int mes);
}
