package com.flashpage.app.integracion.dto;

import com.flashpage.app.venta.model.Origen;

public record LeadWebhookRequest(String nombreCompleto, String telefono, Origen origen, String servicioDeseado) {}
