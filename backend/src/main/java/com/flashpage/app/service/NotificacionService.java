package com.flashpage.app.service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.flashpage.app.exception.NotFoundException;
import com.flashpage.app.model.Notificacion;
import com.flashpage.app.model.TipoNotificacion;
import com.flashpage.app.model.Usuario;
import com.flashpage.app.model.dto.NotificacionResponse;
import com.flashpage.app.repository.NotificacionRepository;
import com.flashpage.app.repository.UsuarioRepository;

@Service
public class NotificacionService {

    private final NotificacionRepository repo;
    private final UsuarioRepository usuarioRepo;

    /** SSE: mapa userId → lista de emitters activos. */
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public NotificacionService(NotificacionRepository repo, UsuarioRepository usuarioRepo) {
        this.repo = repo;
        this.usuarioRepo = usuarioRepo;
    }

    // ── SSE ──────────────────────────────────────────────────────────────────

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        Runnable cleanup = () -> {
            List<SseEmitter> list = emitters.get(userId);
            if (list != null) {
                list.remove(emitter);
            }
        };
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        // Enviar el conteo no leídos al conectar
        long noLeidas = repo.countByDestinatario_IdAndLeidaFalse(userId);
        try {
            emitter.send(SseEmitter.event().name("count").data(noLeidas));
        } catch (Exception ignored) {
            cleanup.run();
        }

        return emitter;
    }

    private void push(Long userId, NotificacionResponse payload) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null || userEmitters.isEmpty()) {
            return;
        }
        List<SseEmitter> dead = new CopyOnWriteArrayList<>();
        for (SseEmitter e : userEmitters) {
            try {
                e.send(SseEmitter.event().name("notificacion").data(payload));
            } catch (Exception ex) {
                dead.add(e);
            }
        }
        if (!dead.isEmpty()) {
            userEmitters.removeAll(dead);
        }
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    @Transactional
    public NotificacionResponse crear(Long destinatarioId, TipoNotificacion tipo,
            String titulo, String mensaje, Long referenciaId) {
        Usuario dest = usuarioRepo.findById(destinatarioId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        Notificacion n = repo.save(new Notificacion(dest, tipo, titulo, mensaje, referenciaId));
        NotificacionResponse response = NotificacionResponse.from(n);
        push(destinatarioId, response);
        return response;
    }

    public List<NotificacionResponse> listar(Long userId) {
        return repo.findByDestinatario_IdOrderByCreadoEnDesc(userId)
                .stream().map(NotificacionResponse::from).toList();
    }

    public long contarNoLeidas(Long userId) {
        return repo.countByDestinatario_IdAndLeidaFalse(userId);
    }

    @Transactional
    public NotificacionResponse marcarLeida(Long id, Long userId) {
        Notificacion n = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Notificación no encontrada"));
        if (!n.getDestinatario().getId().equals(userId)) {
            throw new NotFoundException("Notificación no encontrada");
        }
        n.setLeida(true);
        return NotificacionResponse.from(repo.save(n));
    }

    @Transactional
    public void marcarTodasLeidas(Long userId) {
        repo.marcarTodasLeidas(userId);
    }

    @Transactional
    public void eliminar(Long id, Long userId) {
        Notificacion n = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Notificación no encontrada"));
        if (!n.getDestinatario().getId().equals(userId)) {
            throw new NotFoundException("Notificación no encontrada");
        }
        repo.delete(n);
    }
}
