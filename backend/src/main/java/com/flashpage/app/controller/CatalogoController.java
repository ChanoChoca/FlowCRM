package com.flashpage.app.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.flashpage.app.model.Provincia;
import com.flashpage.app.model.dto.CatalogosResponse;
import com.flashpage.app.service.CatalogoService;

@RestController
@RequestMapping("/api/catalogos")
public class CatalogoController {

    private final CatalogoService catalogoService;

    public CatalogoController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public CatalogosResponse obtenerCatalogos() {
        return catalogoService.obtenerCatalogos();
    }

    @GetMapping("/provincias")
    @ResponseStatus(HttpStatus.OK)
    public List<Provincia> obtenerProvincias() {
        return catalogoService.obtenerProvincias();
    }
}