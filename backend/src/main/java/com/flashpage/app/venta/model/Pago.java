package com.flashpage.app.venta.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private Boolean debitoAutomatico;

    @Enumerated(EnumType.STRING)
    private TipoTarjeta tipoTarjeta;

    @Column(nullable = false) private String banco;
    @Column(nullable = false) private String numeroTarjeta;
    @Column(nullable = false) private String titular;

    public Pago() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Boolean getDebitoAutomatico() { return debitoAutomatico; }
    public void setDebitoAutomatico(Boolean debitoAutomatico) { this.debitoAutomatico = debitoAutomatico; }
    public TipoTarjeta getTipoTarjeta() { return tipoTarjeta; }
    public void setTipoTarjeta(TipoTarjeta tipoTarjeta) { this.tipoTarjeta = tipoTarjeta; }
    public String getBanco() { return banco; }
    public void setBanco(String banco) { this.banco = banco; }
    public String getNumeroTarjeta() { return numeroTarjeta; }
    public void setNumeroTarjeta(String numeroTarjeta) { this.numeroTarjeta = numeroTarjeta; }
    public String getTitular() { return titular; }
    public void setTitular(String titular) { this.titular = titular; }
}
