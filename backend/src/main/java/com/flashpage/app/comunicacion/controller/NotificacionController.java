package com.flashpage.app.comunicacion.controller;

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

import com.flashpage.app.comunicacion.dto.NotificacionResponse;
import com.flashpage.app.comunicacion.service.NotificacionService;
import com.flashpage.app.usuario.model.Usuario;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal Usuario usuario) {
        return notificacionService.subscribe(usuario.getId());
    }

    @GetMapping
    public List<NotificacionResponse> listar(@AuthenticationPrincipal Usuario usuario) {
        return notificacionService.listar(usuario.getId());
    }

    @GetMapping("/no-leidas")
    public ResponseEntity<Long> contarNoLeidas(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(notificacionService.contarNoLeidas(usuario.getId()));
    }

    @PatchMapping("/{id}/leida")
    public NotificacionResponse marcarLeida(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        return notificacionService.marcarLeida(id, usuario.getId());
    }

    @PatchMapping("/todas-leidas")
    public ResponseEntity<Void> marcarTodasLeidas(@AuthenticationPrincipal Usuario usuario) {
        notificacionService.marcarTodasLeidas(usuario.getId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        notificacionService.eliminar(id, usuario.getId());
        return ResponseEntity.noContent().build();
    }
}
