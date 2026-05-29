package com.flashpage.app.venta.repository;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;

import com.flashpage.app.venta.model.EstadoVenta;
import com.flashpage.app.venta.model.Origen;
import com.flashpage.app.venta.model.Venta;

public final class VentaSpecification {

    private VentaSpecification() {}

    public static Specification<Venta> activa() {
        return (root, query, cb) -> cb.not(root.get("estado").in(EstadoVenta.CANCELADA, EstadoVenta.RECHAZADA));
    }

    public static Specification<Venta> estado(EstadoVenta estado) {
        return (root, query, cb) -> cb.equal(root.get("estado"), estado);
    }

    public static Specification<Venta> clienteNombreContains(String nombre) {
        return (root, query, cb) -> cb.like(cb.lower(root.get("cliente").get("nombre")),
                "%" + nombre.toLowerCase() + "%");
    }

    public static Specification<Venta> asesorId(Long asesorId) {
        return (root, query, cb) -> cb.equal(root.get("asesor").get("id"), asesorId);
    }

    public static Specification<Venta> supervisorId(Long supervisorId) {
        return (root, query, cb) -> cb.equal(root.get("asesor").get("supervisor").get("id"), supervisorId);
    }

    public static Specification<Venta> jefeDeSupervisorId(Long jefeDeSupervisorId) {
        return (root, query, cb) -> cb.equal(
                root.get("asesor").get("supervisor").get("supervisor").get("id"), jefeDeSupervisorId);
    }

    public static Specification<Venta> origen(Origen origen) {
        return (root, query, cb) -> cb.equal(root.get("origen"), origen);
    }

    public static Specification<Venta> creadoDesde(LocalDate desde) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("creadoEn"), desde.atStartOfDay());
    }

    public static Specification<Venta> creadoHasta(LocalDate hasta) {
        return (root, query, cb) -> cb.lessThan(root.get("creadoEn"), hasta.plusDays(1).atStartOfDay());
    }
}
