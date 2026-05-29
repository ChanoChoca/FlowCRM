package com.flashpage.app.comunicacion.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.flashpage.app.comunicacion.dto.AnuncioResponse;
import com.flashpage.app.comunicacion.dto.CreateAnuncioRequest;
import com.flashpage.app.comunicacion.service.AnuncioService;
import com.flashpage.app.usuario.model.Usuario;

@RestController
@RequestMapping("/api/anuncios")
public class AnuncioController {

    private final AnuncioService anuncioService;

    public AnuncioController(AnuncioService anuncioService) {
        this.anuncioService = anuncioService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AnuncioResponse publicar(@RequestBody CreateAnuncioRequest req, @AuthenticationPrincipal Usuario usuario) {
        return anuncioService.publicar(req, usuario);
    }

    @GetMapping
    public List<AnuncioResponse> listar(@AuthenticationPrincipal Usuario usuario) {
        return anuncioService.listar(usuario);
    }

    @PatchMapping("/{id}/leido")
    public AnuncioResponse marcarLeido(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        return anuncioService.marcarLeido(id, usuario);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        anuncioService.eliminar(id, usuario);
    }

    @GetMapping("/cuenta-no-leidos")
    public ResponseEntity<Long> cuentaNoLeidos(@AuthenticationPrincipal Usuario usuario) {
        long noLeidos = anuncioService.listar(usuario).stream().filter(a -> !a.leido()).count();
        return ResponseEntity.ok(noLeidos);
    }
}
