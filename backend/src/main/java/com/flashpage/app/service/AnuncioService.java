package com.flashpage.app.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flashpage.app.exception.NotFoundException;
import com.flashpage.app.exception.UnauthorizedException;
import com.flashpage.app.model.Anuncio;
import com.flashpage.app.model.Rol;
import com.flashpage.app.model.TipoNotificacion;
import com.flashpage.app.model.Usuario;
import com.flashpage.app.model.dto.AnuncioResponse;
import com.flashpage.app.model.dto.CreateAnuncioRequest;
import com.flashpage.app.repository.AnuncioRepository;
import com.flashpage.app.repository.UsuarioRepository;

@Service
@Transactional
public class AnuncioService {

    private final AnuncioRepository anuncioRepo;
    private final UsuarioRepository usuarioRepo;
    private final NotificacionService notificacionService;
    private final EmailService emailService;

    public AnuncioService(AnuncioRepository anuncioRepo, UsuarioRepository usuarioRepo,
            NotificacionService notificacionService, EmailService emailService) {
        this.anuncioRepo = anuncioRepo;
        this.usuarioRepo = usuarioRepo;
        this.notificacionService = notificacionService;
        this.emailService = emailService;
    }

    /** Solo roles SUPERVISOR o superior pueden publicar. */
    public AnuncioResponse publicar(CreateAnuncioRequest req, Usuario autor) {
        if (autor.getRol().valor < Rol.SUPERVISOR.valor) {
            throw new UnauthorizedException("Solo supervisores o superiores pueden publicar anuncios");
        }
        Anuncio anuncio = new Anuncio();
        anuncio.setAutor(autor);
        anuncio.setTitulo(req.titulo());
        anuncio.setContenido(req.contenido());
        if (req.rolesDestino() != null)
            anuncio.setRolesDestino(req.rolesDestino());

        Anuncio saved = anuncioRepo.save(anuncio);

        // Notificar a todos los destinatarios
        List<Rol> destinos = saved.getRolesDestino().isEmpty()
                ? List.of(Rol.values())
                : saved.getRolesDestino();

        String autorNombre = autor.getNombre() + " " + autor.getApellido();
        usuarioRepo.findAll().stream()
                .filter(u -> u.isActivo() && destinos.contains(u.getRol()) && !u.getId().equals(autor.getId()))
                .forEach(u -> {
                    notificacionService.crear(
                            u.getId(),
                            TipoNotificacion.ANUNCIO,
                            "Nuevo anuncio: " + saved.getTitulo(),
                            autorNombre + " publicó un comunicado.",
                            saved.getId());
                    emailService.enviarAnuncio(
                            u.getEmail(),
                            u.getNombre(),
                            autorNombre,
                            saved.getTitulo(),
                            saved.getContenido());
                });

        return AnuncioResponse.from(saved, autor.getId());
    }

    @Transactional(readOnly = true)
    public List<AnuncioResponse> listar(Usuario usuario) {
        return anuncioRepo.findVisiblesParaRol(usuario.getRol())
                .stream().map(a -> AnuncioResponse.from(a, usuario.getId())).toList();
    }

    public AnuncioResponse marcarLeido(Long id, Usuario usuario) {
        Anuncio anuncio = anuncioRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Anuncio no encontrado"));
        if (!anuncio.getLeidoPor().contains(usuario.getId())) {
            anuncio.getLeidoPor().add(usuario.getId());
            anuncio = anuncioRepo.save(anuncio);
        }
        return AnuncioResponse.from(anuncio, usuario.getId());
    }

    public void eliminar(Long id, Usuario usuario) {
        Anuncio anuncio = anuncioRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Anuncio no encontrado"));
        if (!anuncio.getAutor().getId().equals(usuario.getId())
                && usuario.getRol().valor < Rol.JEFE_DE_SUPERVISOR.valor) {
            throw new UnauthorizedException("Sin permisos para eliminar este anuncio");
        }
        anuncioRepo.delete(anuncio);
    }
}
