package com.flashpage.app.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flashpage.app.exception.ConflictException;
import com.flashpage.app.exception.NotFoundException;
import com.flashpage.app.exception.UnauthorizedException;
import com.flashpage.app.exception.ValidationException;
import com.flashpage.app.model.Producto;
import com.flashpage.app.model.Usuario;
import com.flashpage.app.model.dashboard.Desafio;
import com.flashpage.app.model.dashboard.DesafioEstado;
import com.flashpage.app.model.dto.dashboard.DesafioDTOs.DesafioCardResponse;
import com.flashpage.app.model.dto.dashboard.DesafioDTOs.DesafioRequest;
import com.flashpage.app.model.dto.dashboard.DesafioDTOs.DesafioResponse;
import com.flashpage.app.model.dto.dashboard.ProgresoDesafio;
import com.flashpage.app.repository.DesafioRepository;
import com.flashpage.app.repository.ProductoRepository;

@Service
@Transactional
public class DesafioService {

    private static final Logger log = LoggerFactory.getLogger(DesafioService.class);

    private final DesafioRepository desafioRepo;
    private final ProductoRepository productoRepo;

    public DesafioService(DesafioRepository desafioRepo, ProductoRepository productoRepo) {
        this.desafioRepo = desafioRepo;
        this.productoRepo = productoRepo;
    }

    @Transactional(readOnly = true)
    public DesafioCardResponse getDesafioActivoCard(Long supervisorId) {
        return desafioRepo.findBySupervisorIdAndEstado(supervisorId, DesafioEstado.ACTIVO)
                .map(d -> toCard(d, calcularProgreso(d)))
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public DesafioResponse getDesafioActivo(Long supervisorId) {
        return desafioRepo.findBySupervisorIdAndEstado(supervisorId, DesafioEstado.ACTIVO)
                .map(d -> toResponse(d, calcularProgreso(d)))
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<DesafioResponse> getHistorial(Long supervisorId) {
        return desafioRepo.findBySupervisorIdOrderByCreadoEnDesc(supervisorId)
                .stream()
                .map(d -> toResponse(d, calcularProgreso(d)))
                .collect(Collectors.toList());
    }

    public DesafioResponse crear(Usuario supervisor, DesafioRequest req) {
        if (desafioRepo.existsBySupervisorIdAndEstado(supervisor.getId(), DesafioEstado.ACTIVO)) {
            throw new ConflictException(
                    "Ya existe un desafío activo. Cancelalo antes de crear uno nuevo.");
        }

        if (!req.fechaVencimiento().isAfter(req.fechaInicio())) {
            throw new ValidationException(
                    "La fecha de vencimiento debe ser posterior a la fecha de inicio.");
        }

        Producto producto = req.productoId() != null
                ? productoRepo.findById(req.productoId())
                        .orElseThrow(() -> new NotFoundException("Producto no encontrado: " + req.productoId()))
                : null;

        Desafio desafio = new Desafio(supervisor, req.titulo(), req.descripcion(), req.metaVentas(), req.horario(),
                producto, req.fechaInicio(), req.fechaVencimiento(), DesafioEstado.ACTIVO);

        Desafio guardado = desafioRepo.save(desafio);
        log.info("Desafío creado - id: {}, supervisor: {}, meta: {}", guardado.getId(), supervisor.getId(),
                req.metaVentas());
        return toResponse(guardado, 0L);
    }

    public DesafioResponse cancelar(Long desafioId, Usuario supervisor) {
        Desafio desafio = desafioRepo.findById(desafioId)
                .orElseThrow(() -> new NotFoundException("Desafío no encontrado: " + desafioId));

        if (!desafio.getSupervisor().getId().equals(supervisor.getId())) {
            throw new UnauthorizedException("No tenés permiso para cancelar este desafío.");
        }
        if (desafio.getEstado() != DesafioEstado.ACTIVO) {
            throw new ConflictException(
                    "No se puede cancelar: el desafío está " + desafio.getEstado().name().toLowerCase() + ".");
        }

        desafio.setEstado(DesafioEstado.CANCELADO);
        log.info("Desafío cancelado - id: {}, supervisor: {}", desafioId, supervisor.getId());
        return toResponse(desafioRepo.save(desafio), calcularProgreso(desafio));
    }

    // ─── Cierre automático diario ─────────────────────────────────────────

    @Scheduled(cron = "${desafios.cron}", zone = "America/Argentina/Buenos_Aires")
    public void cerrarDesafiosVencidosYCompletados() {
        log.info("Ejecutando cierre automático de desafíos vencidos y completados");
        LocalDate hoy = LocalDate.now();

        desafioRepo.cerrarVencidos(hoy);

        List<Desafio> activos = desafioRepo
                .findByEstadoAndFechaVencimientoGreaterThanEqual(DesafioEstado.ACTIVO, hoy);

        int completados = 0;
        for (Desafio d : activos) {
            if (calcularProgreso(d) >= d.getMetaVentas()) {
                d.setEstado(DesafioEstado.COMPLETADO);
                desafioRepo.save(d);
                completados++;
            }
        }
        log.info("Cierre de desafíos finalizado - completados: {}, activos evaluados: {}", completados, activos.size());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    private long calcularProgreso(Desafio d) {
        return calcularProgreso(d, LocalDate.now());
    }

    private long calcularProgreso(Desafio d, LocalDate referencia) {
        LocalDate hasta = d.getFechaVencimiento().isBefore(referencia)
                ? d.getFechaVencimiento()
                : referencia;

        return desafioRepo.countProgresoDesafio(
                d.getSupervisor().getId(),
                d.getFechaInicio(),
                hasta,
                d.getHorario() != null ? d.getHorario().name() : null,
                d.getProducto() != null ? d.getProducto().getId() : null);
    }

    private DesafioResponse toResponse(Desafio d, long progreso) {
        var pd = ProgresoDesafio.calcular(d, progreso);
        return new DesafioResponse(d.getId(), d.getTitulo(), d.getDescripcion(),
                d.getMetaVentas(), d.getHorario(),
                d.getProducto() != null ? d.getProducto().getId() : null,
                d.getProducto() != null ? d.getProducto().getNombre() : null,
                d.getFechaInicio(), d.getFechaVencimiento(), d.getEstado(),
                pd.progreso(), pd.porcentaje(), pd.diasRestantes(),
                pd.completado(), d.getCreadoEn());
    }

    private DesafioCardResponse toCard(Desafio d, long progreso) {
        var pd = ProgresoDesafio.calcular(d, progreso);
        return new DesafioCardResponse(d.getId(), d.getTitulo(), d.getMetaVentas(),
                pd.progreso(), pd.porcentaje(), pd.diasRestantes(),
                pd.completado(), d.getHorario() != null ? d.getHorario().name() : null);
    }
}