package com.flashpage.app.model.dto;

import java.util.List;

import com.flashpage.app.model.Central;
import com.flashpage.app.model.Producto;
import com.flashpage.app.model.Promo;
import com.flashpage.app.model.Provincia;

public class CatalogosResponse {

    private List<Producto> productos;
    private List<Promo> promos;
    private List<Provincia> provincias;
    private List<Central> centrales;

    public CatalogosResponse(List<Producto> productos,
                             List<Promo> promos,
                             List<Provincia> provincias,
                             List<Central> centrales) {
        this.productos = productos;
        this.promos = promos;
        this.provincias = provincias;
        this.centrales = centrales;
    }

    public List<Producto> getProductos() { return productos; }
    public List<Promo> getPromos() { return promos; }
    public List<Provincia> getProvincias() { return provincias; }
    public List<Central> getCentrales() { return centrales; }
}