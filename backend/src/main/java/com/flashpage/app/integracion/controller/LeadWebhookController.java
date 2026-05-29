package com.flashpage.app.integracion.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flashpage.app.integracion.dto.LeadWebhookRequest;
import com.flashpage.app.integracion.service.LeadWebhookService;

@RestController
@RequestMapping("/api/leads")
public class LeadWebhookController {

    private final LeadWebhookService leadWebhookService;

    public LeadWebhookController(LeadWebhookService leadWebhookService) {
        this.leadWebhookService = leadWebhookService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<Long> recibirLead(@RequestBody LeadWebhookRequest req) {
        Long id = leadWebhookService.registrarLead(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(id);
    }
}
