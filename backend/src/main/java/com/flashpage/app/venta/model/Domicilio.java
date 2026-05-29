package com.flashpage.app.venta.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;

import com.flashpage.app.catalogo.model.Provincia;

@Entity
public class Domicilio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private String calle;
    @Column(nullable = false) private String numero;
    private String piso;
    private String depto;

    @Column(nullable = false) private String entreCalles1;
    @Column(nullable = false) private String entreCalles2;
    @Column(nullable = false) private String entreCalles3;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String observaciones;

    private String coordenadas;

    @Column(nullable = false) private String localidad;
    @Column(nullable = false) private String codigoPostal;

    @ManyToOne
    @JoinColumn(name = "provincia_id")
    private Provincia provincia;

    public Domicilio() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCalle() { return calle; }
    public void setCalle(String calle) { this.calle = calle; }
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }
    public String getPiso() { return piso; }
    public void setPiso(String piso) { this.piso = piso; }
    public String getDepto() { return depto; }
    public void setDepto(String depto) { this.depto = depto; }
    public String getEntreCalles1() { return entreCalles1; }
    public void setEntreCalles1(String entreCalles1) { this.entreCalles1 = entreCalles1; }
    public String getEntreCalles2() { return entreCalles2; }
    public void setEntreCalles2(String entreCalles2) { this.entreCalles2 = entreCalles2; }
    public String getEntreCalles3() { return entreCalles3; }
    public void setEntreCalles3(String entreCalles3) { this.entreCalles3 = entreCalles3; }
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    public String getCoordenadas() { return coordenadas; }
    public void setCoordenadas(String coordenadas) { this.coordenadas = coordenadas; }
    public String getLocalidad() { return localidad; }
    public void setLocalidad(String localidad) { this.localidad = localidad; }
    public String getCodigoPostal() { return codigoPostal; }
    public void setCodigoPostal(String codigoPostal) { this.codigoPostal = codigoPostal; }
    public Provincia getProvincia() { return provincia; }
    public void setProvincia(Provincia provincia) { this.provincia = provincia; }
}
