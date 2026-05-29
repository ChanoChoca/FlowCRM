package com.flashpage.app.dashboard.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flashpage.app.dashboard.dto.GestionDTOs.ConversionAsesorResumen;
import com.flashpage.app.dashboard.dto.GestionDTOs.ConversionPropiaResumen;
import com.flashpage.app.dashboard.dto.TasaConversionEquipoProjection;
import com.flashpage.app.dashboard.model.Gestion;
import com.flashpage.app.dashboard.model.GestionEstado;
import com.flashpage.app.dashboard.repository.GestionRepository;
import com.flashpage.app.usuario.model.Usuario;
import com.flashpage.app.usuario.repository.UsuarioRepository;
import com.flashpage.app.venta.model.Ani;
import com.flashpage.app.venta.model.EstadoVenta;
import com.flashpage.app.venta.model.Venta;

@Service
@Transactional
public class GestionService {

    private static final Logger log = LoggerFactory.getLogger(GestionService.class);

    private final GestionRepository gestionRepo;
    private final UsuarioRepository usuarioRepo;

    public GestionService(GestionRepository gestionRepo, UsuarioRepository usuarioRepo) {
        this.gestionRepo = gestionRepo;
        this.usuarioRepo = usuarioRepo;
    }

    @Transactional(readOnly = true)
    public ConversionPropiaResumen getConversionPropia(Long asesorId, LocalDate desde, LocalDate hasta) {
        var p = gestionRepo.findTasaConversionByAsesor(asesorId, desde, hasta);
        long total = p != null && p.getTotalGestiones() != null ? p.getTotalGestiones() : 0L;
        long vendidas = p != null && p.getTotalVendidas() != null ? p.getTotalVendidas() : 0L;
        double tasa = p != null && p.getTasaConversion() != null ? p.getTasaConversion() : 0.0;
        return new ConversionPropiaResumen(total, vendidas, tasa);
    }

    public List<ConversionAsesorResumen> getConversionPorEquipo(Long supervisorId, LocalDate desde, LocalDate hasta) {
        List<Usuario> asesores = usuarioRepo.findAsesoresActivosBySuper(supervisorId);
        Map<Long, TasaConversionEquipoProjection> tasasMap = gestionRepo
                .findTasaConversionByEquipo(supervisorId, desde, hasta)
                .stream()
                .collect(Collectors.toMap(TasaConversionEquipoProjection::getUsuarioId, p -> p));

        return asesores.stream().map(u -> {
            var p = tasasMap.get(u.getId());
            long total = p != null && p.getTotalGestiones() != null ? p.getTotalGestiones() : 0L;
            long vendidas = p != null && p.getTotalVendidas() != null ? p.getTotalVendidas() : 0L;
            double tasa = p != null && p.getTasaConversion() != null ? p.getTasaConversion() : 0.0;
            return new ConversionAsesorResumen(u.getId(), u.getNombre(), u.getApellido(), total, vendidas, tasa);
        }).collect(Collectors.toList());
    }

    public void crearDesdeVenta(Usuario asesor, Venta venta) {
        GestionEstado estado = venta.getAni() == Ani.VENTA_DIRECTA
                ? GestionEstado.VENDIDO : GestionEstado.PENDIENTE;
        Gestion gestion = new Gestion(asesor, venta.getCliente(), venta.getCliente().getNombre(),
                venta.getCliente().getTelefono(), venta.getCentral(), venta.getProducto(),
                estado, LocalDate.now(), null, venta);
        gestionRepo.save(gestion);
        log.info("Gestión creada - ventaId: {}, asesor: {}, estado: {}", venta.getId(), asesor.getId(), estado);
    }

    public void sincronizarEstadoDesdeVenta(Long ventaId, EstadoVenta estadoVenta, String feedback) {
        GestionEstado gestionEstado = switch (estadoVenta) {
            case CUMPLIDA -> GestionEstado.VENDIDO;
            case CANCELADA, RECHAZADA -> GestionEstado.NO_INTERESADO;
            case INICIADA -> GestionEstado.CONTACTADO;
            case PREVENTA, TICKET, PENDIENTE -> GestionEstado.PENDIENTE;
        };
        gestionRepo.findByVentaId(ventaId).ifPresent(gestion -> {
            gestion.setEstado(gestionEstado);
            if (feedback != null && !feedback.isBlank()) gestion.setObservaciones(feedback);
            gestionRepo.save(gestion);
            log.info("Gestión sincronizada - ventaId: {}, estadoGestion: {}", ventaId, gestionEstado);
        });
    }
}
