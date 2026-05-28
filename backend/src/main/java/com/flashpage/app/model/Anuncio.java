package com.flashpage.app.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

@Entity
public class Anuncio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "autor_id")
    private Usuario autor;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, length = 3000)
    private String contenido;

    /** Roles destinatarios (vacío = todos). */
    @ElementCollection
    @CollectionTable(name = "anuncio_roles_destino", joinColumns = @JoinColumn(name = "anuncio_id"))
    @Column(name = "rol")
    @Enumerated(EnumType.STRING)
    private List<Rol> rolesDestino = new ArrayList<>();

    /** IDs de usuarios que ya leyeron el anuncio. */
    @ElementCollection
    @CollectionTable(name = "anuncio_leido_por", joinColumns = @JoinColumn(name = "anuncio_id"))
    @Column(name = "usuario_id")
    private List<Long> leidoPor = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(nullable = false)
    private LocalDateTime actualizadoEn;

    @PrePersist
    void onPersist() {
        creadoEn = actualizadoEn = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        actualizadoEn = LocalDateTime.now();
    }

    public Anuncio() {
    }

    public Long getId() {
        return id;
    }

    public Usuario getAutor() {
        return autor;
    }

    public void setAutor(Usuario autor) {
        this.autor = autor;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }

    public List<Rol> getRolesDestino() {
        return rolesDestino;
    }

    public void setRolesDestino(List<Rol> rolesDestino) {
        this.rolesDestino = rolesDestino;
    }

    public List<Long> getLeidoPor() {
        return leidoPor;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setLeidoPor(List<Long> leidoPor) {
        this.leidoPor = leidoPor;
    }

    public LocalDateTime getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(LocalDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }

    public LocalDateTime getActualizadoEn() {
        return actualizadoEn;
    }

    public void setActualizadoEn(LocalDateTime actualizadoEn) {
        this.actualizadoEn = actualizadoEn;
    }
}
