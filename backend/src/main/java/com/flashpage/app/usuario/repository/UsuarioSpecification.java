package com.flashpage.app.usuario.repository;

import org.springframework.data.jpa.domain.Specification;

import com.flashpage.app.usuario.model.Rol;
import com.flashpage.app.usuario.model.Usuario;

public final class UsuarioSpecification {

    private UsuarioSpecification() {
    }

    public static Specification<Usuario> nombreContains(String nombre) {
        return (root, query, cb) -> cb.like(cb.lower(root.get("nombre")), "%" + nombre.toLowerCase() + "%");
    }

    public static Specification<Usuario> apellidoContains(String apellido) {
        return (root, query, cb) -> cb.like(cb.lower(root.get("apellido")), "%" + apellido.toLowerCase() + "%");
    }

    public static Specification<Usuario> dniContains(String dni) {
        return (root, query, cb) -> cb.like(root.get("dni"), "%" + dni + "%");
    }

    public static Specification<Usuario> rol(Rol rol) {
        return (root, query, cb) -> cb.equal(root.get("rol"), rol);
    }

    public static Specification<Usuario> activo(Boolean activo) {
        return (root, query, cb) -> cb.equal(root.get("activo"), activo);
    }

    public static Specification<Usuario> supervisorId(Long supervisorId) {
        return (root, query, cb) -> cb.equal(root.get("supervisor").get("id"), supervisorId);
    }

    public static Specification<Usuario> busqueda(String q) {
        String pattern = "%" + q.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("nombre")), pattern),
                cb.like(cb.lower(root.get("apellido")), pattern),
                cb.like(root.get("dni"), "%" + q + "%"),
                cb.like(cb.lower(root.get("telefono")), pattern));
    }
}
