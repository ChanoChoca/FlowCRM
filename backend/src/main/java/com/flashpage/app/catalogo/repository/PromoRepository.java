package com.flashpage.app.catalogo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flashpage.app.catalogo.model.Promo;

public interface PromoRepository extends JpaRepository<Promo, Long> {
    List<Promo> findByActivoTrue();
}
