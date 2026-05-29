package com.flashpage.app.venta.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.flashpage.app.shared.model.PageResponse;
import com.flashpage.app.usuario.model.Usuario;
import com.flashpage.app.venta.dto.CambioEstadoRequest;
import com.flashpage.app.venta.dto.VentaDetalleResponse;
import com.flashpage.app.venta.dto.VentaMapaResponse;
import com.flashpage.app.venta.dto.VentaRequest;
import com.flashpage.app.venta.dto.VentaResponse;
import com.flashpage.app.venta.model.EstadoVenta;
import com.flashpage.app.venta.model.Origen;
import com.flashpage.app.venta.model.Venta;
import com.flashpage.app.venta.repository.VentaSpecification;
import com.flashpage.app.venta.service.VentaService;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public PageResponse<VentaResponse> obtener(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String cliente,
            @RequestParam(required = false) Long asesorId,
            @RequestParam(required = false) Long supervisorId,
            @RequestParam(required = false) Long jefeDeSupervisorId,
            @RequestParam(required = false) Origen origen,
            @RequestParam(required = false) EstadoVenta estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        Specification<Venta> spec = Specification.unrestricted();

        if (estado != null) spec = spec.and(VentaSpecification.estado(estado));
        if (cliente != null && !cliente.isBlank()) spec = spec.and(VentaSpecification.clienteNombreContains(cliente));
        if (asesorId != null) spec = spec.and(VentaSpecification.asesorId(asesorId));
        if (supervisorId != null) spec = spec.and(VentaSpecification.supervisorId(supervisorId));
        if (jefeDeSupervisorId != null) spec = spec.and(VentaSpecification.jefeDeSupervisorId(jefeDeSupervisorId));
        if (origen != null) spec = spec.and(VentaSpecification.origen(origen));
        if (desde != null) spec = spec.and(VentaSpecification.creadoDesde(desde));
        if (hasta != null) spec = spec.and(VentaSpecification.creadoHasta(hasta));

        return PageResponse.from(ventaService.obtenerVentas(spec, page, size));
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public VentaDetalleResponse obtenerDetalle(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        return ventaService.obtenerDetalleVenta(id, usuario);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void crear(@RequestBody VentaRequest req, @AuthenticationPrincipal Usuario usuario) {
        ventaService.crearVenta(req, usuario);
    }

    @GetMapping("/mapa")
    @ResponseStatus(HttpStatus.OK)
    public List<VentaMapaResponse> obtenerMapa(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ventaService.getVentasMapa(desde, hasta);
    }

    @PatchMapping("/estados")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cambiarEstados(@RequestBody List<CambioEstadoRequest> cambios) {
        ventaService.cambiarEstados(cambios);
    }
}
