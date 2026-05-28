package com.flashpage.app.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flashpage.app.exception.NotFoundException;
import com.flashpage.app.exception.UnauthorizedException;
import com.flashpage.app.exception.ValidationException;
import com.flashpage.app.model.EstadoTicket;
import com.flashpage.app.model.Rol;
import com.flashpage.app.model.Ticket;
import com.flashpage.app.model.TicketMensaje;
import com.flashpage.app.model.TipoNotificacion;
import com.flashpage.app.model.Usuario;
import com.flashpage.app.model.dto.CreateTicketRequest;
import com.flashpage.app.model.dto.TicketMensajeRequest;
import com.flashpage.app.model.dto.TicketResponse;
import com.flashpage.app.repository.TicketRepository;
import com.flashpage.app.repository.UsuarioRepository;

@Service
@Transactional
public class TicketService {

    private final TicketRepository ticketRepo;
    private final UsuarioRepository usuarioRepo;
    private final NotificacionService notificacionService;
    private final EmailService emailService;

    public TicketService(TicketRepository ticketRepo, UsuarioRepository usuarioRepo,
            NotificacionService notificacionService, EmailService emailService) {
        this.ticketRepo = ticketRepo;
        this.usuarioRepo = usuarioRepo;
        this.notificacionService = notificacionService;
        this.emailService = emailService;
    }

    public TicketResponse crear(CreateTicketRequest req, Usuario creador) {
        Ticket ticket = new Ticket();
        ticket.setCreador(creador);
        ticket.setTitulo(req.titulo());
        ticket.setDescripcion(req.descripcion());
        ticket.setEstado(EstadoTicket.PENDIENTE);

        // Asignar a un líder/gerente que será el aprobador.
        if (req.asignadoId() != null) {
            Usuario asignado = usuarioRepo.findById(req.asignadoId())
                    .orElseThrow(() -> new NotFoundException("Usuario asignado no encontrado"));
            ticket.setAsignado(asignado);
        } else {
            List<Usuario> aprobadores = usuarioRepo.findAprobadores();
            if (!aprobadores.isEmpty()) {
                ticket.setAsignado(aprobadores.get(0));
            }
        }

        Ticket saved = ticketRepo.save(ticket);

        String mensajeNotif = creador.getNombre() + " " + creador.getApellido() + " creó el ticket: " + saved.getTitulo();
        List<Usuario> aprobadores = usuarioRepo.findAprobadores();
        for (Usuario aprobador : aprobadores) {
            notificacionService.crear(
                    aprobador.getId(),
                    TipoNotificacion.TICKET_CREADO,
                    "Nuevo ticket pendiente de aprobación",
                    mensajeNotif,
                    saved.getId());
        }

        return TicketResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> listar(Usuario usuario) {
        if (esAprobador(usuario)) {
            return ticketRepo.findAllByOrderByActualizadoEnDesc()
                    .stream().map(TicketResponse::from).toList();
        }
        return ticketRepo.findByParticipante(usuario.getId())
                .stream().map(TicketResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public TicketResponse obtener(Long id, Usuario usuario) {
        Ticket ticket = ticketRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Ticket no encontrado"));
        validarAcceso(ticket, usuario);
        return TicketResponse.from(ticket);
    }

    public TicketResponse cambiarEstado(Long id, EstadoTicket estado, Usuario usuario) {
        Ticket ticket = ticketRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Ticket no encontrado"));
        validarAcceso(ticket, usuario);

        // Solo líder o gerente pueden aprobar o rechazar.
        if ((estado == EstadoTicket.APROBADO || estado == EstadoTicket.RECHAZADO) && !esAprobador(usuario)) {
            throw new UnauthorizedException("Solo un líder o gerente puede aprobar o rechazar el ticket");
        }

        // Una vez aprobado o rechazado, el ticket queda inmutable.
        if (ticket.getEstado() == EstadoTicket.APROBADO || ticket.getEstado() == EstadoTicket.RECHAZADO) {
            throw new ValidationException("El ticket ya fue " +
                    (ticket.getEstado() == EstadoTicket.APROBADO ? "aprobado" : "rechazado") +
                    " y no puede cambiar de estado");
        }

        EstadoTicket previo = ticket.getEstado();
        ticket.setEstado(estado);
        Ticket saved = ticketRepo.save(ticket);

        if (estado == EstadoTicket.APROBADO && previo != EstadoTicket.APROBADO) {
            Usuario creador = saved.getCreador();
            emailService.enviarTicketAprobadoADesarrollador(
                    saved.getTitulo(),
                    saved.getDescripcion(),
                    creador.getNombre() + " " + creador.getApellido(),
                    creador.getEmail(),
                    usuario.getNombre() + " " + usuario.getApellido(),
                    saved.getMensajes());

            notificacionService.crear(
                    creador.getId(),
                    TipoNotificacion.TICKET_RESPONDIDO,
                    "Ticket aprobado",
                    "Tu ticket \"" + saved.getTitulo() + "\" fue aprobado por " +
                            usuario.getNombre() + " " + usuario.getApellido(),
                    saved.getId());
        } else if (estado == EstadoTicket.RECHAZADO && previo != EstadoTicket.RECHAZADO) {
            notificacionService.crear(
                    saved.getCreador().getId(),
                    TipoNotificacion.TICKET_RESPONDIDO,
                    "Ticket rechazado",
                    "Tu ticket \"" + saved.getTitulo() + "\" fue rechazado por " +
                            usuario.getNombre() + " " + usuario.getApellido(),
                    saved.getId());
        }

        return TicketResponse.from(saved);
    }

    public TicketResponse responder(Long id, TicketMensajeRequest req, Usuario autor) {
        Ticket ticket = ticketRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Ticket no encontrado"));
        validarAcceso(ticket, autor);

        // No se puede comentar tickets aprobados o rechazados.
        if (ticket.getEstado() == EstadoTicket.APROBADO || ticket.getEstado() == EstadoTicket.RECHAZADO) {
            throw new ValidationException("No se pueden agregar mensajes a un ticket " +
                    (ticket.getEstado() == EstadoTicket.APROBADO ? "aprobado" : "rechazado"));
        }

        TicketMensaje mensaje = new TicketMensaje(ticket, autor, req.contenido());
        ticket.getMensajes().add(mensaje);
        Ticket saved = ticketRepo.save(ticket);

        // Only notify the creator when an approver replies, not the other way around.
        boolean autorEsAprobador = esAprobador(autor);
        if (autorEsAprobador) {
            notificacionService.crear(
                    ticket.getCreador().getId(),
                    TipoNotificacion.TICKET_RESPONDIDO,
                    "Nueva respuesta en ticket",
                    autor.getNombre() + " " + autor.getApellido() + " respondió en: " + ticket.getTitulo(),
                    ticket.getId());
        }

        return TicketResponse.from(saved);
    }

    private void validarAcceso(Ticket ticket, Usuario usuario) {
        boolean esParticipante = ticket.getCreador().getId().equals(usuario.getId())
                || (ticket.getAsignado() != null && ticket.getAsignado().getId().equals(usuario.getId()));
        if (!esParticipante && !esAprobador(usuario)) {
            throw new UnauthorizedException("Sin acceso a este ticket");
        }
    }

    private boolean esAprobador(Usuario usuario) {
        Rol rol = usuario.getRol();
        return rol == Rol.LIDER || rol == Rol.GERENTE;
    }
}
