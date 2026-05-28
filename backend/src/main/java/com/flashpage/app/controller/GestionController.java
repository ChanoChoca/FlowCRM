package com.flashpage.app.controller;

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

import com.flashpage.app.model.Usuario;
import com.flashpage.app.model.dto.dashboard.GestionDTOs.ConversionAsesorResumen;
import com.flashpage.app.model.dto.dashboard.GestionDTOs.ConversionPropiaResumen;
import com.flashpage.app.service.GestionService;

@RestController
@RequestMapping("/api/gestiones")
public class GestionController {

    private final GestionService gestionService;

    public GestionController(GestionService gestionService) {
        this.gestionService = gestionService;
    }

    /**
     * Tasa de conversión personal del asesor autenticado (mes actual por defecto).
     */
    @GetMapping("/mis-estadisticas")
    @PreAuthorize("hasRole('ASESOR')")
    public ResponseEntity<ConversionPropiaResumen> getMisEstadisticas(
            @AuthenticationPrincipal Usuario asesor,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        LocalDate hoy = LocalDate.now();
        LocalDate desdeEfectivo = desde != null ? desde : hoy.withDayOfMonth(1);
        LocalDate hastaEfectivo = hasta != null ? hasta : hoy;

        return ResponseEntity.ok(
                gestionService.getConversionPropia(asesor.getId(), desdeEfectivo, hastaEfectivo));
    }

    /**
     * Tasa de conversión desglosada por asesor del equipo.
     * Solo el SUPERVISOR de ese equipo puede consultarla.
     */
    @GetMapping("/equipo/conversion")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<List<ConversionAsesorResumen>> getConversionEquipo(
            @AuthenticationPrincipal Usuario supervisor,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        LocalDate hoy = LocalDate.now();
        LocalDate desdeEfectivo = desde != null ? desde : hoy.withDayOfMonth(1);
        LocalDate hastaEfectivo = hasta != null ? hasta : hoy;

        return ResponseEntity.ok(
                gestionService.getConversionPorEquipo(
                        supervisor.getId(), desdeEfectivo, hastaEfectivo));
    }
}