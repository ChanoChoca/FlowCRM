package com.flashpage.app.dashboard.controller;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flashpage.app.dashboard.dto.DesafioDTOs.DesafioCardResponse;
import com.flashpage.app.dashboard.dto.DesafioDTOs.DesafioRequest;
import com.flashpage.app.dashboard.dto.DesafioDTOs.DesafioResponse;
import com.flashpage.app.dashboard.service.DesafioService;
import com.flashpage.app.shared.exception.UnauthorizedException;
import com.flashpage.app.usuario.model.Usuario;

@RestController
@RequestMapping("/api/desafios")
public class DesafioController {

    private final DesafioService desafioService;

    public DesafioController(DesafioService desafioService) {
        this.desafioService = desafioService;
    }

    @GetMapping("/activo")
    @PreAuthorize("hasAnyRole('ASESOR','SUPERVISOR')")
    public ResponseEntity<DesafioCardResponse> getDesafioActivoCard(@AuthenticationPrincipal Usuario usuario) {
        Long supervisorId = resolverSupervisorId(usuario);
        DesafioCardResponse card = desafioService.getDesafioActivoCard(supervisorId);
        return card != null ? ResponseEntity.ok(card) : ResponseEntity.noContent().build();
    }

    @GetMapping("/activo/detalle")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<DesafioResponse> getDesafioActivoDetalle(@AuthenticationPrincipal Usuario supervisor) {
        DesafioResponse detalle = desafioService.getDesafioActivo(supervisor.getId());
        return detalle != null ? ResponseEntity.ok(detalle) : ResponseEntity.noContent().build();
    }

    @GetMapping("/historial")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<List<DesafioResponse>> getHistorial(@AuthenticationPrincipal Usuario supervisor) {
        return ResponseEntity.ok(desafioService.getHistorial(supervisor.getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<DesafioResponse> crear(@AuthenticationPrincipal Usuario supervisor, @Valid @RequestBody DesafioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(desafioService.crear(supervisor, request));
    }

    @PutMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<DesafioResponse> cancelar(@PathVariable Long id, @AuthenticationPrincipal Usuario supervisor) {
        return ResponseEntity.ok(desafioService.cancelar(id, supervisor));
    }

    private Long resolverSupervisorId(Usuario usuario) {
        return switch (usuario.getRol()) {
            case SUPERVISOR -> usuario.getId();
            case ASESOR -> usuario.getSupervisor() != null ? usuario.getSupervisor().getId() : null;
            default -> throw new UnauthorizedException("Rol no permitido para ver desafíos.");
        };
    }
}
