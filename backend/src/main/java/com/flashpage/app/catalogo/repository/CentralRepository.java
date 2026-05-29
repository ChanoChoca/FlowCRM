package com.flashpage.app.catalogo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flashpage.app.catalogo.model.Central;

public interface CentralRepository extends JpaRepository<Central, Long> {
    List<Central> findByActivoTrue();
}
