package com.flashpage.app.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.flashpage.app.model.Usuario;
import com.flashpage.app.model.dto.NotificacionResponse;
import com.flashpage.app.service.NotificacionService;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService service;

    public NotificacionController(NotificacionService service) {
        this.service = service;
    }

    /** SSE stream: el frontend se conecta aquí para recibir notificaciones en tiempo real. */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal Usuario usuario) {
        return service.subscribe(usuario.getId());
    }

    @GetMapping
    public ResponseEntity<List<NotificacionResponse>> listar(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.listar(usuario.getId()));
    }

    @GetMapping("/no-leidas")
    public ResponseEntity<Long> contarNoLeidas(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.contarNoLeidas(usuario.getId()));
    }

    @PatchMapping("/{id}/leer")
    public ResponseEntity<NotificacionResponse> marcarLeida(
            @PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.marcarLeida(id, usuario.getId()));
    }

    @PatchMapping("/leer-todas")
    public ResponseEntity<Void> marcarTodasLeidas(@AuthenticationPrincipal Usuario usuario) {
        service.marcarTodasLeidas(usuario.getId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        service.eliminar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }
}
