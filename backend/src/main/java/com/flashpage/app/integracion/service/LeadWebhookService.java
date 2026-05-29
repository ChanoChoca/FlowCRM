package com.flashpage.app.integracion.service;

import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flashpage.app.dashboard.model.Gestion;
import com.flashpage.app.dashboard.model.GestionEstado;
import com.flashpage.app.dashboard.repository.GestionRepository;
import com.flashpage.app.integracion.dto.LeadWebhookRequest;
import com.flashpage.app.usuario.model.Rol;
import com.flashpage.app.usuario.model.Usuario;
import com.flashpage.app.usuario.repository.UsuarioRepository;

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
        Usuario asesorSistema = usuarioRepo.findByRol(Rol.ASESOR).stream()
                .filter(Usuario::isActivo).findFirst()
                .orElseThrow(() -> new IllegalStateException("No hay asesores activos para asignar el lead."));

        Gestion gestion = new Gestion(asesorSistema, null,
                req.nombreCompleto().trim(), req.telefono().trim(),
                null, null, GestionEstado.PENDIENTE, LocalDate.now(),
                "Lead entrante desde " + req.origen().name()
                        + (req.servicioDeseado() != null && !req.servicioDeseado().isBlank()
                                ? " — Servicio: " + req.servicioDeseado() : ""),
                null);
        gestion.setOrigen(req.origen());
        Gestion saved = gestionRepo.save(gestion);
        log.info("Lead registrado — id: {}, origen: {}", saved.getId(), req.origen());
        return saved.getId();
    }
}
