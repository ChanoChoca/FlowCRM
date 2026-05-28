package com.flashpage.app.controller;

import java.util.Map;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flashpage.app.model.dto.LeadWebhookRequest;
import com.flashpage.app.service.LeadWebhookService;

/**
 * Webhook público para ingesta de leads externos (landing, Meta Ads, Google Ads).
 * No requiere autenticación JWT.
 */
@RestController
@RequestMapping("/api/leads")
public class LeadWebhookController {

    private final LeadWebhookService leadService;

    public LeadWebhookController(LeadWebhookService leadService) {
        this.leadService = leadService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> recibirLead(@Valid @RequestBody LeadWebhookRequest req) {
        Long gestionId = leadService.registrarLead(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("ok", true, "gestionId", gestionId));
    }
}
