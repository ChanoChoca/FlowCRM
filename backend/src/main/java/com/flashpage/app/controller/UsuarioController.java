package com.flashpage.app.controller;

import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.flashpage.app.model.Rol;
import com.flashpage.app.model.Usuario;
import com.flashpage.app.model.dto.AsesorOptionResponse;
import com.flashpage.app.model.dto.CreateUsuarioRequest;
import com.flashpage.app.model.dto.PageResponse;
import com.flashpage.app.model.dto.UsuarioDetalleResponse;
import com.flashpage.app.model.dto.UsuarioResponse;
import com.flashpage.app.model.dto.UsuarioSupervisorResponse;
import com.flashpage.app.repository.UsuarioSpecification;
import com.flashpage.app.service.AuthService;
import com.flashpage.app.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuthService authService;

    public UsuarioController(UsuarioService usuarioService, AuthService authService) {
        this.usuarioService = usuarioService;
        this.authService = authService;
    }

    @GetMapping
    public PageResponse<UsuarioResponse> obtener(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String apellido,
            @RequestParam(required = false) String dni,
            @RequestParam(required = false) Rol rol,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) Long supervisorId) {

        Specification<Usuario> spec = Specification.where(
                (root, query, cb) -> cb.conjunction());

        if (q != null && !q.isBlank())
            spec = spec.and(UsuarioSpecification.busqueda(q));
        if (nombre != null && !nombre.isBlank())
            spec = spec.and(UsuarioSpecification.nombreContains(nombre));
        if (apellido != null && !apellido.isBlank())
            spec = spec.and(UsuarioSpecification.apellidoContains(apellido));
        if (dni != null && !dni.isBlank())
            spec = spec.and(UsuarioSpecification.dniContains(dni));
        if (rol != null)
            spec = spec.and(UsuarioSpecification.rol(rol));
        if (activo != null)
            spec = spec.and(UsuarioSpecification.activo(activo));
        if (supervisorId != null)
            spec = spec.and(UsuarioSpecification.supervisorId(supervisorId));

        return PageResponse.from(usuarioService.obtener(spec, page, size));
    }

    @GetMapping("/{id}")
    public UsuarioDetalleResponse obtenerDetalle(@PathVariable Long id) {
        return usuarioService.obtenerDetalle(id);
    }

    @GetMapping("/supervisores")
    public List<UsuarioSupervisorResponse> obtenerSupervisores() {
        return usuarioService.obtenerSupervisores();
    }

    @GetMapping("/jefes-de-supervisor")
    public List<UsuarioSupervisorResponse> obtenerJefesDeSupervisor() {
        return usuarioService.obtenerJefesDeSupervisor();
    }

    @GetMapping("/asesores")
    public List<AsesorOptionResponse> obtenerAsesores(
            @RequestParam(required = false) Long supervisorId) {
        return usuarioService.obtenerAsesores(supervisorId);
    }

    @GetMapping("/mis-asesores")
    public List<UsuarioSupervisorResponse> obtenerMisAsesores(@AuthenticationPrincipal Usuario currentUser) {
        return usuarioService.obtenerAsesoresDeSupervisor(currentUser.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void crear(@RequestBody CreateUsuarioRequest req,
            @AuthenticationPrincipal Usuario currentUser) {
        usuarioService.crear(req, currentUser);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Void> modificar(
            @PathVariable Long id,
            @RequestBody UsuarioDetalleResponse req,
            @AuthenticationPrincipal Usuario currentUser) {

        String dniAnterior = currentUser != null ? currentUser.getDni() : null;
        usuarioService.modificar(id, req);

        boolean esAutoEdicion = currentUser != null && currentUser.getId().equals(id);
        boolean dniCambio = esAutoEdicion && req.dni() != null
                && !req.dni().equals(dniAnterior);

        if (dniCambio) {
            ResponseCookie cookie = authService.createRefreshCookie(req.dni(), currentUser.getRol().name());
            return ResponseEntity.noContent()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .build();
        }

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activar(@PathVariable Long id) {
        usuarioService.activar(id);
    }

    @PatchMapping("/{id}/desactivar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivar(@PathVariable Long id) {
        usuarioService.desactivar(id);
    }
}