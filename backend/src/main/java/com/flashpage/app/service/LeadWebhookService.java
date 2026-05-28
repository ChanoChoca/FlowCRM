package com.flashpage.app.service;

import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flashpage.app.model.Rol;
import com.flashpage.app.model.Usuario;
import com.flashpage.app.model.dashboard.Gestion;
import com.flashpage.app.model.dashboard.GestionEstado;
import com.flashpage.app.model.dto.LeadWebhookRequest;
import com.flashpage.app.repository.GestionRepository;
import com.flashpage.app.repository.UsuarioRepository;

@Service
@Transactional
public class LeadWebhookService {

    private static final Logger log = LoggerFactory.getLogger(LeadWebhookService.class);

    private final GestionRepository gestionRepo;
    private final UsuarioRepository usuarioRepo;

    public LeadWebhookService(GestionRepository gestionRepo, UsuarioRepository usuarioRepo) {
        this.gestionRepo = gestionRepo;
        this.usuarioRepo = usuarioRepo;
    }

    public Long registrarLead(LeadWebhookRequest req) {
        // Busca cualquier asesor activo para asignarle el lead como propietario temporal.
        // En N8N / flujo posterior, el supervisor puede reasignar.
        Usuario asesorSistema = usuarioRepo.findByRol(Rol.ASESOR)
                .stream()
                .filter(Usuario::isActivo)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No hay asesores activos para asignar el lead."));

        Gestion gestion = new Gestion(
                asesorSistema,
                null,
                req.nombreCompleto().trim(),
                req.telefono().trim(),
                null,
                null,
                GestionEstado.PENDIENTE,
                LocalDate.now(),
                "Lead entrante desde " + req.origen().name()
                        + (req.servicioDeseado() != null && !req.servicioDeseado().isBlank()
                                ? " — Servicio: " + req.servicioDeseado()
                                : ""),
                null);

        gestion.setOrigen(req.origen());
        Gestion saved = gestionRepo.save(gestion);

        log.info("Lead registrado — id: {}, origen: {}, nombre: {}", saved.getId(), req.origen(), req.nombreCompleto());
        return saved.getId();
    }
}
