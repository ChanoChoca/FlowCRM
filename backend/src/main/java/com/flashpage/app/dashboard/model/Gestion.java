package com.flashpage.app.dashboard.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.flashpage.app.catalogo.model.Central;
import com.flashpage.app.catalogo.model.Producto;
import com.flashpage.app.usuario.model.Usuario;
import com.flashpage.app.venta.model.Cliente;
import com.flashpage.app.venta.model.Origen;
import com.flashpage.app.venta.model.Venta;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

@Entity
public class Gestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asesor_id", nullable = false)
    private Usuario asesor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Column(length = 120)
    private String prospectoNombre;

    @Column(length = 255)
    private String prospectoTelefono;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "central_id")
    private Central central;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @Enumerated(EnumType.STRING)
    private Origen origen;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GestionEstado estado = GestionEstado.PENDIENTE;

    @Column(nullable = false)
    private LocalDate fechaGestion;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", unique = true)
    private Venta venta;

    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(nullable = false)
    private LocalDateTime actualizadoEn;

    @PrePersist
    void onPersist() { creadoEn = actualizadoEn = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate() { actualizadoEn = LocalDateTime.now(); }

    public Gestion() {}

    public Gestion(Usuario asesor, Cliente cliente, String prospectoNombre, String prospectoTelefono,
            Central central, Producto producto, GestionEstado estado, LocalDate fechaGestion,
            String observaciones, Venta venta) {
        this.asesor = asesor; this.cliente = cliente; this.prospectoNombre = prospectoNombre;
        this.prospectoTelefono = prospectoTelefono; this.central = central; this.producto = producto;
        this.estado = estado; this.fechaGestion = fechaGestion; this.observaciones = observaciones;
        this.venta = venta;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Usuario getAsesor() { return asesor; }
    public void setAsesor(Usuario asesor) { this.asesor = asesor; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public String getProspectoNombre() { return prospectoNombre; }
    public void setProspectoNombre(String prospectoNombre) { this.prospectoNombre = prospectoNombre; }
    public String getProspectoTelefono() { return prospectoTelefono; }
    public void setProspectoTelefono(String prospectoTelefono) { this.prospectoTelefono = prospectoTelefono; }
    public Central getCentral() { return central; }
    public void setCentral(Central central) { this.central = central; }
    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
    public Origen getOrigen() { return origen; }
    public void setOrigen(Origen origen) { this.origen = origen; }
    public GestionEstado getEstado() { return estado; }
    public void setEstado(GestionEstado estado) { this.estado = estado; }
    public LocalDate getFechaGestion() { return fechaGestion; }
    public void setFechaGestion(LocalDate fechaGestion) { this.fechaGestion = fechaGestion; }
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    public Venta getVenta() { return venta; }
    public void setVenta(Venta venta) { this.venta = venta; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}
