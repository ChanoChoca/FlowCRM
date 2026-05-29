package com.flashpage.app.venta.model;

import java.time.LocalDateTime;

import com.flashpage.app.catalogo.model.Central;
import com.flashpage.app.catalogo.model.Producto;
import com.flashpage.app.catalogo.model.Promo;
import com.flashpage.app.usuario.model.Usuario;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

@Entity
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario asesor;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "promo_id", nullable = false)
    private Promo promo;

    @ManyToOne
    @JoinColumn(name = "central_id", nullable = false)
    private Central central;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Ani ani;

    @Column(nullable = false)
    private Integer decos;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditoriaHorario contacto;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "pago_id", nullable = false)
    private Pago pago;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Enumerated(EnumType.STRING)
    private Origen origen;

    @Column(nullable = false)
    private Boolean activa = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoVenta estado = EstadoVenta.PENDIENTE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(nullable = false)
    private LocalDateTime actualizadoEn;

    @PrePersist
    void onPersist() { creadoEn = actualizadoEn = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate() { actualizadoEn = LocalDateTime.now(); }

    public Venta() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Usuario getAsesor() { return asesor; }
    public void setAsesor(Usuario asesor) { this.asesor = asesor; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }
    public Promo getPromo() { return promo; }
    public void setPromo(Promo promo) { this.promo = promo; }
    public Central getCentral() { return central; }
    public void setCentral(Central central) { this.central = central; }
    public Ani getAni() { return ani; }
    public void setAni(Ani ani) { this.ani = ani; }
    public Integer getDecos() { return decos; }
    public void setDecos(Integer decos) { this.decos = decos; }
    public AuditoriaHorario getContacto() { return contacto; }
    public void setContacto(AuditoriaHorario contacto) { this.contacto = contacto; }
    public Pago getPago() { return pago; }
    public void setPago(Pago pago) { this.pago = pago; }
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    public Origen getOrigen() { return origen; }
    public void setOrigen(Origen origen) { this.origen = origen; }
    public Boolean getActiva() { return activa; }
    public void setActiva(Boolean activa) { this.activa = activa; }
    public EstadoVenta getEstado() { return estado; }
    public void setEstado(EstadoVenta estado) { this.estado = estado; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}
