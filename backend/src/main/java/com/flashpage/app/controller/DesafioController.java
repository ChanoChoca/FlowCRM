package com.flashpage.app.controller;


import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.flashpage.app.exception.UnauthorizedException;
import com.flashpage.app.model.Usuario;
import com.flashpage.app.model.dto.dashboard.DesafioDTOs.DesafioCardResponse;
import com.flashpage.app.model.dto.dashboard.DesafioDTOs.DesafioRequest;
import com.flashpage.app.model.dto.dashboard.DesafioDTOs.DesafioResponse;
import com.flashpage.app.service.DesafioService;

import java.util.List;
 
/**
 * Endpoints del módulo de Desafíos de Equipo.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ GET  /api/desafios/activo          → tarjeta del desafío activo    │
 * │ GET  /api/desafios/activo/detalle  → detalle completo (SUPERVISOR) │
 * │ GET  /api/desafios/historial       → historial del equipo           │
 * │ POST /api/desafios                 → crear desafío (SUPERVISOR)     │
 * │ PUT  /api/desafios/{id}/cancelar   → cancelar (SUPERVISOR)          │
 * └─────────────────────────────────────────────────────────────────────┘
 */
@RestController
@RequestMapping("/api/desafios")
public class DesafioController {
 
    private final DesafioService desafioService;

    public DesafioController(DesafioService desafioService) {
        this.desafioService = desafioService;
    }
 
    /**
     * Card liviana del desafío activo.
     * La usan ASESOR (ve el desafío de su equipo) y SUPERVISOR.
     * El asesor pasa su supervisor como referencia; el supervisor usa su propio id.
     */
    @GetMapping("/activo")
    @PreAuthorize("hasAnyRole('ASESOR','SUPERVISOR')")
    public ResponseEntity<DesafioCardResponse> getDesafioActivoCard(
            @AuthenticationPrincipal Usuario usuario) {
 
        Long supervisorId = resolverSupervisorId(usuario);
        DesafioCardResponse card = desafioService.getDesafioActivoCard(supervisorId);
 
        return card != null
                ? ResponseEntity.ok(card)
                : ResponseEntity.noContent().build();
    }
 
    /**
     * Detalle completo del desafío activo — solo SUPERVISOR.
     */
    @GetMapping("/activo/detalle")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<DesafioResponse> getDesafioActivoDetalle(
            @AuthenticationPrincipal Usuario supervisor) {
 
        DesafioResponse detalle = desafioService.getDesafioActivo(supervisor.getId());
        return detalle != null
                ? ResponseEntity.ok(detalle)
                : ResponseEntity.noContent().build();
    }
 
    /**
     * Historial de desafíos del equipo — solo SUPERVISOR.
     */
    @GetMapping("/historial")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<List<DesafioResponse>> getHistorial(
            @AuthenticationPrincipal Usuario supervisor) {
        return ResponseEntity.ok(desafioService.getHistorial(supervisor.getId()));
    }
 
    /**
     * Crear un nuevo desafío para el equipo.
     * Solo puede existir 1 desafío ACTIVO por equipo.
     */
    @PostMapping
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<DesafioResponse> crear(
            @AuthenticationPrincipal Usuario supervisor,
            @Valid @RequestBody DesafioRequest request) {
 
        DesafioResponse creado = desafioService.crear(supervisor, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }
 
    /**
     * Cancelar un desafío activo.
     */
    @PutMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<DesafioResponse> cancelar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario supervisor) {
 
        return ResponseEntity.ok(desafioService.cancelar(id, supervisor));
    }
 
    // ─── Helper ───────────────────────────────────────────────────────────
 
    /**
     * Resuelve el supervisorId correcto según el rol del usuario:
     * - SUPERVISOR → su propio ID
     * - ASESOR     → el ID de su supervisor (para ver el desafío de su equipo)
     */
    private Long resolverSupervisorId(Usuario usuario) {
        return switch (usuario.getRol()) {
            case SUPERVISOR -> usuario.getId();
            case ASESOR     -> usuario.getSupervisor() != null
                    ? usuario.getSupervisor().getId()
                    : null;
            default -> throw new UnauthorizedException("Rol no permitido para ver desafíos.");
        };
    }
}
