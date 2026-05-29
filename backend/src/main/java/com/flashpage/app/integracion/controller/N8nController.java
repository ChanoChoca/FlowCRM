package com.flashpage.app.integracion.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flashpage.app.integracion.dto.ChatRequest;
import com.flashpage.app.integracion.service.N8nService;
import com.flashpage.app.usuario.model.Usuario;

@RestController
@RequestMapping("/api/n8n")
public class N8nController {

    private final N8nService n8nService;

    public N8nController(N8nService n8nService) {
        this.n8nService = n8nService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody ChatRequest req, @AuthenticationPrincipal Usuario usuario) {
        String nombre = usuario.getNombre() + " " + usuario.getApellido();
        Map<String, Object> response = n8nService.sendMessageToN8N(req.mensaje(), nombre, usuario.getRol().name());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/chat/historial")
    public ResponseEntity<List<Map<String, Object>>> historial(@AuthenticationPrincipal Usuario usuario) {
        String nombre = usuario.getNombre() + " " + usuario.getApellido();
        return ResponseEntity.ok(n8nService.getChatHistory(nombre));
    }
}
