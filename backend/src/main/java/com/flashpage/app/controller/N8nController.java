package com.flashpage.app.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flashpage.app.model.Usuario;
import com.flashpage.app.model.dto.ChatRequest;
import com.flashpage.app.service.N8nService;

@RestController
@RequestMapping("/api/chat")
public class N8nController {
    private final N8nService n8nService;

    public N8nController(N8nService n8nService) {
        this.n8nService = n8nService;
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody ChatRequest request, @AuthenticationPrincipal Usuario usuario) {

        Map<String, Object> response = n8nService.sendMessageToN8N(
                request.getMessage(),
                usuario.getNombre(),
                usuario.getRol().name());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@AuthenticationPrincipal Usuario usuario) {

        // Solo mandamos el Nombre. n8n se encarga de armar el sessionId
        List<Map<String, Object>> history = n8nService.getChatHistory(usuario.getNombre());

        return ResponseEntity.ok(history);
    }
}