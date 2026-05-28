package com.flashpage.app.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flashpage.app.model.Provincia;
import com.flashpage.app.model.dto.CatalogosResponse;
import com.flashpage.app.repository.CentralRepository;
import com.flashpage.app.repository.ProductoRepository;
import com.flashpage.app.repository.PromoRepository;
import com.flashpage.app.repository.ProvinciaRepository;

@Service
@Transactional(readOnly = true)
public class CatalogoService {

    private final ProductoRepository productoRepository;
    private final PromoRepository promoRepository;
    private final ProvinciaRepository provinciaRepository;
    private final CentralRepository centralRepository;

    public CatalogoService(ProductoRepository productoRepository,
            PromoRepository promoRepository,
            ProvinciaRepository provinciaRepository,
            CentralRepository centralRepository) {
        this.productoRepository = productoRepository;
        this.promoRepository = promoRepository;
        this.provinciaRepository = provinciaRepository;
        this.centralRepository = centralRepository;
    }

    public CatalogosResponse obtenerCatalogos() {
        return new CatalogosResponse(
                productoRepository.findByActivoTrue(),
                promoRepository.findByActivoTrue(),
                provinciaRepository.findAll(),
                centralRepository.findByActivoTrue());
    }

    public List<Provincia> obtenerProvincias() {
        return provinciaRepository.findAll();
    }
}
