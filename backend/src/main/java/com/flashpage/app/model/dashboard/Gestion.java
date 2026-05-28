package com.flashpage.app.model.dashboard;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.flashpage.app.model.Central;
import com.flashpage.app.model.Cliente;
import com.flashpage.app.model.Origen;
import com.flashpage.app.model.Producto;
import com.flashpage.app.model.Usuario;
import com.flashpage.app.model.Venta;

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

/**
 * Gestión: unidad de trabajo del asesor sobre un prospecto.
 *
 * Una Gestión representa el intento de contactar a un cliente potencial
 * y puede o no resultar en una Venta. La tasa de conversión real se
 * calcula como: gestiones con estado VENDIDO / total de gestiones × 100.
 *
 * Relación con Venta:
 * - Una Gestión con estado VENDIDO tiene exactamente una Venta asociada.
 * - Una Venta puede o no tener una Gestión que la originó.
 * (ventas directas sin gestión previa siguen siendo válidas)
 *
 * Migración SQL:
 * ─────────────────────────────────────────────────────────────────────
 * CREATE TABLE gestion (
 * id BIGINT AUTO_INCREMENT PRIMARY KEY,
 * asesor_id BIGINT NOT NULL,
 * cliente_id BIGINT,
 * -- datos del prospecto si aún no es cliente registrado
 * prospecto_nombre VARCHAR(120),
 * prospecto_telefono VARCHAR(255),
 * -- segmentación
 * central_id BIGINT,
 * producto_id BIGINT,
 * origen VARCHAR(20),
 * -- ciclo de vida
 * estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
 * fecha_gestion DATE NOT NULL,
 * observaciones VARCHAR(500),
 * -- venta resultante (null si no cerró)
 * venta_id BIGINT UNIQUE,
 * -- auditoría
 * creado_en DATETIME(6) NOT NULL,
 * actualizado_en DATETIME(6) NOT NULL,
 * FOREIGN KEY (asesor_id) REFERENCES usuario(id),
 * FOREIGN KEY (cliente_id) REFERENCES cliente(id),
 * FOREIGN KEY (central_id) REFERENCES central(id),
 * FOREIGN KEY (producto_id) REFERENCES producto(id),
 * FOREIGN KEY (venta_id) REFERENCES venta(id)
 * );
 * ─────────────────────────────────────────────────────────────────────
 */
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
    void onPersist() {
        creadoEn = actualizadoEn = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        actualizadoEn = LocalDateTime.now();
    }

    public Gestion() {
    }

    public Gestion(Usuario asesor, Cliente cliente, String prospectoNombre, String prospectoTelefono, Central central,
            Producto producto, GestionEstado estado, LocalDate fechaGestion, String observaciones, Venta venta) {
        this.asesor = asesor;
        this.cliente = cliente;
        this.prospectoNombre = prospectoNombre;
        this.prospectoTelefono = prospectoTelefono;
        this.central = central;
        this.producto = producto;
        this.estado = estado;
        this.fechaGestion = fechaGestion;
        this.observaciones = observaciones;
        this.venta = venta;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getAsesor() {
        return asesor;
    }

    public void setAsesor(Usuario asesor) {
        this.asesor = asesor;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public String getProspectoNombre() {
        return prospectoNombre;
    }

    public void setProspectoNombre(String prospectoNombre) {
        this.prospectoNombre = prospectoNombre;
    }

    public String getProspectoTelefono() {
        return prospectoTelefono;
    }

    public void setProspectoTelefono(String prospectoTelefono) {
        this.prospectoTelefono = prospectoTelefono;
    }

    public Central getCentral() {
        return central;
    }

    public void setCentral(Central central) {
        this.central = central;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public Origen getOrigen() {
        return origen;
    }

    public void setOrigen(Origen origen) {
        this.origen = origen;
    }

    public GestionEstado getEstado() {
        return estado;
    }

    public void setEstado(GestionEstado estado) {
        this.estado = estado;
    }

    public LocalDate getFechaGestion() {
        return fechaGestion;
    }

    public void setFechaGestion(LocalDate fechaGestion) {
        this.fechaGestion = fechaGestion;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public Venta getVenta() {
        return venta;
    }

    public void setVenta(Venta venta) {
        this.venta = venta;
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