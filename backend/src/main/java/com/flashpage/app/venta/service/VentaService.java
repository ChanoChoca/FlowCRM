package com.flashpage.app.venta.service;

import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flashpage.app.catalogo.repository.CentralRepository;
import com.flashpage.app.catalogo.repository.ProductoRepository;
import com.flashpage.app.catalogo.repository.PromoRepository;
import com.flashpage.app.catalogo.repository.ProvinciaRepository;
import com.flashpage.app.dashboard.service.GestionService;
import com.flashpage.app.shared.exception.ConflictException;
import com.flashpage.app.shared.exception.NotFoundException;
import com.flashpage.app.shared.exception.ServiceException;
import com.flashpage.app.shared.exception.ValidationException;
import com.flashpage.app.usuario.model.Rol;
import com.flashpage.app.usuario.model.Usuario;
import com.flashpage.app.usuario.repository.UsuarioRepository;
import com.flashpage.app.venta.dto.CambioEstadoRequest;
import com.flashpage.app.venta.dto.VentaDetalleResponse;
import com.flashpage.app.venta.dto.VentaMapaResponse;
import com.flashpage.app.venta.dto.VentaRequest;
import com.flashpage.app.venta.dto.VentaResponse;
import com.flashpage.app.venta.model.Ani;
import com.flashpage.app.venta.model.Cliente;
import com.flashpage.app.venta.model.Domicilio;
import com.flashpage.app.venta.model.EstadoVenta;
import com.flashpage.app.venta.model.Origen;
import com.flashpage.app.venta.model.Pago;
import com.flashpage.app.venta.model.TipoDocumento;
import com.flashpage.app.venta.model.Venta;
import com.flashpage.app.venta.repository.ClienteRepository;
import com.flashpage.app.venta.repository.VentaRepository;
import com.flashpage.app.integracion.service.N8nService;
import com.flashpage.app.catalogo.service.PlazaService;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class VentaService {

    private static final Logger log = LoggerFactory.getLogger(VentaService.class);

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final PromoRepository promoRepository;
    private final CentralRepository centralRepository;
    private final ClienteRepository clienteRepository;
    private final ProvinciaRepository provinciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PlazaService plazaService;
    private final N8nService n8nService;
    private final GestionService gestionService;

    public VentaService(VentaRepository ventaRepository, ProductoRepository productoRepository,
            PromoRepository promoRepository, CentralRepository centralRepository, ClienteRepository clienteRepository,
            ProvinciaRepository provinciaRepository, UsuarioRepository usuarioRepository,
            PlazaService plazaService, N8nService n8nService, GestionService gestionService) {
        this.ventaRepository = ventaRepository;
        this.productoRepository = productoRepository;
        this.promoRepository = promoRepository;
        this.centralRepository = centralRepository;
        this.clienteRepository = clienteRepository;
        this.provinciaRepository = provinciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.plazaService = plazaService;
        this.n8nService = n8nService;
        this.gestionService = gestionService;
    }

    @Transactional(readOnly = true)
    public Page<VentaResponse> obtenerVentas(Specification<Venta> spec, int page, int size) {
        var pageResult = ventaRepository.findAll(spec, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "creadoEn")));
        return pageResult.map(v -> {
            Usuario asesor = v.getAsesor();
            Usuario supervisor = asesor != null ? asesor.getSupervisor() : null;
            return new VentaResponse(v.getId(),
                    v.getCliente() != null ? v.getCliente().getNombre() : null,
                    v.getPromo() != null ? v.getPromo().getNombre() : null,
                    asesor != null ? asesor.getNombre() : null,
                    asesor != null ? asesor.getApellido() : null,
                    supervisor != null ? supervisor.getNombre() : null,
                    supervisor != null ? supervisor.getApellido() : null,
                    v.getEstado(), v.getCreadoEn());
        });
    }

    @Transactional(readOnly = true)
    public VentaDetalleResponse obtenerDetalleVenta(Long id, Usuario usuario) {
        Venta venta = ventaRepository.findDetalleById(id)
                .orElseThrow(() -> new EntityNotFoundException("Venta no encontrada"));
        return VentaDetalleResponse.from(venta);
    }

    public void crearVenta(VentaRequest req, Usuario usuario) {
        Usuario asesor = usuario;
        if (req.asesorId() != null && usuario.getRol() == Rol.SUPERVISOR) {
            asesor = usuarioRepository.findById(req.asesorId())
                    .orElseThrow(() -> new NotFoundException("Asesor no encontrado con id: " + req.asesorId()));
            if (asesor.getSupervisor() == null || !asesor.getSupervisor().getId().equals(usuario.getId()))
                throw new ValidationException("El asesor no pertenece a este supervisor");
        }
        final Usuario asesorFinal = asesor;

        var producto = productoRepository.findByNombre("PLAN MOVISTAR FIBRA ALTA PURA")
                .orElseThrow(() -> new NotFoundException("Producto fijo no encontrado"));
        if (!producto.isActivo()) throw new NotFoundException("El producto seleccionado ya no está disponible");

        var central = centralRepository.findById(req.centralId())
                .orElseThrow(() -> new NotFoundException("Central no encontrada con id: " + req.centralId()));
        if (!central.isActivo()) throw new NotFoundException("La central seleccionada ya no está disponible");

        var promo = promoRepository.findById(req.promoId())
                .orElseThrow(() -> new NotFoundException("Promo no encontrada con id: " + req.promoId()));

        Cliente clienteReq = req.cliente();
        Cliente cliente = clienteRepository
                .findByTipoDocumentoAndNumeroDocumento(TipoDocumento.DNI, clienteReq.getNumeroDocumento())
                .map(existente -> {
                    existente.setNombre(clienteReq.getNombre());
                    existente.setTelefono(clienteReq.getTelefono());
                    existente.setEmail(clienteReq.getEmail());
                    if (clienteReq.getDomicilio() != null) {
                        Domicilio src = clienteReq.getDomicilio();
                        if (existente.getDomicilio() != null) {
                            Domicilio dest = existente.getDomicilio();
                            dest.setCalle(src.getCalle()); dest.setNumero(src.getNumero());
                            dest.setPiso(src.getPiso()); dest.setDepto(src.getDepto());
                            dest.setEntreCalles1(src.getEntreCalles1()); dest.setEntreCalles2(src.getEntreCalles2());
                            dest.setEntreCalles3(src.getEntreCalles3()); dest.setObservaciones(src.getObservaciones());
                            dest.setCoordenadas(src.getCoordenadas()); dest.setLocalidad(src.getLocalidad());
                            dest.setCodigoPostal(src.getCodigoPostal());
                            if (src.getProvincia() != null && src.getProvincia().getId() != null) {
                                dest.setProvincia(provinciaRepository.getReferenceById(src.getProvincia().getId()));
                            } else { dest.setProvincia(null); }
                        } else {
                            src.setId(null);
                            if (src.getProvincia() != null && src.getProvincia().getId() != null) {
                                src.setProvincia(provinciaRepository.getReferenceById(src.getProvincia().getId()));
                            }
                            existente.setDomicilio(src);
                        }
                    }
                    if (clienteReq.getFotosDni() != null) {
                        clienteReq.getFotosDni().forEach(a -> a.setId(null));
                        existente.setFotosDni(clienteReq.getFotosDni());
                    }
                    return existente;
                })
                .orElseGet(() -> {
                    clienteReq.setId(null);
                    clienteReq.setTipoDocumento(TipoDocumento.DNI);
                    if (clienteReq.getDomicilio() != null) {
                        clienteReq.getDomicilio().setId(null);
                        var prov = clienteReq.getDomicilio().getProvincia();
                        if (prov != null && prov.getId() != null) {
                            clienteReq.getDomicilio().setProvincia(provinciaRepository.getReferenceById(prov.getId()));
                        }
                    }
                    if (clienteReq.getFotosDni() != null) clienteReq.getFotosDni().forEach(a -> a.setId(null));
                    return clienteReq;
                });

        Pago pago = req.pago();
        pago.setId(null);
        pago.setDebitoAutomatico(true);

        Venta venta = new Venta();
        venta.setAsesor(asesorFinal);
        venta.setProducto(producto);
        venta.setPromo(promo);
        venta.setCentral(central);
        venta.setCliente(cliente);
        venta.setPago(pago);
        venta.setAni(req.ani());
        venta.setDecos(req.decos());
        venta.setContacto(req.contacto());
        venta.setObservaciones(String.format("%s\nasesor: %s %s",
                req.observaciones() != null ? req.observaciones() : "",
                asesorFinal.getNombre(), asesorFinal.getApellido()));
        venta.setOrigen(Origen.CRM);

        try {
            if (venta.getAsesor().getSupervisor().getPlazaUsername().startsWith("CAZ"))
                plazaService.enviarVentaAPlazaCazador(venta);
            else
                plazaService.enviarVentaAPlazaSupervisor(venta);
            if (venta.getAni() == Ani.VENTA_DIRECTA) venta.setEstado(EstadoVenta.CUMPLIDA);
            else if (venta.getAni() == Ani.TICKET) venta.setEstado(EstadoVenta.TICKET);
            else venta.setEstado(EstadoVenta.PREVENTA);
            ventaRepository.save(venta);
            log.info("Venta guardada - id: {}", venta.getId());
            gestionService.crearDesdeVenta(asesorFinal, venta);
            n8nService.enviarVenta(venta, req.fechaNacimiento(), req.miga());
        } catch (ValidationException | ConflictException | ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error inesperado enviando venta", e);
            throw new ServiceException("Error al enviar la venta", e);
        }
    }

    @Transactional(readOnly = true)
    public List<VentaMapaResponse> getVentasMapa(LocalDate desde, LocalDate hasta) {
        return ventaRepository.findVentasConCoordenadas(desde, hasta).stream()
                .map(p -> {
                    String[] parts = p.getCoordenadas().split(",");
                    if (parts.length != 2) return null;
                    try {
                        return new VentaMapaResponse(p.getId(), p.getClienteNombre(), p.getAsesorNombre(),
                                p.getProductoNombre(), p.getCentralNombre(), p.getEstado(),
                                Double.parseDouble(parts[0].trim()), Double.parseDouble(parts[1].trim()),
                                p.getLocalidad(), p.getProvincia());
                    } catch (NumberFormatException e) { return null; }
                })
                .filter(r -> r != null)
                .collect(java.util.stream.Collectors.toList());
    }

    public void cambiarEstados(List<CambioEstadoRequest> cambios) {
        for (CambioEstadoRequest c : cambios) {
            EstadoVenta nuevoEstado;
            try {
                nuevoEstado = EstadoVenta.valueOf(c.estado());
            } catch (IllegalArgumentException e) {
                log.warn("Estado desconocido id: {}, estado: '{}'", c.id(), c.estado());
                continue;
            }
            Venta venta = ventaRepository.findById(c.id()).orElse(null);
            if (venta == null) { log.warn("Venta no encontrada id: {}", c.id()); continue; }
            if (venta.getEstado() == nuevoEstado) continue;
            venta.setEstado(nuevoEstado);
            gestionService.sincronizarEstadoDesdeVenta(c.id(), nuevoEstado, c.feedback());
        }
    }
}
