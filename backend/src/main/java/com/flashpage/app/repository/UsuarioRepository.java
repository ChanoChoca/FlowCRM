package com.flashpage.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.flashpage.app.model.Rol;
import com.flashpage.app.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long>, JpaSpecificationExecutor<Usuario> {

  Optional<Usuario> findByDni(String dni);

  Optional<Usuario> findByGoogleId(String googleId);

  boolean existsByDni(String dni);

  List<Usuario> findByRol(Rol rol);

  List<Usuario> findByRolAndActivoTrue(Rol rol);

  long countByActivoTrue();

  @Query("SELECT COUNT(u) FROM Usuario u WHERE u.supervisor.id = :supId AND u.rol = Rol.ASESOR AND u.activo = true")
  long countAsesorActivosBySuper(@Param("supId") Long supervisorId);

  @Query("SELECT COUNT(u) FROM Usuario u WHERE u.supervisor.id = :supId AND u.activo = true")
  long countSubordinadosActivos(@Param("supId") Long supervisorId);

  @Query("SELECT u FROM Usuario u WHERE u.supervisor.id = :supId AND u.rol = Rol.ASESOR AND u.activo = true")
  List<Usuario> findAsesoresActivosBySuper(@Param("supId") Long supervisorId);

  List<Usuario> findByActivoTrue();

  @Query("SELECT u FROM Usuario u WHERE u.activo = true ORDER BY u.rol ASC, u.apellido ASC")
  List<Usuario> findAllActivos();

  @Query("SELECT u FROM Usuario u WHERE u.activo = true ORDER BY u.rol ASC, u.apellido ASC")
  Page<Usuario> findAllActivos(Pageable pageable);

  Page<Usuario> findByActivoTrue(Pageable pageable);

  @Query("SELECT u FROM Usuario u WHERE u.rol = com.flashpage.app.model.Rol.ASESOR AND u.activo = true")
  Page<Usuario> findAsesoresActivos(Pageable pageable);

  @Query(value = """
      SELECT u.* FROM usuario u
      LEFT JOIN (
          SELECT v.usuario_id, COUNT(*) AS ventas_mes
          FROM venta v
          WHERE YEAR(v.creado_en) = YEAR(CURDATE()) AND MONTH(v.creado_en) = MONTH(CURDATE())
          GROUP BY v.usuario_id
      ) vm ON vm.usuario_id = u.id
      WHERE u.rol = 'ASESOR' AND u.activo = true
      ORDER BY COALESCE(vm.ventas_mes, 0) DESC, u.apellido ASC
      """,
      countQuery = """
      SELECT COUNT(*) FROM usuario u WHERE u.rol = 'ASESOR' AND u.activo = true
      """,
      nativeQuery = true)
  Page<Usuario> findAsesoresActivosOrderByVentasMesDesc(Pageable pageable);

  @Query(value = """
      SELECT u.* FROM usuario u
      LEFT JOIN (
          SELECT v.usuario_id, COUNT(*) AS ventas_mes
          FROM venta v
          WHERE YEAR(v.creado_en) = YEAR(CURDATE()) AND MONTH(v.creado_en) = MONTH(CURDATE())
          GROUP BY v.usuario_id
      ) vm ON vm.usuario_id = u.id
      WHERE u.rol = 'ASESOR' AND u.activo = true
      ORDER BY COALESCE(vm.ventas_mes, 0) ASC, u.apellido ASC
      """,
      countQuery = """
      SELECT COUNT(*) FROM usuario u WHERE u.rol = 'ASESOR' AND u.activo = true
      """,
      nativeQuery = true)
  Page<Usuario> findAsesoresActivosOrderByVentasMesAsc(Pageable pageable);

  long countByActivoFalse();

  @Query(value = "SELECT COUNT(*) FROM usuario u WHERE u.activo = true AND u.ultimo_login >= DATE_SUB(NOW(), INTERVAL :dias DAY)", nativeQuery = true)
  long countActivosEnUltimosDias(@Param("dias") int dias);

  @Query(value = "SELECT COUNT(*) FROM usuario u WHERE u.activo = true AND (u.ultimo_login IS NULL OR u.ultimo_login < DATE_SUB(NOW(), INTERVAL :dias DAY))", nativeQuery = true)
  long countSinLoginEnDias(@Param("dias") int dias);

  @Query(value = "SELECT COUNT(*) FROM usuario u WHERE YEAR(u.creado_en) = YEAR(CURDATE()) AND MONTH(u.creado_en) = MONTH(CURDATE())", nativeQuery = true)
  long countAltasEsteMes();

  @Query(value = """
      SELECT COUNT(*) FROM usuario u
      WHERE u.activo = false
        AND YEAR(u.actualizado_en) = YEAR(CURDATE())
        AND MONTH(u.actualizado_en) = MONTH(CURDATE())
      """, nativeQuery = true)
  long countBajasEsteMes();

  @Query(value = """
      SELECT COUNT(*) FROM usuario u
      WHERE u.activo = true
        AND (u.dni IS NULL OR u.telefono IS NULL OR u.nombre IS NULL OR u.apellido IS NULL)
      """, nativeQuery = true)
  long countUsuariosIncompletos();

  @Query("SELECT u.rankingOptActivo FROM Usuario u WHERE u.id = :uid")
  Boolean findRankingPreferenceByUsuarioId(@Param("uid") Long usuarioId);

  @Modifying
  @Query("UPDATE Usuario u SET u.rankingOptActivo = :activo WHERE u.id = :uid")
  void updateRankingPreference(@Param("uid") Long usuarioId, @Param("activo") boolean activo);

  @Query("SELECT COUNT(u) FROM Usuario u WHERE u.rol = Rol.ASESOR AND u.activo = true")
  long countAsesoresActivos();

  @Query("SELECT u FROM Usuario u WHERE u.activo = true AND (u.rol = Rol.LIDER OR u.rol = Rol.GERENTE) ORDER BY u.rol DESC, u.id ASC")
  List<Usuario> findAprobadores();

  Optional<Usuario> findFirstByPlazaUsernameStartingWithIgnoreCaseAndActivoTrue(String prefix);
}