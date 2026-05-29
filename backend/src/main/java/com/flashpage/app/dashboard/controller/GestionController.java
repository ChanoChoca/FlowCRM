package com.flashpage.app.dashboard.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.flashpage.app.dashboard.dto.GestionDTOs.ConversionAsesorResumen;
import com.flashpage.app.dashboard.dto.GestionDTOs.ConversionPropiaResumen;
import com.flashpage.app.dashboard.service.GestionService;
import com.flashpage.app.usuario.model.Usuario;

@RestController
@RequestMapping("/api/gestiones")
public class GestionController {

    private final GestionService gestionService;

    public GestionController(GestionService gestionService) {
        this.gestionService = gestionService;
    }

    @GetMapping("/mis-estadisticas")
    @PreAuthorize("hasRole('ASESOR')")
    public ResponseEntity<ConversionPropiaResumen> getMisEstadisticas(
            @AuthenticationPrincipal Usuario asesor,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        LocalDate hoy = LocalDate.now();
        return ResponseEntity.ok(gestionService.getConversionPropia(asesor.getId(),
                desde != null ? desde : hoy.withDayOfMonth(1), hasta != null ? hasta : hoy));
    }

    @GetMapping("/equipo/conversion")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<List<ConversionAsesorResumen>> getConversionEquipo(
            @AuthenticationPrincipal Usuario supervisor,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        LocalDate hoy = LocalDate.now();
        return ResponseEntity.ok(gestionService.getConversionPorEquipo(supervisor.getId(),
                desde != null ? desde : hoy.withDayOfMonth(1), hasta != null ? hasta : hoy));
    }
}
