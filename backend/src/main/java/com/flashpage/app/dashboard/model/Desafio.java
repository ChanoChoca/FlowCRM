package com.flashpage.app.dashboard.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.flashpage.app.catalogo.model.Producto;
import com.flashpage.app.usuario.model.Usuario;
import com.flashpage.app.venta.model.AuditoriaHorario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "desafio")
public class Desafio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id", nullable = false)
    private Usuario supervisor;

    @Column(nullable = false, length = 120)
    private String titulo;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false)
    private Integer metaVentas;

    @Enumerated(EnumType.STRING)
    private AuditoriaHorario horario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @Column(nullable = false)
    private LocalDate fechaInicio;

    @Column(nullable = false)
    private LocalDate fechaVencimiento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DesafioEstado estado = DesafioEstado.ACTIVO;

    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(nullable = false)
    private LocalDateTime actualizadoEn;

    @PrePersist
    void onPersist() { creadoEn = actualizadoEn = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate() { actualizadoEn = LocalDateTime.now(); }

    public Desafio() {}

    public Desafio(Usuario supervisor, String titulo, String descripcion, Integer metaVentas,
            AuditoriaHorario horario, Producto producto, LocalDate fechaInicio,
            LocalDate fechaVencimiento, DesafioEstado estado) {
        this.supervisor = supervisor; this.titulo = titulo; this.descripcion = descripcion;
        this.metaVentas = metaVentas; this.horario = horario; this.producto = producto;
        this.fechaInicio = fechaInicio; this.fechaVencimiento = fechaVencimiento; this.estado = estado;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Usuario getSupervisor() { return supervisor; }
    public void setSupervisor(Usuario supervisor) { this.supervisor = supervisor; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Integer getMetaVentas() { return metaVentas; }
    public void setMetaVentas(Integer metaVentas) { this.metaVentas = metaVentas; }
    public AuditoriaHorario getHorario() { return horario; }
    public void setHorario(AuditoriaHorario horario) { this.horario = horario; }
    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }
    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
    public DesafioEstado getEstado() { return estado; }
    public void setEstado(DesafioEstado estado) { this.estado = estado; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}
