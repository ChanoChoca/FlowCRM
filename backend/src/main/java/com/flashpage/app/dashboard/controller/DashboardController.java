package com.flashpage.app.dashboard.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.flashpage.app.dashboard.dto.Dashboard;
import com.flashpage.app.dashboard.dto.DashboardDTOs.ActividadUsuario;
import com.flashpage.app.dashboard.dto.DashboardDTOs.RankingOpcional;
import com.flashpage.app.dashboard.dto.DashboardFiltro;
import com.flashpage.app.dashboard.service.DashboardService;
import com.flashpage.app.shared.model.PageResponse;
import com.flashpage.app.usuario.model.Usuario;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ASESOR','SUPERVISOR','JEFE_DE_SUPERVISOR','GERENTE','LIDER','ADMINISTRACION_RRHH_COBRANZA')")
    public ResponseEntity<Dashboard> getDashboard(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long centralId,
            @RequestParam(required = false) Long productoId,
            @RequestParam(required = false) Long promoId,
            @RequestParam(required = false) String origen) {
        DashboardFiltro filtro = DashboardFiltro.of(desde, hasta, centralId, productoId, promoId, origen);
        return ResponseEntity.ok(dashboardService.buildDashboard(usuario, filtro));
    }

    @PostMapping("/ranking/toggle")
    @PreAuthorize("hasRole('ASESOR')")
    public ResponseEntity<RankingOpcional> toggleRanking(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(dashboardService.toggleRankingOptional(usuario));
    }

    @GetMapping("/actividad-usuarios")
    @PreAuthorize("hasAnyRole('LIDER','ADMINISTRACION_RRHH_COBRANZA')")
    public PageResponse<ActividadUsuario> getActividadUsuarios(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "ventasMes") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return PageResponse.from(dashboardService.getActividadUsuarios(usuario, page, size, sortBy, sortDir));
    }
}
