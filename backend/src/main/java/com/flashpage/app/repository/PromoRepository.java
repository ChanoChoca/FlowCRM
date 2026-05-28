package com.flashpage.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flashpage.app.model.Promo;

public interface PromoRepository extends JpaRepository<Promo, Long> {
    List<Promo> findByActivoTrue();
}
