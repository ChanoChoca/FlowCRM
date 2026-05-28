package com.flashpage.app.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.flashpage.app.model.EstadoTicket;
import com.flashpage.app.model.Usuario;
import com.flashpage.app.model.dto.CreateTicketRequest;
import com.flashpage.app.model.dto.TicketMensajeRequest;
import com.flashpage.app.model.dto.TicketResponse;
import com.flashpage.app.service.TicketService;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService service;

    public TicketController(TicketService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> crear(
            @RequestBody CreateTicketRequest req,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(req, usuario));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> listar(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.listar(usuario));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> obtener(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.obtener(id, usuario));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<TicketResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestParam EstadoTicket estado,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.cambiarEstado(id, estado, usuario));
    }

    @PostMapping("/{id}/mensajes")
    public ResponseEntity<TicketResponse> responder(
            @PathVariable Long id,
            @RequestBody TicketMensajeRequest req,
            @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.responder(id, req, usuario));
    }
}
